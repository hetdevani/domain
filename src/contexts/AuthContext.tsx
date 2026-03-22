import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { IUser, PermissionModule } from '../types';
import { MODULES, USER_TYPES } from '../types';

interface AuthContextType {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<string>;
    verify2FA: (username: string, otp: string) => Promise<void>;
    verifyEmailOTP: (username: string, otp: string) => Promise<void>;
    logout: () => void;
    hasPermission: (module: number, action: string) => boolean;
    registerUser: (userData: any) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    impersonate: (userId: string) => Promise<void>;
    stopImpersonating: () => void;
    isImpersonated: boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getValidStoredToken = (): string | null => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') {
        return null;
    }
    return token;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState<string | null>(getValidStoredToken());
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user');
                setUser(null);
            }
        } else {
            if (storedUser && !token) {
                localStorage.removeItem('user');
            }
            setUser(null);
        }
        setIsLoading(false);
    }, [token]);

    const login = async (credentials: any): Promise<string> => {
        try {
            const response = await api.post('/web/auth/login', credentials);

            // Check for multifactor steps requiring further action
            if (response.data.data?.step) {
                return response.data.data.step;
            }

            const { token, refreshToken, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
            
            // Redirect based on user type
            const userType = Number(user?.type);
            if (userType === USER_TYPES.CUSTOMER) {
                navigate('/status-pages');
            } else {
                navigate('/dashboard');
            }
            return 'success';
        } catch (error) {
            throw error;
        }
    };

    const verify2FA = async (username: string, otp: string) => {
        try {
            if (!username || !otp || otp.trim().length < 6) {
                throw new Error('Please enter a valid 6-digit OTP.');
            }
            const response = await api.post('/web/auth/authenticate-otp-verification', { username, otp });
            const { token, refreshToken, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            // Redirect based on user type
            const userType = Number(user?.type);
            if (userType === USER_TYPES.CUSTOMER) {
                navigate('/status-pages');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            throw error;
        }
    };

    const verifyEmailOTP = async (username: string, otp: string) => {
        try {
            if (!username || !otp || otp.trim().length < 6) {
                throw new Error('Please enter a valid 6-digit OTP.');
            }
            const response = await api.post('/web/auth/login-with-otp', { username, otp });
            const { token, refreshToken, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            // Redirect based on user type
            const userType = Number(user?.type);
            if (userType === USER_TYPES.CUSTOMER) {
                navigate('/status-pages');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            throw error;
        }
    };

    const registerUser = async (userData: any): Promise<void> => {
        try {
            await api.post('/web/auth/signup', userData);
        } catch (error) {
            throw error;
        }
    };

    const forgotPassword = async (email: string): Promise<void> => {
        try {
            await api.post('/web/auth/forgot-password', { username: email });
        } catch (error) {
            throw error;
        }
    };

    const impersonate = async (userId: string) => {
        try {
            // 1. Store current admin session to "park" it
            const currentToken = localStorage.getItem('token');
            const currentRefreshToken = localStorage.getItem('refreshToken');
            const currentUser = localStorage.getItem('user');

            if (currentToken) localStorage.setItem('adminToken', currentToken);
            if (currentRefreshToken) localStorage.setItem('adminRefreshToken', currentRefreshToken);
            if (currentUser) localStorage.setItem('adminUser', currentUser);

            // 2. Call impersonation API
            const response = await api.post(`/web/auth/impersonate/${userId}`);
            const { token, refreshToken, user: impersonatedUser } = response.data.data;

            // 3. Swap main tokens with impersonated ones
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(impersonatedUser));

            setToken(token);
            setUser(impersonatedUser);

            // 4. Redirect to home or status pages
            navigate('/dashboard');
        } catch (error) {
            // Restore admin session if impersonation fails
            const adminToken = localStorage.getItem('adminToken');
            if (adminToken) {
                localStorage.setItem('token', adminToken);
                setToken(adminToken);
            }
            throw error;
        }
    };

    const stopImpersonating = () => {
        const adminToken = localStorage.getItem('adminToken');
        const adminRefreshToken = localStorage.getItem('adminRefreshToken');
        const adminUser = localStorage.getItem('adminUser');

        if (adminToken && adminUser) {
            // Restore parked admin session
            localStorage.setItem('token', adminToken);
            localStorage.setItem('refreshToken', adminRefreshToken || '');
            localStorage.setItem('user', adminUser);

            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');

            setToken(adminToken);
            setUser(JSON.parse(adminUser));
            navigate('/dashboard');
        } else {
            // Fallback to logout if no admin session found
            logout();
        }
    };

    const logout = useCallback(async () => {
        try {
            await api.post('/web/auth/logout');
        } catch (e) {
            console.error('Logout failed', e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRefreshToken');
            localStorage.removeItem('adminUser');
            setToken(null);
            setUser(null);
            navigate('/login');
        }
    }, [navigate]);


    const hasPermission = (moduleNum: number, action: string) => {
        if (!user) return false;

        const userType = Number(user.type);

        // Master Admin has all permissions
        if (userType === USER_TYPES.MASTER_ADMIN) return true;

        // Customers (type 3) can always access these modules by default
        if (userType === USER_TYPES.CUSTOMER && [MODULES.STATUS_PAGE, MODULES.MONITOR, MODULES.INCIDENT, MODULES.DASH_BOARD].includes(moduleNum)) {
            return true;
        }

        let permissions: PermissionModule[] = [];
        if (Array.isArray(user.accessPermission)) {
            permissions = user.accessPermission;
        } else if (typeof (user.accessPermission as any) === 'string' && (user.accessPermission as any).trim() !== '') {
            try {
                permissions = JSON.parse(user.accessPermission as any);
            } catch (e) {
                console.error("Failed to parse accessPermission in hasPermission:", e);
                permissions = [];
            }
        }

        if (!permissions || !Array.isArray(permissions)) return false;

        const modulePermission = permissions.find(
            (p: PermissionModule) => Number(p.module) === Number(moduleNum)
        );

        if (!modulePermission || !modulePermission.permissions) return false;

        const actionKey = action.toLowerCase();
        return !!(modulePermission.permissions as any)[actionKey];
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        verify2FA,
        verifyEmailOTP,
        logout,
        hasPermission,
        registerUser,
        forgotPassword,
        impersonate,
        stopImpersonating,
        isImpersonated: !!localStorage.getItem('adminToken'),
    };


    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
