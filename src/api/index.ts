import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:1502/api';

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Since we are using HttpOnly cookies, we don't strictly need to send the Authorization header.
        // Sending a stale token from localStorage can cause 401s if the cookie is newer/different.
        /*
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        */
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // If the error is 401 and not a retry, try to refresh token
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;

            try {
                // Refresh token is now in HttpOnly cookie, so we don't need to pass it in body
                // but we still hit the refresh endpoint
                const response = await api.post('/web/auth/refresh');
                const { token } = response.data.data;

                if (token) {
                    localStorage.setItem('token', token);
                }

                // If it succeeds, the new token is now in the cookie
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token failed, clear storage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const errorMessage = (error.response?.data as any)?.message || 'Something went wrong';
        return Promise.reject({ ...error, message: errorMessage });
    }
);

export default api;
