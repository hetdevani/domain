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
    Button
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
    TimerReset
} from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { dashboardApi, type DashboardStats } from '../../api/dashboardApi';
import { INCIDENT_STATUS, type IRecentIncident } from '../../types';
import { useNavigate } from 'react-router-dom';

const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
}> = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 6,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        border: `1px solid #ffffff`,
        background: '#ffffff',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: `0 8px 30px ${alpha(color, 0.2)}`,
        }
    }}>
        <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2.5 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: alpha(color, 0.12),
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: `0 4px 14px ${alpha(color, 0.05)}`
                    }}
                >
                    {React.cloneElement(icon as React.ReactElement<any>, { size: 22 })}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                    <ArrowUpRight size={14} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Live</Typography>
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.8125rem' }}>
                {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#0A3D62', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                {value}
            </Typography>
            {subtitle && (
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                    {subtitle}
                </Typography>
            )}
        </CardContent>
        <Box
            sx={{
                position: 'absolute',
                bottom: -24,
                right: -24,
                opacity: 0.07,
                color: color,
                transform: 'rotate(-10deg)',
                pointerEvents: 'none',
            }}
        >
            {React.cloneElement(icon as React.ReactElement<any>, { size: 110 })}
        </Box>
    </Card>
);

const SectionHeading: React.FC<{
    eyebrow: string;
    title: string;
    subtitle?: string;
}> = ({ eyebrow, title, subtitle }) => (
    <Box sx={{ mb: 2 }}>
        <Typography
            variant="caption"
            sx={{
                display: 'block',
                color: '#64748b',
                fontWeight: 800,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                mb: 0.75
            }}
        >
            {eyebrow}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0A3D62', mb: subtitle ? 0.5 : 0 }}>
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        )}
    </Box>
);

