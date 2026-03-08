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
const MonitorDetailPage = lazy(() => import('../pages/monitors/MonitorDetailPage'));
const IncidentPage = lazy(() => import('../pages/monitors/IncidentPage'));
const PlanManagementPage = lazy(() => import('../pages/plans/PlanManagementPage'));
const MasterManagementPage = lazy(() => import('../pages/master/MasterManagementPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));

// Tool Pages
const DnsPropagationPage = lazy(() => import('../pages/tools/DnsPropagationPage'));
const IpIntelligencePage = lazy(() => import('../pages/tools/IpIntelligencePage'));
const DnsLookupPage = lazy(() => import('../pages/tools/DnsLookupPage'));
const WhatIsMyIpPage = lazy(() => import('../pages/tools/WhatIsMyIpPage'));
const MetaTagAnalyzerPage = lazy(() => import('../pages/tools/MetaTagAnalyzerPage'));
const HttpHeaderCheckerPage = lazy(() => import('../pages/tools/HttpHeaderCheckerPage'));
const RobotsTxtCheckerPage = lazy(() => import('../pages/tools/RobotsTxtCheckerPage'));
const SitemapCheckerPage = lazy(() => import('../pages/tools/SitemapCheckerPage'));
const PageSpeedPage = lazy(() => import('../pages/tools/PageSpeedPage'));
const WordCounterPage = lazy(() => import('../pages/tools/WordCounterPage'));
const LoremIpsumPage = lazy(() => import('../pages/tools/LoremIpsumPage'));
const HtaccessRedirectPage = lazy(() => import('../pages/tools/HtaccessRedirectPage'));
const SmtpTestPage = lazy(() => import('../pages/tools/SmtpTestPage'));
const DomainMonitoringPage = lazy(() => import('../pages/tools/DomainMonitoringPage'));

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

            {/* Tool Pages */}
            <Route path="/tools/dns-propagation" element={<DnsPropagationPage />} />
            <Route path="/tools/ip-intelligence" element={<IpIntelligencePage />} />
            <Route path="/tools/dns-lookup" element={<DnsLookupPage />} />
            <Route path="/tools/what-is-my-ip" element={<WhatIsMyIpPage />} />
            <Route path="/tools/meta-tag-analyzer" element={<MetaTagAnalyzerPage />} />
            <Route path="/tools/http-header-checker" element={<HttpHeaderCheckerPage />} />
            <Route path="/tools/robots-txt-checker" element={<RobotsTxtCheckerPage />} />
            <Route path="/tools/sitemap-checker" element={<SitemapCheckerPage />} />
            <Route path="/tools/page-speed" element={<PageSpeedPage />} />
            <Route path="/tools/word-counter" element={<WordCounterPage />} />
            <Route path="/tools/lorem-ipsum" element={<LoremIpsumPage />} />
            <Route path="/tools/htaccess-redirect" element={<HtaccessRedirectPage />} />
            <Route path="/tools/smtp-test" element={<SmtpTestPage />} />
            <Route path="/tools/domain-monitoring" element={<DomainMonitoringPage />} />

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
                    path="/monitors/:id"
                    element={
                        <ProtectedRoute module={MODULES.MONITOR}>
                            <MonitorDetailPage />
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
