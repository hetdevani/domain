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
    LinearProgress
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
    ArrowUpRight
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
        borderRadius: 3,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        border: `1px solid ${alpha(color, 0.15)}`,
        background: `linear-gradient(135deg, ${alpha(color, 0.07)} 0%, rgba(255,255,255,0) 60%)`,
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
                        boxShadow: `0 4px 14px ${alpha(color, 0.25)}`
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

const DashboardPage: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await dashboardApi.getStats();
                setStats(response.data.data);
                setError(null);
            } catch (err: any) {
                console.error('Failed to fetch stats:', err);
                setError('Failed to load dashboard statistics.');
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

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
        incidents: item.count
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

    const uptimePct = stats.monitors.total > 0
        ? Math.round((stats.monitors.up / stats.monitors.total) * 100)
        : 0;

    return (
        <Box>
            <Breadcrumb />

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0A3D62', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                    {isMasterAdmin ? 'Admin Overview' : 'Your Dashboard'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {isMasterAdmin ? 'Monitor your platform health and user activity.' : 'Track your monitors and incidents in real-time.'}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {isMasterAdmin ? (
                    <>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Customers"
                                value={stats.users.customers || 0}
                                icon={<UsersRound size={22} />}
                                color="#0A3D62"
                                subtitle="Registered accounts"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Admins"
                                value={stats.users.admins || 0}
                                icon={<Shield size={22} />}
                                color="#8b5cf6"
                                subtitle="Admin users"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Monitors"
                                value={stats.monitors.total}
                                icon={<MonitorPlay size={22} />}
                                color={theme.palette.success.main}
                                subtitle={`${stats.monitors.up} online`}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Open Incidents"
                                value={stats.incidents.open}
                                icon={<AlertTriangle size={22} />}
                                color={theme.palette.error.main}
                                subtitle="Requires attention"
                            />
                        </Grid>
                    </>
                ) : (
                    <>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Monitors"
                                value={stats.monitors.total}
                                icon={<MonitorPlay size={22} />}
                                color="#0A3D62"
                                subtitle={`${stats.monitors.up} online`}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Open Incidents"
                                value={stats.incidents.open}
                                icon={<AlertTriangle size={22} />}
                                color={theme.palette.error.main}
                                subtitle="Needs resolution"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Resolved Incidents"
                                value={stats.incidents.resolved}
                                icon={<CheckCircle size={22} />}
                                color={theme.palette.success.main}
                                subtitle="All time"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Unread Notifications"
                                value={stats.notifications.total}
                                icon={<Bell size={22} />}
                                color="#f59e0b"
                                subtitle="Pending review"
                            />
                        </Grid>
                    </>
                )}

                {/* Chart Card */}
                <Grid size={{ xs: 12, md: 8 }}>
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
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
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

                {/* Infrastructure Health */}
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
                                    bgcolor: alpha(theme.palette.success.main, 0.04),
                                    border: `1px solid ${alpha(theme.palette.success.main, 0.12)}`
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <CheckCircle size={15} color={theme.palette.success.main} />
                                        <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 800 }}>
                                            Resolved Issues
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        <strong style={{ color: '#111827' }}>{stats.incidents.resolved} incidents</strong> have been resolved successfully.
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