const DashboardPage: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) {
                setLoading(false);
                setError('Please login to view dashboard.');
                return;
            }
            try {
                const response = await dashboardApi.getStats();
                setStats(response.data.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch stats:', err);
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
                <Typography variant="body2" color="text.secondary">Loading dashboard...</Typography>
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>;
    }

    if (!stats) return null;

    const isMasterAdmin = user?.type === 1;

    const incidentChartData = stats.incidents.recent.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        incidents: Number(item.count)
    }));

    if (incidentChartData.length === 0) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            incidentChartData.push({
                date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                incidents: 0
            });
        }
    }

    const userChartData = (stats.users?.recent || []).map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        users: item.count
    }));

    if (userChartData.length === 0) {
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            userChartData.push({
                date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                users: 0
            });
        }
    }

    const averageUptime = Number(stats.monitors?.averageUptime || 0);
    const uptimePct = Math.round(averageUptime);
    const recentIncidentList = stats.incidents.recentList || [];
    const warningStats = stats.warnings || { sslExpiry: 0, domainExpiry: 0 };
    const monitoringStats = stats.monitoring || { totalChecks: 0, upChecks: 0 };
    const benchmarkScore = Math.max(
        0,
        Math.min(
            100,
            Math.round(
                averageUptime
                - (stats.incidents.open * 4)
                - (warningStats.sslExpiry * 2)
                - (warningStats.domainExpiry * 3)
            )
        )
    );
    const benchmarkLabel = benchmarkScore >= 90 ? 'Elite' : benchmarkScore >= 75 ? 'Strong' : benchmarkScore >= 55 ? 'Needs tuning' : 'At risk';
    const quickTools = [
        { label: 'DNS Lookup', path: '/tools/dns-lookup' },
        { label: 'Domain Monitoring', path: '/tools/domain-monitoring' },
        { label: 'PageSpeed', path: '/tools/page-speed' },
        { label: 'IP Intelligence', path: '/tools/ip-intelligence' },
    ];
    const statItems = isMasterAdmin
        ? [
            {
                title: 'Total Customers',
                value: stats.users.customers || 0,
                icon: <UsersRound size={22} />,
                color: '#0A3D62',
                subtitle: 'Registered accounts'
            },
            {
                title: 'Total Admins',
                value: stats.users.admins || 0,
                icon: <Shield size={22} />,
                color: '#8b5cf6',
                subtitle: 'Admin users'
            },
            {
                title: 'Total Monitors',
                value: stats.monitors.total,
                icon: <MonitorPlay size={22} />,
                color: theme.palette.success.main,
                subtitle: `${stats.monitors.up} online`
            },
            {
                title: 'Open Incidents',
                value: stats.incidents.open,
                icon: <AlertTriangle size={22} />,
                color: theme.palette.error.main,
                subtitle: 'Requires attention'
            },
            {
                title: 'SSL Warnings',
                value: warningStats.sslExpiry,
                icon: <ShieldCheck size={22} />,
                color: '#f59e0b',
                subtitle: 'Certificates nearing expiry'
            },
            {
                title: 'Domain Warnings',
                value: warningStats.domainExpiry,
                icon: <Globe2 size={22} />,
                color: '#ef4444',
                subtitle: 'Expiring domains detected'
            }
        ]
        : [
            {
                title: 'Total Monitors',
                value: stats.monitors.total,
                icon: <MonitorPlay size={22} />,
                color: '#0A3D62',
                subtitle: `${stats.monitors.up} online`
            },
            {
                title: 'Open Incidents',
                value: stats.incidents.open,
                icon: <AlertTriangle size={22} />,
                color: theme.palette.error.main,
                subtitle: 'Needs resolution'
            },
            {
                title: 'Resolved Incidents',
                value: stats.incidents.resolved,
                icon: <CheckCircle size={22} />,
                color: theme.palette.success.main,
                subtitle: 'All time'
            },
            {
                title: 'Unread Notifications',
                value: stats.notifications.total,
                icon: <Bell size={22} />,
                color: '#f59e0b',
                subtitle: 'Pending review'
            },
            {
                title: 'SSL Warnings',
                value: warningStats.sslExpiry,
                icon: <ShieldCheck size={22} />,
                color: '#f59e0b',
                subtitle: 'Your monitored SSL risks'
            },
            {
                title: 'Domain Warnings',
                value: warningStats.domainExpiry,
                icon: <Globe2 size={22} />,
                color: '#ef4444',
                subtitle: 'Your expiring domains'
            }
        ];

    return (
        <Box>
            <Breadcrumb />

            <Box
                sx={{
                    mb: 4,
                    p: { xs: 2.5, md: 3.5 },
                    borderRadius: 5,
                    background: 'linear-gradient(135deg, rgba(10,61,98,0.08), rgba(46,204,113,0.08) 60%, rgba(255,255,255,0.95))',
                    border: '1px solid rgba(10,61,98,0.08)'
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Typography variant="h4" sx={{ fontWeight: 900, color: '#0A3D62', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                            {isMasterAdmin ? 'Admin Overview' : 'Your Dashboard'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 720 }}>
                            {isMasterAdmin
                                ? 'See platform-wide monitoring, warning signals, customer activity, and quick diagnostics in one aligned control center.'
                                : 'Track your monitors, warning signals, incidents, and diagnostics in one clean operational workspace.'}
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Box
                            sx={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                gap: 1.5
                            }}
                        >
                            <Box sx={{ p: 1.75, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(10,61,98,0.08)' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Uptime</Typography>
                                <Typography variant="h5" sx={{ color: '#0A3D62', fontWeight: 900 }}>{averageUptime.toFixed(1)}%</Typography>
                            </Box>
                            <Box sx={{ p: 1.75, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.7)', border: '1px solid rgba(10,61,98,0.08)' }}>
                                <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>Score</Typography>
                                <Typography variant="h5" sx={{ color: '#0A3D62', fontWeight: 900 }}>{benchmarkScore}</Typography>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <SectionHeading
                eyebrow="Overview"
                title="Operational Snapshot"
                subtitle="A fast, aligned summary of your most important monitoring signals."
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {statItems.map((item) => (
                    <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 4, xl: 2 }}>
                        <StatCard
                            title={item.title}
                            value={item.value}
                            icon={item.icon}
                            color={item.color}
                            subtitle={item.subtitle}
                        />
                    </Grid>
                ))}
            </Grid>

            <SectionHeading
                eyebrow="Analytics"
                title="Performance And Health"
                subtitle="Visual trends and operational health grouped in a cleaner, more balanced layout."
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 8 }} sx={{ minWidth: 0 }}>
                    <Card sx={{
                        height: 420,
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62', mb: 0.25 }}>
                                        {isMasterAdmin ? 'User Registrations' : 'Incidents Over Time'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Last 7 days</Typography>
                                </Box>
                                <Chip
                                    icon={<TrendingUp size={13} />}
                                    label="Live"
                                    variant="outlined"
                                    color="primary"
                                    size="small"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                />
                            </Box>
                            <Box sx={{ flexGrow: 1, minHeight: 280, minWidth: 0 }}>
                                <ResponsiveContainer width="100%" height={280}>
                                    <AreaChart
                                        data={isMasterAdmin ? userChartData : incidentChartData}
                                        margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isMasterAdmin ? '#0A3D62' : theme.palette.error.main} stopOpacity={0.25} />
                                                <stop offset="95%" stopColor={isMasterAdmin ? '#0A3D62' : theme.palette.error.main} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.4)} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 11 }}
                                            dx={-5}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '10px',
                                                border: 'none',
                                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                                fontSize: '0.8125rem',
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey={isMasterAdmin ? "users" : "incidents"}
                                            stroke={isMasterAdmin ? '#0A3D62' : theme.palette.error.main}
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorMain)"
                                            activeDot={{ r: 5, strokeWidth: 0, fill: isMasterAdmin ? '#0A3D62' : theme.palette.error.main }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(0,0,0,0.06)',
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                                <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                                    <ShieldAlert size={18} color={theme.palette.warning.main} />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                    Infrastructure Health
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                {/* Uptime section */}
                                <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#374151' }}>
                                            {isMasterAdmin ? 'Global Monitor Status' : 'Your Monitor Status'}
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: uptimePct >= 90 ? theme.palette.success.main : theme.palette.error.main }}>
                                            {uptimePct}%
                                        </Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={uptimePct}
                                        sx={{
                                            height: 8,
                                            borderRadius: 4,
                                            bgcolor: alpha(theme.palette.success.main, 0.12),
                                            '& .MuiLinearProgress-bar': {
                                                borderRadius: 4,
                                                background: uptimePct >= 90
                                                    ? `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})`
                                                    : `linear-gradient(90deg, ${theme.palette.warning.main}, ${theme.palette.error.main})`,
                                            }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                                            ↑ {stats.monitors.up} UP
                                        </Typography>
                                        <Typography variant="caption" color="error.main" sx={{ fontWeight: 700 }}>
                                            ↓ {stats.monitors.down} DOWN
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Open incidents */}
                                <Box sx={{
                                    p: 2.5,
                                    borderRadius: 2.5,
                                    bgcolor: alpha(theme.palette.error.main, 0.04),
                                    border: `1px solid ${alpha(theme.palette.error.main, 0.12)}`
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <AlertTriangle size={15} color={theme.palette.error.main} />
                                        <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 800 }}>
                                            Attention Required
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        <strong style={{ color: '#111827' }}>{stats.incidents.open} open incidents</strong> currently active.
                                        {stats.incidents.open > 0 ? ' Resolve quickly to maintain SLAs.' : ' All systems operating normally.'}
                                    </Typography>
                                </Box>

                                {/* Resolved */}
                                <Box sx={{
                                    p: 2.5,
                                    borderRadius: 2.5,
                                    bgcolor: alpha('#0A3D62', 0.04),
                                    border: `1px solid ${alpha('#0A3D62', 0.12)}`
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TimerReset size={15} color="#0A3D62" />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                            Check Quality
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        <strong style={{ color: '#111827' }}>{monitoringStats.totalChecks}</strong> total monitor checks recorded,
                                        with <strong style={{ color: '#111827' }}>{monitoringStats.upChecks}</strong> successful checks.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <SectionHeading
                eyebrow="Controls"
                title="Tools And Priorities"
                subtitle="Keep benchmark signals and quick diagnostics close together for faster action."
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        height: '100%'
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2 }}>
                                Benchmark Score
                            </Typography>
                            <Box sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, rgba(10,61,98,0.08), rgba(46,204,113,0.12))', border: '1px solid rgba(10,61,98,0.08)' }}>
                                <Typography variant="h2" sx={{ fontWeight: 900, color: '#0A3D62', lineHeight: 1 }}>
                                    {benchmarkScore}
                                </Typography>
                                <Typography variant="subtitle2" sx={{ mt: 0.75, fontWeight: 800, color: benchmarkScore >= 75 ? theme.palette.success.main : theme.palette.warning.main }}>
                                    {benchmarkLabel}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.7 }}>
                                    A frontend benchmark-style score derived from uptime, open incidents, and expiry warnings to help teams prioritize operational health.
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                        Quick Diagnostic Tools
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Jump into the most-used diagnostics without leaving the dashboard flow.
                                    </Typography>
                                </Box>
                            </Box>

                            <Grid container spacing={2}>
                                {quickTools.map((tool) => (
                                    <Grid key={tool.path} size={{ xs: 12, sm: 6 }}>
                                        <Box
                                            sx={{
                                                p: 2.5,
                                                borderRadius: 3,
                                                border: '1px solid rgba(10,61,98,0.08)',
                                                bgcolor: alpha('#0A3D62', 0.02),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                gap: 2
                                            }}
                                        >
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                                    {tool.label}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Open the tool workspace
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => navigate(tool.path)}
                                                sx={{ borderRadius: 2, fontWeight: 700 }}
                                            >
                                                Open
                                            </Button>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <SectionHeading
                eyebrow="Activity"
                title="Recent Incidents And Warning Signals"
                subtitle="A clearer final section for the incidents stream and the warning overview."
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                        Recent Incidents
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {isMasterAdmin ? 'Latest platform incidents' : 'Latest incidents affecting your account'}
                                    </Typography>
                                </Box>
                                <Chip
                                    label={`${recentIncidentList.length} recent`}
                                    size="small"
                                    sx={{ fontWeight: 700, bgcolor: alpha('#0A3D62', 0.08), color: '#0A3D62' }}
                                />
                            </Box>

                            {recentIncidentList.length === 0 ? (
                                <Alert severity="success" sx={{ borderRadius: 3 }}>
                                    No recent incidents found.
                                </Alert>
                            ) : (
                                <Stack divider={<Divider flexItem sx={{ borderColor: 'rgba(0,0,0,0.06)' }} />} spacing={0}>
                                    {recentIncidentList.map((incident: IRecentIncident) => (
                                        <Box key={incident.id} sx={{ py: 2, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
                                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#111827' }}>
                                                    {incident.monitor?.name || 'Monitor'}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                    {incident.cause || 'No incident reason available'}
                                                </Typography>
                                                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
                                                    {incident.createdAt ? new Date(incident.createdAt).toLocaleString() : ''}
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={incident.status === INCIDENT_STATUS.OPEN ? 'Open' : 'Resolved'}
                                                size="small"
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    fontWeight: 800,
                                                    bgcolor: incident.status === INCIDENT_STATUS.OPEN ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.success.main, 0.1),
                                                    color: incident.status === INCIDENT_STATUS.OPEN ? theme.palette.error.main : theme.palette.success.main
                                                }}
                                            />
                                        </Box>
                                    ))}
                                </Stack>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 5 }}>
                    <Card sx={{
                        borderRadius: 3,
                        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(0,0,0,0.06)'
                    }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2 }}>
                                Warning Radar
                            </Typography>

                            {[
                                {
                                    title: 'SSL Expiry Warnings',
                                    value: warningStats.sslExpiry,
                                    helper: 'Certificates expiring within 30 days',
                                    color: '#f59e0b'
                                },
                                {
                                    title: 'Domain Expiry Warnings',
                                    value: warningStats.domainExpiry,
                                    helper: 'Domains expiring within 30 days',
                                    color: '#ef4444'
                                },
                            ].map((item) => (
                                <Box key={item.title} sx={{ p: 2.5, borderRadius: 2.5, bgcolor: alpha(item.color, 0.05), border: `1px solid ${alpha(item.color, 0.12)}`, mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#111827' }}>
                                                {item.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {item.helper}
                                            </Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontWeight: 900, color: item.color }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}

                            <Box sx={{ mt: 3, p: 2.5, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>
                                    Server Health Summary
                                </Typography>
                                <Typography variant="h3" sx={{ fontWeight: 900, color: '#0A3D62' }}>
                                    {averageUptime.toFixed(2)}%
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Derived from monitor health signals until dedicated agent-based server metrics are connected.
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
