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

const getValidStoredToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
        return null;
    }
    return token;
};

// Request interceptor
api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getValidStoredToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else if (config.headers.Authorization) {
            delete config.headers.Authorization;
        }
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
        const status = error.response?.status;
        const errorCode = (error.response?.data as any)?.code;

        // If the error is 401 or specific error codes, handle accordingly
        const isAuthEndpoint = originalRequest.url?.includes('/auth/');
        
        // Check for common unauthorized status codes and error codes
        const isUnauthorized = 
            status === 401 || 
            (status === 403 && errorCode === 'INSUFFICIENT_PERMISSION') ||
            (status === 422 && errorCode === 'MISSING_TOKEN') ||
            errorCode === 'E_UNAUTHORIZED' ||
            errorCode === 'INVALID_TOKEN' ||
            errorCode === 'USER_NOT_FOUND' ||
            errorCode === 'USER_NOT_ACTIVE';

        const shouldTryRefresh = isUnauthorized && !originalRequest._retry && !isAuthEndpoint;

        if (shouldTryRefresh) {
            originalRequest._retry = true;

            try {
                // Refresh token is now in HttpOnly cookie, so we don't need to pass it in body
                // but we still hit the refresh endpoint
                const response = await api.post('/web/auth/refresh');
                const { token } = response.data.data;

                if (token) {
                    localStorage.setItem('token', token);
                    // Update headers for the retry
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
                
                throw new Error('Refresh failed - No token returned');
            } catch (refreshError) {
                // Refresh token failed, clear storage and redirect to login
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                localStorage.removeItem('adminToken');
                localStorage.removeItem('adminRefreshToken');
                localStorage.removeItem('adminUser');
                
                // Use window.location.replace to prevent back button from going back to protected page
                window.location.replace('/login');
                return Promise.reject(refreshError);
            }
        }

        // If it's an auth error but we already retried or it's an auth endpoint
        if (isUnauthorized && (originalRequest._retry || isAuthEndpoint)) {
            localStorage.clear(); // Clear all to be safe
            window.location.replace('/login');
        }

        // Handle other errors
        const errorMessage = (error.response?.data as any)?.message || 'Something went wrong';
        return Promise.reject({ ...error, message: errorMessage });
    }
);

export default api;
