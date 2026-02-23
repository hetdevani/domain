import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import type { IUser, PermissionModule } from '../types';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<IUser | null>(null);
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
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
            navigate('/dashboard');
            return 'success';
        } catch (error) {
            throw error;
        }
    };

    const verify2FA = async (username: string, otp: string) => {
        try {
            const response = await api.post('/web/auth/authenticate-otp-verification', { username, otp });
            const { token, refreshToken, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
            navigate('/dashboard');
        } catch (error) {
            throw error;
        }
    };

    const verifyEmailOTP = async (username: string, otp: string) => {
        try {
            const response = await api.post('/web/auth/login-with-otp', { username, otp });
            const { token, refreshToken, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
            navigate('/dashboard');
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
            await api.post('/web/auth/forgot-password', { email });
        } catch (error) {
            throw error;
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
            setToken(null);
            setUser(null);
            navigate('/login');
        }
    }, [navigate]);

    const hasPermission = (moduleNum: number, action: string) => {
        if (!user) return false;

        // Master Admin has all permissions
        if (user.type === 1) return true;

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
