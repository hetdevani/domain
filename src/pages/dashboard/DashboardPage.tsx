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
    Alert
} from '@mui/material';
import {
    AlertTriangle,
    CheckCircle,
    Bell,
    MonitorPlay,
    TrendingUp,
    ShieldAlert,
    Shield,
    UsersRound
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
}> = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden', borderRadius: 3, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: alpha(color, 0.1),
                        color: color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
                {value}
            </Typography>
        </CardContent>
        <Box
            sx={{
                position: 'absolute',
                bottom: -20,
                right: -20,
                opacity: 0.04,
                color: color,
                transform: 'rotate(-15deg)'
            }}
        >
            {React.cloneElement(icon as React.ReactElement<any>, { size: 100 })}
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
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    if (!stats) return null;

    const isMasterAdmin = user?.type === 1;

    // Charts data logic
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

    // Chart logic for admin users
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

    return (
        <Box>
            <Breadcrumb />

            <Typography variant="h4" sx={{ fontWeight: 800, mb: 4 }}>
                {isMasterAdmin ? 'Admin Overview' : 'Customer Dashboard'}
            </Typography>

            <Grid container spacing={3}>
                {isMasterAdmin ? (
                    // ---------------- MASTER ADMIN CARDS ----------------
                    <>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Customers"
                                value={stats.users.customers || 0}
                                icon={<UsersRound size={24} />}
                                color={theme.palette.primary.main}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Admins"
                                value={stats.users.admins || 0}
                                icon={<Shield size={24} />}
                                color="#8b5cf6"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Monitors"
                                value={stats.monitors.total}
                                icon={<MonitorPlay size={24} />}
                                color={theme.palette.success.main}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Open Incidents"
                                value={stats.incidents.open}
                                icon={<AlertTriangle size={24} />}
                                color={theme.palette.error.main}
                            />
                        </Grid>
                    </>
                ) : (
                    // ---------------- CUSTOMER CARDS ----------------
                    <>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Total Monitors"
                                value={stats.monitors.total}
                                icon={<MonitorPlay size={24} />}
                                color={theme.palette.primary.main}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Open Incidents"
                                value={stats.incidents.open}
                                icon={<AlertTriangle size={24} />}
                                color={theme.palette.error.main}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Resolved Incidents"
                                value={stats.incidents.resolved}
                                icon={<CheckCircle size={24} />}
                                color={theme.palette.success.main}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                            <StatCard
                                title="Unread Notifications"
                                value={stats.notifications.total}
                                icon={<Bell size={24} />}
                                color="#f59e0b"
                            />
                        </Grid>
                    </>
                )}

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ height: 450, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                        <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                    {isMasterAdmin ? 'User Registrations (Last 7 Days)' : 'Incidents Over Time (Last 7 Days)'}
                                </Typography>
                                <Chip icon={<TrendingUp size={14} />} label="Live Updates" variant="outlined" color="primary" size="small" />
                            </Box>
                            <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={isMasterAdmin ? userChartData : incidentChartData}
                                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={isMasterAdmin ? theme.palette.primary.main : theme.palette.error.main} stopOpacity={0.3} />
                                                <stop offset="95%" stopColor={isMasterAdmin ? theme.palette.primary.main : theme.palette.error.main} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.5)} />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: theme.palette.text.secondary, fontSize: 12 }}
                                            dx={-10}
                                            allowDecimals={false}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '8px',
                                                border: 'none',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                            }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey={isMasterAdmin ? "users" : "incidents"}
                                            stroke={isMasterAdmin ? theme.palette.primary.main : theme.palette.error.main}
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorMain)"
                                            activeDot={{ r: 6, strokeWidth: 0, fill: isMasterAdmin ? theme.palette.primary.main : theme.palette.error.main }}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ height: 450, borderRadius: 4, boxShadow: '0 4px 20px 0 rgba(0,0,0,0.05)' }}>
                        <CardContent>
                            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ShieldAlert size={20} color={theme.palette.warning.main} />
                                Infrastructure Health
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                                        {isMasterAdmin ? 'Global Monitors Status' : 'Your Monitors Status'}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                        <Box sx={{ flexGrow: 1, height: 8, bgcolor: alpha(theme.palette.success.main, 0.2), borderRadius: 4, overflow: 'hidden', display: 'flex' }}>
                                            <Box
                                                sx={{
                                                    width: stats.monitors.total > 0 ? `${(stats.monitors.up / stats.monitors.total) * 100}%` : '0%',
                                                    background: `linear-gradient(90deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
                                                    height: '100%'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 40 }}>
                                            {stats.monitors.total > 0 ? Math.round((stats.monitors.up / stats.monitors.total) * 100) : 0}% Uptime
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                                            {stats.monitors.up} UP
                                        </Typography>
                                        <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                                            {stats.monitors.down} DOWN
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.error.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.error.main, 0.1) }}>
                                    <Typography variant="subtitle2" color="error.main" sx={{ fontWeight: 700, mb: 1 }}>
                                        Attention Required
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        There are <strong>{stats.incidents.open} open incidents</strong> currently.
                                        {stats.incidents.open > 0 ? ' Ensure rapid resolution to maintain uptime SLAs.' : ' All systems are functioning normally.'}
                                    </Typography>
                                </Box>

                                <Box sx={{ p: 2, borderRadius: 3, bgcolor: alpha(theme.palette.success.main, 0.05), border: '1px solid', borderColor: alpha(theme.palette.success.main, 0.1) }}>
                                    <Typography variant="subtitle2" color="success.main" sx={{ fontWeight: 700, mb: 1 }}>
                                        Proper Fixes Made
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        A total of <strong>{stats.incidents.resolved} incidents</strong> have been successfully resolved securely and permanently.
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
