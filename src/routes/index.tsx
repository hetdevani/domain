import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { MODULES } from '../types';

// Lazy load pages
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const SignupPage = lazy(() => import('../pages/auth/SignupPage'));
const LandingPage = lazy(() => import('../pages/landing/LandingPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const UserManagementPage = lazy(() => import('../pages/users/UserManagementPage'));
const CustomerManagementPage = lazy(() => import('../pages/customers/CustomerManagementPage'));
const MonitorPage = lazy(() => import('../pages/monitors/MonitorPage'));
const IncidentPage = lazy(() => import('../pages/monitors/IncidentPage'));
const PlanManagementPage = lazy(() => import('../pages/plans/PlanManagementPage'));
const MasterManagementPage = lazy(() => import('../pages/master/MasterManagementPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));

const ProtectedRoute: React.FC<{
    children: React.ReactNode;
    module?: number;
    action?: string
}> = ({ children, module, action = 'list' }) => {
    const { isAuthenticated, isLoading, hasPermission } = useAuth();

    if (isLoading) return null;

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (module && !hasPermission(module, action)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />

                <Route
                    path="/users"
                    element={
                        <ProtectedRoute module={MODULES.USER}>
                            <UserManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/customers"
                    element={
                        <ProtectedRoute module={MODULES.USER}>
                            <CustomerManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/monitors"
                    element={
                        <ProtectedRoute module={MODULES.MONITOR}>
                            <MonitorPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/incidents"
                    element={
                        <ProtectedRoute module={MODULES.INCIDENT}>
                            <IncidentPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/plans"
                    element={
                        <ProtectedRoute module={MODULES.PLAN}>
                            <PlanManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/masters"
                    element={
                        <ProtectedRoute module={MODULES.MASTER}>
                            <MasterManagementPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute module={MODULES.SETTING}>
                            <SettingsPage />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes >
    );
};

export default AppRoutes;
