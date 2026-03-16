import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    alpha,
    useTheme,
    CircularProgress,
    Alert,
    LinearProgress,
    Stack,
    Divider,
} from '@mui/material';
import {
    AlertTriangle,
    CheckCircle,
    Bell,
    MonitorPlay,
    TrendingUp,
    ShieldAlert,
    Shield,
    UsersRound,
    ArrowUpRight,
    Globe2,
    ShieldCheck,
    TimerReset,
    Zap,
    ExternalLink,
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, type DashboardStats } from '../../api/dashboardApi';
import { INCIDENT_STATUS, type IRecentIncident } from '../../types';
import { useNavigate } from 'react-router-dom';

// ─── Stat Card ───────────────────────────────────────────────────────────────

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    gradient?: string;
}> = ({ title, value, icon, color, subtitle, gradient }) => (
    <Card
        sx={{
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.06)',
            background: '#ffffff',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0 8px 28px ${alpha(color, 0.18)}`,
            },
        }}
    >
        {/* Colored accent bar at top */}
        <Box
            sx={{
                height: 3,
                background: gradient || `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
            }}
        />
        <CardContent sx={{ p: 2.75 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.25 }}>
                <Box
                    sx={{
                        p: 1.25,
                        borderRadius: '10px',
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 20 })}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, color: '#10b981' }}>
                    <ArrowUpRight size={13} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
                        Live
                    </Typography>
                </Box>
            </Box>
            <Typography
                variant="caption"
                sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.69rem', display: 'block', mb: 0.5 }}
            >
                {title}
            </Typography>
            <Typography
                sx={{
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1,
                    fontSize: '2rem',
                    letterSpacing: '-0.03em',
                    fontFamily: '"Outfit", "DM Sans", sans-serif',
                }}
            >
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" sx={{ color: '#94a3b8', mt: 0.5, display: 'block', fontSize: '0.75rem' }}>
                    {subtitle}
                </Typography>
            )}
        </CardContent>
        {/* Ghost icon watermark */}
        <Box
            sx={{
                position: 'absolute',
                bottom: -20,
                right: -16,
                opacity: 0.05,
                color: color,
                pointerEvents: 'none',
                transform: 'rotate(-8deg)',
            }}
        >
            {React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
        </Box>
    </Card>
);

// ─── Dashboard ───────────────────────────────────────────────────────────────

const DashboardPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) { setLoading(false); setError('Please login to view dashboard.'); return; }
            try {
                const response = await dashboardApi.getStats();
                setStats(response.data.data);
                setError(null);
            } catch (err: any) {
                if (err?.response?.status === 401) {
                    setError('Session expired. Please login again.');
                } else {
                    setError('Failed to load dashboard statistics.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: 2 }}>
                <CircularProgress sx={{ color: '#0A3D62' }} />
                <Typography variant="body2" color="text.secondary">Loading dashboard…</Typography>
            </Box>
        );
    }

    if (error) return <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>;
    if (!stats) return null;

    const isMasterAdmin = user?.type === 1;
    const averageUptime = Number(stats.monitors?.averageUptime || 0);
    const uptimePct = Math.round(averageUptime);
    const recentIncidentList = stats.incidents.recentList || [];
    const warningStats = stats.warnings || { sslExpiry: 0, domainExpiry: 0 };
    const monitoringStats = stats.monitoring || { totalChecks: 0, upChecks: 0 };
    const benchmarkScore = Math.max(0, Math.min(100,
        Math.round(averageUptime - (stats.incidents.open * 4) - (warningStats.sslExpiry * 2) - (warningStats.domainExpiry * 3))
    ));
    const benchmarkLabel = benchmarkScore >= 90 ? 'Elite' : benchmarkScore >= 75 ? 'Strong' : benchmarkScore >= 55 ? 'Needs Tuning' : 'At Risk';
    const benchmarkColor = benchmarkScore >= 90 ? '#10b981' : benchmarkScore >= 75 ? '#2ECC71' : benchmarkScore >= 55 ? '#f59e0b' : '#ef4444';

    const incidentChartData = stats.incidents.recent.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        incidents: Number(item.count),
    }));
    if (incidentChartData.length === 0) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            incidentChartData.push({ date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), incidents: 0 });
        }
    }
    const userChartData = (stats.users?.recent || []).map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        users: item.count,
    }));
    if (userChartData.length === 0) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i);
            userChartData.push({ date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), users: 0 });
        }
    }

    const quickTools = [
        { label: 'DNS Lookup', desc: 'Query DNS records', path: '/tools/dns-lookup' },
        { label: 'Domain Monitoring', desc: 'Check expiry & health', path: '/tools/domain-monitoring' },
        { label: 'PageSpeed', desc: 'Core Web Vitals', path: '/tools/page-speed' },
        { label: 'IP Intelligence', desc: 'Geo & ASN lookup', path: '/tools/ip-intelligence' },
    ];

    const statItems = isMasterAdmin
        ? [
              { title: 'Total Customers', value: stats.users.customers || 0, icon: <UsersRound />, color: '#0A3D62', subtitle: 'Registered accounts', gradient: 'linear-gradient(90deg, #0A3D62, #3498DB)' },
              { title: 'Total Admins', value: stats.users.admins || 0, icon: <Shield />, color: '#8b5cf6', subtitle: 'Admin users', gradient: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
              { title: 'Total Monitors', value: stats.monitors.total, icon: <MonitorPlay />, color: '#2ECC71', subtitle: `${stats.monitors.up} online`, gradient: 'linear-gradient(90deg, #2ECC71, #10b981)' },
              { title: 'Open Incidents', value: stats.incidents.open, icon: <AlertTriangle />, color: '#ef4444', subtitle: 'Requires attention', gradient: 'linear-gradient(90deg, #ef4444, #f87171)' },
              { title: 'SSL Warnings', value: warningStats.sslExpiry, icon: <ShieldCheck />, color: '#f59e0b', subtitle: 'Certificates nearing expiry', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
              { title: 'Domain Warnings', value: warningStats.domainExpiry, icon: <Globe2 />, color: '#f97316', subtitle: 'Expiring domains', gradient: 'linear-gradient(90deg, #f97316, #fb923c)' },
          ]
        : [
              { title: 'Total Monitors', value: stats.monitors.total, icon: <MonitorPlay />, color: '#0A3D62', subtitle: `${stats.monitors.up} online`, gradient: 'linear-gradient(90deg, #0A3D62, #3498DB)' },
              { title: 'Open Incidents', value: stats.incidents.open, icon: <AlertTriangle />, color: '#ef4444', subtitle: 'Needs resolution', gradient: 'linear-gradient(90deg, #ef4444, #f87171)' },
              { title: 'Resolved Incidents', value: stats.incidents.resolved, icon: <CheckCircle />, color: '#2ECC71', subtitle: 'All time', gradient: 'linear-gradient(90deg, #2ECC71, #10b981)' },
              { title: 'Unread Notifications', value: stats.notifications.total, icon: <Bell />, color: '#f59e0b', subtitle: 'Pending review', gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
              { title: 'SSL Warnings', value: warningStats.sslExpiry, icon: <ShieldCheck />, color: '#8b5cf6', subtitle: 'Your monitored SSL risks', gradient: 'linear-gradient(90deg, #8b5cf6, #a78bfa)' },
              { title: 'Domain Warnings', value: warningStats.domainExpiry, icon: <Globe2 />, color: '#f97316', subtitle: 'Your expiring domains', gradient: 'linear-gradient(90deg, #f97316, #fb923c)' },
          ];

    return (
        <Box>

            {/* ── Hero ──────────────────────────────────────────────────── */}
            <Box
                sx={{
                    mb: 4,
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #0a3d62 0%, #0a3d62 55%, #0a3d62 100%)',
                    p: { xs: 3, md: 4 },
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage:
                            'radial-gradient(circle at 15% 85%, rgba(46,204,113,0.18) 0%, transparent 45%), radial-gradient(circle at 85% 15%, rgba(52,152,219,0.18) 0%, transparent 45%)',
                        pointerEvents: 'none',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                        pointerEvents: 'none',
                    },
                }}
            >
                <Grid container spacing={3} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                    <Grid size={{ xs: 12, md: 7 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(46,204,113,0.15)',
                                    border: '1px solid rgba(46,204,113,0.3)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Zap size={16} color="#2ECC71" />
                            </Box>
                            <Typography
                                sx={{
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    letterSpacing: '0.12em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(46,204,113,0.9)',
                                    fontFamily: '"DM Sans", monospace',
                                }}
                            >
                                {isMasterAdmin ? 'Platform Overview' : 'My Workspace'}
                            </Typography>
                        </Box>
                        <Typography
                            sx={{
                                fontWeight: 900,
                                color: '#ffffff',
                                lineHeight: 1.1,
                                letterSpacing: '-0.03em',
                                fontSize: { xs: '1.75rem', md: '2.25rem' },
                                fontFamily: '"Outfit", "DM Sans", sans-serif',
                                mb: 1.5,
                            }}
                        >
                            {isMasterAdmin ? 'Admin Overview' : 'Your Dashboard'}
                        </Typography>
                        <Typography
                            sx={{
                                color: 'rgba(148,163,184,0.9)',
                                fontSize: '0.9375rem',
                                lineHeight: 1.6,
                                maxWidth: 520,
                            }}
                        >
                            {isMasterAdmin
                                ? 'Platform-wide monitoring, customer activity, warning signals, and quick diagnostics in one control center.'
                                : 'Track your monitors, incidents, warnings, and diagnostics in one clean operational workspace.'}
                        </Typography>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: 1.5,
                            }}
                        >
                            {[
                                {
                                    label: 'Avg Uptime',
                                    value: `${averageUptime.toFixed(2)}%`,
                                    color: '#2ECC71',
                                    icon: <TrendingUp size={14} />,
                                },
                                {
                                    label: 'Benchmark',
                                    value: `${benchmarkScore}`,
                                    suffix: `/ 100`,
                                    color: benchmarkColor,
                                    icon: <Zap size={14} />,
                                },
                                {
                                    label: 'Monitors Up',
                                    value: stats.monitors.up,
                                    color: '#3498DB',
                                    icon: <MonitorPlay size={14} />,
                                },
                                {
                                    label: 'Open Incidents',
                                    value: stats.incidents.open,
                                    color: stats.incidents.open > 0 ? '#ef4444' : '#2ECC71',
                                    icon: <AlertTriangle size={14} />,
                                },
                            ].map(item => (
                                <Box
                                    key={item.label}
                                    sx={{
                                        p: 2,
                                        borderRadius: '12px',
                                        bgcolor: 'rgba(255,255,255,0.06)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        backdropFilter: 'blur(8px)',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75, color: item.color }}>
                                        {item.icon}
                                        <Typography sx={{ fontSize: '0.688rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'rgba(148,163,184,0.8)' }}>
                                            {item.label}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 900,
                                                color: item.color,
                                                fontSize: '1.5rem',
                                                lineHeight: 1,
                                                letterSpacing: '-0.02em',
                                                fontFamily: '"Outfit", "DM Sans", sans-serif',
                                            }}
                                        >
                                            {item.value}
                                        </Typography>
                                        {(item as any).suffix && (
                                            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.6)', fontWeight: 600 }}>
                                                {(item as any).suffix}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            {/* ── Section label ─────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Typography
                    sx={{
                        fontSize: '0.688rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontFamily: '"DM Sans", monospace',
                    }}
                >
                    Operational Snapshot
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.07)' }} />
            </Box>

            {/* ── Stat cards ────────────────────────────────────────────── */}
            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {statItems.map(item => (
                    <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            color={item.color}
                            subtitle={item.subtitle}
                            gradient={item.gradient}
                        />
                    </Grid>
                ))}
            </Grid>

            {/* ── Analytics row ─────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Typography
                    sx={{
                        fontSize: '0.688rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontFamily: '"DM Sans", monospace',
                    }}
                >
                    Performance & Health
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.07)' }} />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {/* Chart */}
                <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
                    <Card sx={{ height: 380, borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            color: '#0f172a',
                                            mb: 0.25,
                                            fontSize: '1rem',
                                            fontFamily: '"Outfit", "DM Sans", sans-serif',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {isMasterAdmin ? 'User Registrations' : 'Incidents Over Time'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Last 7 days
                                    </Typography>
                                </Box>
                                <Chip
                                    icon={<TrendingUp size={12} />}
                                    label="Live"
                                    size="small"
                                    sx={{
                                        bgcolor: alpha('#2ECC71', 0.1),
                                        color: '#16a34a',
                                        border: '1px solid',
                                        borderColor: alpha('#2ECC71', 0.3),
                                        fontWeight: 700,
                                        fontSize: '0.7rem',
                                    }}
                                />
                            </Box>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={isMasterAdmin ? userChartData : incidentChartData}
                                        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                                <stop
                                                    offset="5%"
                                                    stopColor={isMasterAdmin ? '#0A3D62' : '#ef4444'}
                                                    stopOpacity={0.2}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor={isMasterAdmin ? '#0A3D62' : '#ef4444'}
                                                    stopOpacity={0}
                                                />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            vertical={false}
                                            stroke={alpha(theme.palette.divider, 0.5)}
                                        />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                            dy={8}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            dx={-4}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid rgba(0,0,0,0.08)',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                                                fontSize: '0.8125rem',
                                                fontFamily: '"DM Sans", sans-serif',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey={isMasterAdmin ? 'users' : 'incidents'}
                                            stroke={isMasterAdmin ? '#0A3D62' : '#ef4444'}
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorMain)"
                                            activeDot={{ r: 5, strokeWidth: 0 }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Infrastructure Health */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 3 }}>
                                <Box sx={{ p: 1, borderRadius: '8px', bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                                    <ShieldAlert size={17} color={theme.palette.warning.main} />
                                </Box>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        color: '#0f172a',
                                        fontSize: '0.9375rem',
                                        fontFamily: '"Outfit", "DM Sans", sans-serif',
                                    }}
                                >
                                    Infrastructure Health
                                </Typography>
                            </Box>

                            <Stack spacing={2.5}>
                                {/* Uptime */}
                                <Box sx={{ p: 2.25, borderRadius: '12px', bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.25 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151', fontSize: '0.8125rem' }}>
                                            {isMasterAdmin ? 'Global Monitor Status' : 'Your Monitor Status'}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                fontWeight: 900,
                                                color: uptimePct >= 90 ? '#10b981' : '#ef4444',
                                                fontSize: '1.125rem',
                                                fontFamily: '"Outfit", "DM Sans", sans-serif',
                                            }}
                                        >
                                            {uptimePct}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={uptimePct}
                                        sx={{
                                            height: 7,
                                            borderRadius: 4,
                                            bgcolor: alpha('#10b981', 0.1),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                                background:
                                                    uptimePct >= 90
                                                        ? 'linear-gradient(90deg, #34d399, #10b981)'
                                                        : 'linear-gradient(90deg, #f59e0b, #ef4444)',
                                            },
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.75 }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981' }}>
                                            ↑ {stats.monitors.up} UP
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#ef4444' }}>
                                            ↓ {stats.monitors.down} DOWN
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Incidents alert */}
                                <Box
                                    sx={{
                                        p: 2.25,
                                        borderRadius: '12px',
                                        bgcolor: alpha(theme.palette.error.main, 0.04),
                                        border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                                        <AlertTriangle size={14} color={theme.palette.error.main} />
                                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem' }}>
                                            Attention Required
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.8125rem' }}>
                                        <strong style={{ color: '#0f172a' }}>{stats.incidents.open} open incidents</strong>{' '}
                                        {stats.incidents.open > 0
                                            ? 'currently active. Resolve quickly to maintain SLAs.'
                                            : '— all systems nominal.'}
                                    </Typography>
                                </Box>

                                {/* Check quality */}
                                <Box
                                    sx={{
                                        p: 2.25,
                                        borderRadius: '12px',
                                        bgcolor: alpha('#0A3D62', 0.04),
                                        border: `1px solid ${alpha('#0A3D62', 0.1)}`,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
                                        <TimerReset size={14} color="#0A3D62" />
                                        <Typography variant="caption" sx={{ color: '#0A3D62', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: '0.65rem' }}>
                                            Check Quality
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: '0.8125rem' }}>
                                        <strong style={{ color: '#0f172a' }}>{monitoringStats.totalChecks}</strong> total checks,{' '}
                                        <strong style={{ color: '#0f172a' }}>{monitoringStats.upChecks}</strong> successful.
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Tools & Benchmark row ─────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Typography
                    sx={{
                        fontSize: '0.688rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontFamily: '"DM Sans", monospace',
                    }}
                >
                    Controls
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.07)' }} />
            </Box>

            <Grid container spacing={2.5} sx={{ mb: 4 }}>
                {/* Benchmark */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', height: '100%' }}>
                        <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    mb: 2.5,
                                    fontFamily: '"Outfit", "DM Sans", sans-serif',
                                    fontSize: '0.9375rem',
                                }}
                            >
                                Benchmark Score
                            </Typography>
                            <Box
                                sx={{
                                    flex: 1,
                                    p: 3,
                                    borderRadius: '14px',
                                    background: 'linear-gradient(135deg, #0A3D62 0%, #0A3D62 100%)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::before': {
                                        content: '""',
                                        position: 'absolute',
                                        inset: 0,
                                        backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                                        backgroundSize: '16px 16px',
                                    },
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontWeight: 900,
                                        color: benchmarkColor,
                                        lineHeight: 1,
                                        fontSize: '3.5rem',
                                        letterSpacing: '-0.04em',
                                        fontFamily: '"Outfit", "DM Sans", sans-serif',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}
                                >
                                    {benchmarkScore}
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: 800,
                                        color: benchmarkColor,
                                        mt: 0.5,
                                        fontSize: '0.875rem',
                                        letterSpacing: '0.04em',
                                        textTransform: 'uppercase',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}
                                >
                                    {benchmarkLabel}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(148,163,184,0.8)',
                                        mt: 1.5,
                                        lineHeight: 1.6,
                                        fontSize: '0.8125rem',
                                        position: 'relative',
                                        zIndex: 1,
                                    }}
                                >
                                    Derived from uptime, open incidents, and expiry warnings.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Quick tools */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            color: '#0f172a',
                                            fontFamily: '"Outfit", "DM Sans", sans-serif',
                                            fontSize: '0.9375rem',
                                        }}
                                    >
                                        Quick Diagnostic Tools
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Jump into the most-used diagnostics instantly
                                    </Typography>
                                </Box>
                            </Box>
                            <Grid container spacing={1.75}>
                                {quickTools.map(tool => (
                                    <Grid key={tool.path} size={{ xs: 12, sm: 6 }}>
                                        <Box
                                            sx={{
                                                p: 2.25,
                                                borderRadius: '12px',
                                                border: '1px solid rgba(0,0,0,0.07)',
                                                bgcolor: '#FAFBFC',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 2,
                                                transition: 'all 0.15s ease',
                                                cursor: 'pointer',
                                                '&:hover': {
                                                    bgcolor: alpha('#0A3D62', 0.04),
                                                    borderColor: alpha('#0A3D62', 0.2),
                                                    transform: 'translateY(-1px)',
                                                    boxShadow: '0 4px 12px rgba(10,61,98,0.08)',
                                                },
                                            }}
                                            onClick={() => navigate(tool.path)}
                                        >
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: '#0f172a',
                                                        fontSize: '0.875rem',
                                                        lineHeight: 1.3,
                                                    }}
                                                >
                                                    {tool.label}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}
                                                >
                                                    {tool.desc}
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: '8px',
                                                    bgcolor: alpha('#0A3D62', 0.08),
                                                    color: '#0A3D62',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <ExternalLink size={14} />
                                            </Box>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* ── Activity row ──────────────────────────────────────────── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Typography
                    sx={{
                        fontSize: '0.688rem',
                        fontWeight: 800,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color: '#94a3b8',
                        fontFamily: '"DM Sans", monospace',
                    }}
                >
                    Activity
                </Typography>
                <Box sx={{ flex: 1, height: '1px', bgcolor: 'rgba(0,0,0,0.07)' }} />
            </Box>

            <Grid container spacing={2.5}>
                {/* Recent Incidents */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            color: '#0f172a',
                                            fontFamily: '"Outfit", "DM Sans", sans-serif',
                                            fontSize: '0.9375rem',
                                        }}
                                    >
                                        Recent Incidents
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {isMasterAdmin ? 'Latest platform incidents' : 'Latest incidents affecting your account'}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${recentIncidentList.length} recent`}
                                    size="small"
                                    sx={{
                                        bgcolor: alpha('#0A3D62', 0.08),
                                        color: '#0A3D62',
                                        fontWeight: 700,
                                        border: '1px solid',
                                        borderColor: alpha('#0A3D62', 0.2),
                                    }}
                                />
                            </Box>
                            {recentIncidentList.length === 0 ? (
                                <Alert severity="success" sx={{ borderRadius: '12px' }}>
                                    No recent incidents — all clear!
                                </Alert>
                            ) : (
                                <Stack divider={<Divider sx={{ borderColor: 'rgba(0,0,0,0.05)' }} />} spacing={0}>
                                    {recentIncidentList.map((incident: IRecentIncident) => (
                                        <Box
                                            key={incident.id}
                                            sx={{ py: 1.75, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
                                        >
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.25, fontSize: '0.875rem' }}>
                                                    {incident.monitor?.name || 'Monitor'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#64748b', display: 'block' }}>
                                                    {incident.cause || 'No incident reason available'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.25 }}>
                                                    {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : ''}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={incident.status === INCIDENT_STATUS.OPEN ? 'Open' : 'Resolved'}
                                                size="small"
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    fontWeight: 700,
                                                    bgcolor:
                                                        incident.status === INCIDENT_STATUS.OPEN
                                                            ? alpha('#ef4444', 0.1)
                                                            : alpha('#10b981', 0.1),
                                                    color:
                                                        incident.status === INCIDENT_STATUS.OPEN ? '#ef4444' : '#10b981',
                                                    border: '1px solid',
                                                    borderColor:
                                                        incident.status === INCIDENT_STATUS.OPEN
                                                            ? alpha('#ef4444', 0.25)
                                                            : alpha('#10b981', 0.25),
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Warning Radar */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{ borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                sx={{
                                    fontWeight: 800,
                                    color: '#0f172a',
                                    mb: 2.5,
                                    fontFamily: '"Outfit", "DM Sans", sans-serif',
                                    fontSize: '0.9375rem',
                                }}
                            >
                                Warning Radar
                            </Typography>

                            {[
                                {
                                    title: 'SSL Expiry',
                                    value: warningStats.sslExpiry,
                                    helper: 'Certs expiring within 30 days',
                                    color: '#f59e0b',
                                    gradient: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))',
                                    border: alpha('#f59e0b', 0.18),
                                },
                                {
                                    title: 'Domain Expiry',
                                    value: warningStats.domainExpiry,
                                    helper: 'Domains expiring within 30 days',
                                    color: '#ef4444',
                                    gradient: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(239,68,68,0.03))',
                                    border: alpha('#ef4444', 0.18),
                                },
                            ].map(item => (
                                <Box
                                    key={item.title}
                                    sx={{
                                        p: 2.25,
                                        borderRadius: '12px',
                                        background: item.gradient,
                                        border: `1px solid ${item.border}`,
                                        mb: 1.75,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a', mb: 0.25, fontSize: '0.875rem' }}>
                                            {item.title}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                                            {item.helper}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 900,
                                            color: item.color,
                                            fontSize: '2rem',
                                            lineHeight: 1,
                                            letterSpacing: '-0.03em',
                                            fontFamily: '"Outfit", "DM Sans", sans-serif',
                                        }}
                                    >
                                        {item.value}
                                    </Typography>
                                </Box>
                            ))}

                            <Box
                                sx={{
                                    p: 2.25,
                                    borderRadius: '12px',
                                    bgcolor: '#F8FAFC',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                }}
                            >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                                    Server Health
                                </Typography>
                                <Typography
                                    sx={{
                                        fontWeight: 900,
                                        color: '#0A3D62',
                                        fontSize: '1.75rem',
                                        lineHeight: 1,
                                        letterSpacing: '-0.03em',
                                        fontFamily: '"Outfit", "DM Sans", sans-serif',
                                    }}
                                >
                                    {averageUptime.toFixed(2)}%
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', mt: 0.5 }}>
                                    Derived from monitor health signals
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
