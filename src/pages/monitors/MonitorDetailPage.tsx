import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Stack,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    alpha,
    useTheme,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Button,
    Divider,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    ArrowLeft,
    Globe,
    ExternalLink,
    Activity,
    Shield,
    ShieldOff,
    CalendarClock,
    Clock,
    AlertTriangle,
    CheckCircle,
    Edit,
    Pause,
    Play,
    RefreshCw,
    Zap,
    Wifi,
    WifiOff,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
} from 'recharts';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { monitorApi } from './api/monitorApi';
import { cronActivityLogApi } from '../../api/cronActivityLogApi';
import { incidentApi } from '../../api/incidentApi';
import { MONITOR_TYPE, MONITOR_STATUS, INCIDENT_STATUS } from '../../types';
import MonitorForm from './components/MonitorForm';
import toast from 'react-hot-toast';

const MONITOR_TYPE_LABELS: Record<number, string> = {
    [MONITOR_TYPE.HTTP]: 'HTTP(s)',
    [MONITOR_TYPE.PING]: 'Ping',
    [MONITOR_TYPE.TCP]: 'TCP Ports',
    [MONITOR_TYPE.DNS]: 'DNS',
    [MONITOR_TYPE.KEYWORD]: 'Keyword',
    [MONITOR_TYPE.CRON]: 'Cron Job',
    [MONITOR_TYPE.HEARTBEAT]: 'Heartbeat',
    [MONITOR_TYPE.BROWSER]: 'Headless Browser',
};

const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s ago`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m ago`;
};

const formatDuration = (ms: number) => {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    if (h > 0) return `${h}h ${m % 60}m`;
    return `${m}m ${s % 60}s`;
};

const calcUptime = (logs: any[], since: Date): number => {
    const filtered = logs.filter(l => new Date(l.createdAt) >= since);
    if (!filtered.length) return 100;
    const up = filtered.filter(l => l.status === 2).length;
    return Math.round((up / filtered.length) * 1000) / 10;
};

const MonitorDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();

    const [monitor, setMonitor] = useState<any>(null);
    const [logs, setLogs] = useState<any[]>([]);
    const [incidents, setIncidents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [sendingTestAlert, setSendingTestAlert] = useState(false);
    const [performance, setPerformance] = useState<any>(null);
    const [performanceDays, setPerformanceDays] = useState(7);
    const [alertHistory, setAlertHistory] = useState<any[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!id) return;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const [monRes, logRes, incRes] = await Promise.all([
                    monitorApi.getById(Number(id)),
                    cronActivityLogApi.getPaginated({
                        page: 1,
                        limit: 100,
                        filter: { monitorId: Number(id) },
                        sortBy: { createdAt: -1 },
                    }),
                    incidentApi.paginate({
                        page: 1,
                        limit: 20,
                        filter: { monitorId: Number(id) },
                        sortBy: { startTime: -1 },
                        populateFields: ['monitor'],
                    }),
                ]);

                let alertHistoryData: any[] = [];
                try {
                    const alertRes = await monitorApi.getAlertHistory(Number(id));
                    alertHistoryData = alertRes.data.data || [];
                } catch {
                    alertHistoryData = [];
                }
                setMonitor(monRes.data.data);
                setLogs(logRes.data.data.data || []);
                setIncidents(incRes.data.data.data || []);
                setAlertHistory(alertHistoryData);
            } catch (e: any) {
                setError('Failed to load monitor details.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, refreshKey]);

    const handleToggle = async () => {
        if (!monitor) return;
        setToggling(true);
        try {
            if (monitor.isActive) {
                await monitorApi.deactivate(monitor.id);
                toast.success('Monitor paused');
            } else {
                await monitorApi.activate(monitor.id);
                toast.success('Monitor resumed');
            }
            setRefreshKey(k => k + 1);
        } catch {
            toast.error('Failed to update monitor status');
        } finally {
            setToggling(false);
        }
    };

    const handleEditSubmit = async (data: any) => {
        try {
            await monitorApi.update(monitor.id, data);
            toast.success('Monitor updated');
            setEditOpen(false);
            setRefreshKey(k => k + 1);
        } catch (e: any) {
            toast.error(e.message || 'Failed to update monitor');
        }
    };

    const handleSendTestAlert = async () => {
        if (!monitor) return;
        setSendingTestAlert(true);
        try {
            const response = await monitorApi.sendTestAlert(monitor.id);
            const result = response.data?.data || {};
            toast.success(`Test alert done (Email: ${result.emailSent ? 'sent' : 'failed'}, SMS: ${result.smsSent ? 'sent' : 'failed'})`);
            setRefreshKey((k) => k + 1);
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Failed to send test alert');
        } finally {
            setSendingTestAlert(false);
        }
    };

    const fetchPerformance = async () => {
        if (!id) return;
        try {
            const response = await monitorApi.getPerformance(Number(id), { days: performanceDays });
            setPerformance(response.data.data);
        } catch (error) {
            console.error('Failed to fetch performance stats', error);
        }
    };

    useEffect(() => {
        fetchPerformance();
    }, [id, performanceDays, refreshKey]);

    // Derived data
    const now = new Date();
    const last24h = useMemo(() => new Date(now.getTime() - 24 * 3600 * 1000), []);
    const last7d = useMemo(() => new Date(now.getTime() - 7 * 24 * 3600 * 1000), []);
    const last30d = useMemo(() => new Date(now.getTime() - 30 * 24 * 3600 * 1000), []);

    const uptime24h = useMemo(() => calcUptime(logs, last24h), [logs, last24h]);
    const uptime7d = useMemo(() => calcUptime(logs, last7d), [logs, last7d]);
    const uptime30d = useMemo(() => calcUptime(logs, last30d), [logs, last30d]);

    // Last 50 checks for status bars
    const recentLogs = useMemo(() => logs.slice(0, 60).reverse(), [logs]);

    // Response time chart - last 30 checks that have duration
    const chartData = useMemo(() => {
        return logs
            .filter(l => (l.durationMs ?? l.metadata?.durationMs) != null)
            .slice(0, 30)
            .reverse()
            .map(l => ({
                time: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                ms: l.durationMs ?? l.metadata?.durationMs ?? 0,
            }));
    }, [logs]);

    const avgMs = chartData.length ? Math.round(chartData.reduce((s, d) => s + d.ms, 0) / chartData.length) : null;
    const minMs = chartData.length ? Math.min(...chartData.map(d => d.ms)) : null;
    const maxMs = chartData.length ? Math.max(...chartData.map(d => d.ms)) : null;
    const tcpHost = monitor?.type === MONITOR_TYPE.TCP && typeof monitor?.url === 'string' && monitor.url.includes(':')
        ? monitor.url.split(':')[0]
        : null;
    const tcpPorts = monitor?.type === MONITOR_TYPE.TCP && typeof monitor?.url === 'string' && monitor.url.includes(':')
        ? monitor.url.split(':').slice(1).join(':')
        : null;

    const lastLog = logs[0];
    const isUp = monitor?.lastStatus === MONITOR_STATUS.UP;
    const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1502/api').replace(/\/api\/?$/, '');
    const pingEndpoint = monitor && [MONITOR_TYPE.CRON, MONITOR_TYPE.HEARTBEAT].includes(monitor.type)
        ? `${apiBaseUrl}/api/web/monitor/ping/${monitor.id}`
        : null;

    const uptimeColor = (pct: number) => {
        if (pct >= 99) return '#10b981';
        if (pct >= 95) return '#f59e0b';
        return '#ef4444';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
                <CircularProgress sx={{ color: '#0A3D62' }} />
                <Typography variant="body2" color="text.secondary">Loading monitor details...</Typography>
            </Box>
        );
    }

    if (error || !monitor) {
        return (
            <Box>
                <Button startIcon={<ArrowLeft size={18} />} onClick={() => navigate('/monitors')} sx={{ mb: 2 }}>
                    Back to Monitors
                </Button>
                <Alert severity="error" sx={{ borderRadius: 3 }}>{error || 'Monitor not found.'}</Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Breadcrumb />

            {/* ── Header ── */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowLeft size={16} />}
                    onClick={() => navigate('/monitors')}
                    size="small"
                    sx={{ mb: 2, color: 'text.secondary', fontWeight: 600, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' } }}
                >
                    All Monitors
                </Button>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        {/* Status dot */}
                        <Box sx={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: monitor.lastStatus
                                ? (isUp ? alpha('#10b981', 0.12) : alpha('#ef4444', 0.12))
                                : alpha('#94a3b8', 0.12),
                            boxShadow: monitor.lastStatus
                                ? `0 0 0 4px ${isUp ? alpha('#10b981', 0.15) : alpha('#ef4444', 0.15)}`
                                : 'none',
                        }}>
                            {isUp
                                ? <Wifi size={22} color="#10b981" />
                                : monitor.lastStatus
                                    ? <WifiOff size={22} color="#ef4444" />
                                    : <Globe size={22} color="#94a3b8" />
                            }
                        </Box>

                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0A3D62', letterSpacing: '-0.02em' }}>
                                    {monitor.name}
                                </Typography>
                                <Link
                                    href={monitor.url}
                                    target="_blank"
                                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b', '&:hover': { color: '#0A3D62' } }}
                                >
                                    <ExternalLink size={16} />
                                </Link>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                    label={MONITOR_TYPE_LABELS[monitor.type] || 'HTTP'}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontWeight: 700, fontSize: '0.7rem', borderRadius: 1, height: 22 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {monitor.url}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Action buttons */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Tooltip title="Refresh">
                            <IconButton
                                size="small"
                                onClick={() => setRefreshKey(k => k + 1)}
                                sx={{ bgcolor: '#F1F5F9', '&:hover': { bgcolor: '#E2E8F0' } }}
                            >
                                <RefreshCw size={16} color="#64748b" />
                            </IconButton>
                        </Tooltip>
                        <Button
                            variant="outlined"
                            startIcon={monitor.isActive ? <Pause size={16} /> : <Play size={16} />}
                            onClick={handleToggle}
                            disabled={toggling}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                borderColor: monitor.isActive ? '#f59e0b' : '#10b981',
                                color: monitor.isActive ? '#f59e0b' : '#10b981',
                                '&:hover': {
                                    bgcolor: monitor.isActive ? alpha('#f59e0b', 0.06) : alpha('#10b981', 0.06),
                                    borderColor: monitor.isActive ? '#f59e0b' : '#10b981',
                                }
                            }}
                        >
                            {monitor.isActive ? 'Pause' : 'Resume'}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Edit size={16} />}
                            onClick={() => setEditOpen(true)}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                bgcolor: '#0A3D62',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#0d4d7a', boxShadow: '0 4px 12px rgba(10,61,98,0.25)' }
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Zap size={16} />}
                            onClick={handleSendTestAlert}
                            disabled={sendingTestAlert}
                            size="small"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 700,
                                bgcolor: '#16a34a',
                                boxShadow: 'none',
                                '&:hover': { bgcolor: '#15803d', boxShadow: '0 4px 12px rgba(21,128,61,0.25)' }
                            }}
                        >
                            Test Alert
                        </Button>
                    </Box>
                </Box>
            </Box>

            <Grid container spacing={3}>
                {/* ── Performance & Benchmarking ── */}
                {performance && (
                    <Grid size={{ xs: 12 }}>
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <CardContent sx={{ p: 3, textAlign: 'center' }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 700, mb: 1 }}>
                                            Benchmarking Score
                                        </Typography>
                                        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
                                            <CircularProgress
                                                variant="determinate"
                                                value={performance?.summary?.score || 0}
                                                size={120}
                                                thickness={6}
                                                sx={{ color: (performance?.summary?.score || 0) > 80 ? '#10b981' : '#f59e0b' }}
                                            />
                                            <Box sx={{
                                                top: 0, left: 0, bottom: 0, right: 0, position: 'absolute',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0A3D62' }}>
                                                    {performance?.summary?.score || '--'}
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Speed & reliability score based on the last {performanceDays} days.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12, md: 8 }}>
                                <Card sx={{ borderRadius: 4, height: '100%', border: '1px solid rgba(0,0,0,0.06)' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                                Performance Trends
                                            </Typography>
                                            <Stack direction="row" spacing={1}>
                                                {[24, 7, 30].map(d => (
                                                    <Button
                                                        key={d}
                                                        size="small"
                                                        variant={performanceDays === (d === 24 ? 1 : d) ? 'contained' : 'outlined'}
                                                        onClick={() => setPerformanceDays(d === 24 ? 1 : d)}
                                                        sx={{ borderRadius: 2, minWidth: 60, textTransform: 'none', fontWeight: 700 }}
                                                    >
                                                        {d === 24 ? '24h' : `${d}d`}
                                                    </Button>
                                                ))}
                                            </Stack>
                                        </Box>

                                        <Box sx={{ height: 180 }}>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={performance?.history || []}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                                    <XAxis dataKey="timestamp" hide />
                                                    <YAxis hide domain={['auto', 'auto']} />
                                                    <RechartsTooltip
                                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                        formatter={(val: any) => [`${val}ms`, 'Response Time']}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="responseTime"
                                                        stroke="#0A3D62"
                                                        strokeWidth={3}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </Box>

                                        <Stack direction="row" spacing={4} sx={{ mt: 2, justifyContent: 'center' }}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                                    {performance?.summary?.uptime || '--'}%
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">Uptime</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                                    {performance?.summary?.avgResponseTime || '--'}ms
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">Avg Speed</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Grid>
                )}

                {/* ── LEFT MAIN COLUMN ── */}
                <Grid size={{ xs: 12, lg: 8 }}>

                    {/* Status Row */}
                    <Grid container spacing={2.5} sx={{ mb: 3 }}>
                        {/* Current Status */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card sx={{
                                borderRadius: 3,
                                boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                                border: `1px solid ${monitor.lastStatus ? (isUp ? alpha('#10b981', 0.2) : alpha('#ef4444', 0.2)) : 'rgba(0,0,0,0.06)'}`,
                                bgcolor: monitor.lastStatus ? (isUp ? alpha('#10b981', 0.03) : alpha('#ef4444', 0.03)) : '#fff',
                            }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Current Status
                                    </Typography>
                                    <Typography variant="h4" sx={{
                                        fontWeight: 900,
                                        color: monitor.lastStatus ? (isUp ? '#10b981' : '#ef4444') : '#94a3b8',
                                        mt: 0.75,
                                        mb: 0.5,
                                        letterSpacing: '-0.02em'
                                    }}>
                                        {monitor.lastStatus ? (isUp ? 'Up' : 'Down') : 'Unknown'}
                                    </Typography>
                                    {lastLog && (
                                        <Typography variant="caption" color="text.secondary">
                                            Since {formatTimeAgo(lastLog.createdAt)}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Last Check */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Last Check
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0A3D62', mt: 0.75, mb: 0.5 }}>
                                        {lastLog ? formatTimeAgo(lastLog.createdAt) : 'N/A'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Clock size={13} color="#94a3b8" />
                                        <Typography variant="caption" color="text.secondary">
                                            Every {monitor.checkInterval || monitor.checkInterval} min
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Last 24h */}
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
                                <CardContent sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            Last 24 Hours
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 900, color: uptimeColor(uptime24h) }}>
                                            {uptime24h}%
                                        </Typography>
                                    </Box>
                                    {/* Status bar blocks */}
                                    <Box sx={{ display: 'flex', gap: '2px', mt: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
                                        {recentLogs.slice(-48).map((log, i) => (
                                            <Tooltip
                                                key={i}
                                                title={`${new Date(log.createdAt).toLocaleTimeString()} - ${log.status === 2 ? 'Up' : 'Down'}`}
                                            >
                                                <Box sx={{
                                                    width: 6,
                                                    height: 20,
                                                    borderRadius: '2px',
                                                    bgcolor: log.status === 2 ? '#10b981' : '#ef4444',
                                                    cursor: 'default',
                                                    flexShrink: 0,
                                                }} />
                                            </Tooltip>
                                        ))}
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {logs.filter(l => new Date(l.createdAt) >= last24h && l.status !== 2).length} incidents
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Uptime Stats */}
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2.5 }}>
                                Uptime Overview
                            </Typography>
                            <Grid container spacing={2}>
                                {[
                                    { label: 'Last 7 Days', value: uptime7d },
                                    { label: 'Last 30 Days', value: uptime30d },
                                    { label: 'Last 24 Hours', value: uptime24h },
                                ].map(({ label, value }) => (
                                    <Grid size={{ xs: 12, sm: 4 }} key={label}>
                                        <Box sx={{
                                            p: 2,
                                            borderRadius: 2.5,
                                            bgcolor: alpha(uptimeColor(value), 0.06),
                                            border: `1px solid ${alpha(uptimeColor(value), 0.15)}`,
                                            textAlign: 'center'
                                        }}>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: uptimeColor(value), letterSpacing: '-0.02em' }}>
                                                {value}%
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                {label}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Response Time Chart */}
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                <Box>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                        Response Time
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">Last 30 checks</Typography>
                                </Box>
                                {avgMs !== null && (
                                    <Chip
                                        icon={<Zap size={13} />}
                                        label={`Avg ${avgMs}ms`}
                                        size="small"
                                        sx={{ bgcolor: alpha('#0A3D62', 0.08), color: '#0A3D62', fontWeight: 700, fontSize: '0.75rem' }}
                                    />
                                )}
                            </Box>

                            {chartData.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 6 }}>
                                    <Activity size={36} color="#94a3b8" style={{ marginBottom: 8 }} />
                                    <Typography variant="body2" color="text.secondary">No response time data yet</Typography>
                                </Box>
                            ) : (
                                <>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={alpha(theme.palette.divider, 0.4)} />
                                            <XAxis
                                                dataKey="time"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                                interval="preserveStartEnd"
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                                tickFormatter={v => `${v}ms`}
                                            />
                                            <RechartsTooltip
                                                formatter={(v: any) => [`${v}ms`, 'Response Time']}
                                                contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '0.8rem' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="ms"
                                                stroke="#0A3D62"
                                                strokeWidth={2.5}
                                                dot={false}
                                                activeDot={{ r: 4, fill: '#0A3D62', strokeWidth: 0 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>

                                    {/* Stats row */}
                                    <Divider sx={{ my: 2 }} />
                                    <Grid container spacing={2}>
                                        {[
                                            { label: 'Average', value: avgMs, icon: <Activity size={16} /> },
                                            { label: 'Minimum', value: minMs, icon: <CheckCircle size={16} color="#10b981" /> },
                                            { label: 'Maximum', value: maxMs, icon: <AlertTriangle size={16} color="#f59e0b" /> },
                                        ].map(({ label, value, icon }) => (
                                            <Grid size={{ xs: 4 }} key={label}>
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5, color: '#64748b' }}>{icon}</Box>
                                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62', lineHeight: 1 }}>
                                                        {value !== null ? `${value} ms` : 'N/A'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">{label}</Typography>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Latest Incidents */}
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 3, pb: 0 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2 }}>
                                Latest Incidents
                            </Typography>
                        </CardContent>

                        {incidents.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 6, px: 3 }}>
                                <Box sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    bgcolor: alpha('#10b981', 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1.5
                                }}>
                                    <CheckCircle size={26} color="#10b981" />
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#10b981', mb: 0.5 }}>
                                    No incidents found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    This monitor has been running without any incidents.
                                </Typography>
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            {['Detected At', 'Resolved At', 'Duration', 'Reason', 'Status'].map(h => (
                                                <TableCell key={h} sx={{
                                                    bgcolor: '#F8FAFC',
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                    color: '#64748b',
                                                    py: 1.5,
                                                }}>
                                                    {h}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {incidents.map((inc, i) => {
                                            const dur = inc.endTime
                                                ? formatDuration(new Date(inc.endTime).getTime() - new Date(inc.startTime).getTime())
                                                : '—';
                                            return (
                                                <TableRow key={inc.id} sx={{
                                                    bgcolor: i % 2 === 0 ? '#fff' : '#FAFBFE',
                                                    '&:last-child td': { borderBottom: 0 },
                                                }}>
                                                    <TableCell sx={{ fontSize: '0.8125rem', py: 1.5 }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                            <Clock size={13} color="#94a3b8" />
                                                            {new Date(inc.startTime).toLocaleString()}
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.8125rem', py: 1.5 }}>
                                                        {inc.endTime
                                                            ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><CheckCircle size={13} color="#10b981" />{new Date(inc.endTime).toLocaleString()}</Box>
                                                            : <Typography variant="body2" color="warning.main" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>In Progress</Typography>
                                                        }
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8rem', py: 1.5 }}>
                                                        {dur}
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.8125rem', color: '#ef4444', fontStyle: 'italic', py: 1.5, maxWidth: 200 }}>
                                                        <Typography variant="body2" sx={{ color: 'error.main', fontStyle: 'italic', fontSize: '0.8125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {inc.cause || 'Unknown error'}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ py: 1.5 }}>
                                                        <Chip
                                                            label={inc.status === INCIDENT_STATUS.OPEN ? 'Active' : 'Resolved'}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: '0.7rem',
                                                                borderRadius: 1,
                                                                bgcolor: inc.status === INCIDENT_STATUS.OPEN ? alpha('#ef4444', 0.1) : alpha('#10b981', 0.1),
                                                                color: inc.status === INCIDENT_STATUS.OPEN ? '#ef4444' : '#10b981',
                                                            }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Card>

                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', mt: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2.5 }}>
                                Alert Delivery History (Email/SMS)
                            </Typography>
                            {alertHistory.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    No alert history yet. Use "Test Alert" to verify channel delivery.
                                </Typography>
                            ) : (
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                {['When', 'Channel', 'Status', 'Recipient'].map((h) => (
                                                    <TableCell
                                                        key={h}
                                                        sx={{
                                                            bgcolor: '#F8FAFC',
                                                            fontWeight: 700,
                                                            fontSize: '0.7rem',
                                                            textTransform: 'uppercase',
                                                            letterSpacing: '0.06em',
                                                            color: '#64748b',
                                                            py: 1.25,
                                                        }}
                                                    >
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {alertHistory.slice(0, 8).map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell sx={{ fontSize: '0.78rem', py: 1.25 }}>
                                                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, py: 1.25 }}>
                                                        {item.channel || '-'}
                                                    </TableCell>
                                                    <TableCell sx={{ py: 1.25 }}>
                                                        <Chip
                                                            size="small"
                                                            label={item.status || '-'}
                                                            sx={{
                                                                fontWeight: 700,
                                                                bgcolor: item.status === 'SENT'
                                                                    ? alpha('#10b981', 0.1)
                                                                    : item.status === 'FAILED'
                                                                        ? alpha('#ef4444', 0.1)
                                                                        : alpha('#f59e0b', 0.1),
                                                                color: item.status === 'SENT'
                                                                    ? '#10b981'
                                                                    : item.status === 'FAILED'
                                                                        ? '#ef4444'
                                                                        : '#f59e0b'
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.78rem', py: 1.25 }}>
                                                        {item.recipient || '-'}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* ── RIGHT SIDEBAR ── */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    {/* Monitor Info */}
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2.5 }}>
                                Monitor Details
                            </Typography>

                            {[
                                {
                                    label: 'URL',
                                    value: (
                                        <Link href={monitor.url} target="_blank" sx={{ color: '#0A3D62', fontWeight: 600, wordBreak: 'break-all', display: 'flex', alignItems: 'center', justifyContent: 'end', gap: 0.5 }}>
                                            {monitor.url} <ExternalLink size={12} />
                                        </Link>
                                    )
                                },
                                { label: 'Type', value: MONITOR_TYPE_LABELS[monitor.type] || 'HTTP' },
                                ...(tcpHost ? [{ label: 'TCP Host', value: tcpHost }] : []),
                                ...(tcpPorts ? [{ label: 'TCP Ports', value: tcpPorts }] : []),
                                { label: 'Check Interval', value: `Every ${monitor.checkInterval} min` },
                                { label: 'Monitor Status', value: monitor.isActive ? 'Active' : 'Paused' },
                                {
                                    label: 'SSL Expiry Date',
                                    value: monitor.sslExpiresAt
                                        ? new Date(monitor.sslExpiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : 'Not available yet'
                                },
                                {
                                    label: 'Domain Expiry Date',
                                    value: monitor.domainExpiresAt
                                        ? new Date(monitor.domainExpiresAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                                        : 'Not available yet'
                                },
                                { label: 'Created', value: new Date(monitor.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
                            ].map(({ label, value }) => (
                                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', py: 1.25, borderBottom: '1px solid rgba(0,0,0,0.05)', '&:last-child': { borderBottom: 0 } }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, minWidth: 110 }}>
                                        {label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827', textAlign: 'right', flex: 1 }}>
                                        {value}
                                    </Typography>
                                </Box>
                            ))}

                            {tcpHost && tcpPorts && (
                                <Alert
                                    severity="info"
                                    sx={{
                                        mt: 2.5,
                                        borderRadius: 2.5,
                                        bgcolor: alpha('#0A3D62', 0.04),
                                        color: '#0A3D62',
                                        '& .MuiAlert-icon': { color: '#0A3D62' }
                                    }}
                                >
                                    This TCP monitor checks all added ports under one monitor entry, so it stays user-friendly and counts as one monitor.
                                </Alert>
                            )}

                            {pingEndpoint && (
                                <Alert
                                    severity="info"
                                    sx={{
                                        mt: 2.5,
                                        borderRadius: 2.5,
                                        bgcolor: alpha('#0A3D62', 0.04),
                                        color: '#0A3D62',
                                        '& .MuiAlert-icon': { color: '#0A3D62' }
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                                        {monitor.type === MONITOR_TYPE.CRON ? 'Cron ping URL' : 'Heartbeat ping URL'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', wordBreak: 'break-all' }}>
                                        {pingEndpoint}
                                    </Typography>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>

                    {/* SSL Status */}
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                    SSL Monitoring
                                </Typography>
                                <Button 
                                    size="small" 
                                    startIcon={<RefreshCw size={12} />} 
                                    onClick={async () => {
                                        toast.loading('Checking SSL status...', { id: 'ssl-check' });
                                        try {
                                            await monitorApi.refreshWarnings(monitor.id);
                                            toast.success('SSL status updated', { id: 'ssl-check' });
                                            setRefreshKey(k => k + 1);
                                        } catch {
                                            toast.error('Failed to update SSL status', { id: 'ssl-check' });
                                        }
                                    }}
                                    sx={{ fontSize: '0.65rem', py: 0.25, height: 20, borderRadius: 1 }}
                                >
                                    Check Now
                                </Button>
                            </Box>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor: monitor.sslMonitoring ? alpha('#10b981', 0.06) : '#F8FAFC',
                                border: `1px solid ${monitor.sslMonitoring ? alpha('#10b981', 0.2) : 'rgba(0,0,0,0.06)'}`,
                            }}>
                                {monitor.sslMonitoring
                                    ? <Shield size={20} color="#10b981" />
                                    : <ShieldOff size={20} color="#94a3b8" />
                                }
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: monitor.sslMonitoring ? '#10b981' : '#94a3b8' }}>
                                        {monitor.sslMonitoring ? 'SSL Monitoring Active' : 'SSL Monitoring Disabled'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {monitor.sslMonitoring
                                            ? 'Certificate expiry alerts are enabled'
                                            : 'Enable to monitor SSL certificate expiry'}
                                    </Typography>
                                </Box>
                            </Box>

                            {monitor.sslMonitoring && (
                                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#f59e0b', 0.05), border: `1px solid ${alpha('#f59e0b', 0.15)}` }}>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62' }}>
                                            {monitor.sslWarningDaysRemaining != null
                                                ? `${monitor.sslWarningDaysRemaining} day(s) remaining`
                                                : 'No SSL warning data yet'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {monitor.sslExpiresAt
                                                ? `Expires on ${new Date(monitor.sslExpiresAt).toLocaleDateString()}`
                                                : 'Expiry date will appear after the warning scan runs'}
                                        </Typography>
                                    </Box>

                                    {/* Detailed SSL Info */}
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#0A3D62', 0.03), border: '1px solid rgba(0,0,0,0.05)' }}>
                                        {[
                                            { label: 'Issuer', value: monitor.sslIssuer },
                                            { label: 'Protocol', value: monitor.sslProtocol },
                                            { label: 'Cipher', value: monitor.sslCipher },
                                            { label: 'Wildcard', value: monitor.sslIsWildcard ? 'Yes' : 'No' }
                                        ].map(row => (
                                            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{row.label}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0A3D62', textAlign: 'right', maxWidth: '60%' }}>{row.value || 'N/A'}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                                    Domain Expiry
                                </Typography>
                                <Button 
                                    size="small" 
                                    startIcon={<RefreshCw size={12} />} 
                                    onClick={async () => {
                                        toast.loading('Checking domain status...', { id: 'domain-check' });
                                        try {
                                            await monitorApi.refreshWarnings(monitor.id);
                                            toast.success('Domain status updated', { id: 'domain-check' });
                                            setRefreshKey(k => k + 1);
                                        } catch {
                                            toast.error('Failed to update domain status', { id: 'domain-check' });
                                        }
                                    }}
                                    sx={{ fontSize: '0.65rem', py: 0.25, height: 20, borderRadius: 1 }}
                                >
                                    Check Now
                                </Button>
                            </Box>

                            <Box sx={{
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor: monitor.domainMonitoring ? alpha('#f59e0b', 0.06) : '#F8FAFC',
                                border: `1px solid ${monitor.domainMonitoring ? alpha('#f59e0b', 0.18) : 'rgba(0,0,0,0.06)'}`,
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: 1.5,
                                mb: 2
                            }}>
                                <CalendarClock size={18} color={monitor.domainMonitoring ? '#f59e0b' : '#94a3b8'} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#111827' }}>
                                        {monitor.domainMonitoring
                                            ? (
                                                monitor.domainWarningDaysRemaining != null
                                                    ? `${monitor.domainWarningDaysRemaining} day(s) remaining`
                                                    : 'Domain monitoring is active'
                                            )
                                            : 'Domain expiry monitoring disabled'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {monitor.domainMonitoring
                                            ? (
                                                monitor.domainExpiresAt
                                                    ? `Expires on ${new Date(monitor.domainExpiresAt).toLocaleDateString()}`
                                                    : 'Expiry details will appear after the warning scan runs'
                                            )
                                            : 'Enable it in monitor settings when you want expiry alerts for this domain'}
                                    </Typography>
                                </Box>
                            </Box>

                            {monitor.domainMonitoring && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#0A3D62', 0.03), border: '1px solid rgba(0,0,0,0.05)' }}>
                                        {[
                                            { label: 'Registrar', value: monitor.domainRegistrar },
                                            { label: 'Status', value: monitor.domainStatus },
                                            { 
                                                label: 'Nameservers', 
                                                value: (() => {
                                                    try {
                                                        const ns = JSON.parse(monitor.domainNameServers || '[]');
                                                        return Array.isArray(ns) && ns.length > 0 ? ns.join(', ') : null;
                                                    } catch { return null; }
                                                })()
                                            },
                                        ].map(row => (
                                            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>{row.label}</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 600, color: '#0A3D62', textAlign: 'right', maxWidth: '60%' }}>{row.value || 'Not found'}</Typography>
                                            </Box>
                                        ))}
                                    </Box>

                                    {monitor.domainDnsRecords && (
                                        <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#0A3D62', 0.03), border: '1px solid rgba(0,0,0,0.05)' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>DNS Records (A/MX)</Typography>
                                            <Box sx={{ maxHeight: 100, overflowY: 'auto' }}>
                                                {(() => {
                                                    const records = JSON.parse(monitor.domainDnsRecords);
                                                    return (
                                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                            {records.a?.map((ip: string, i: number) => (
                                                                <Typography key={`a-${i}`} variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>A: {ip}</Typography>
                                                            ))}
                                                            {records.mx?.map((mx: any, i: number) => (
                                                                <Typography key={`mx-${i}`} variant="caption" sx={{ fontFamily: 'monospace', display: 'block' }}>MX: {mx.exchange} ({mx.priority})</Typography>
                                                            ))}
                                                        </Box>
                                                    );
                                                })()}
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            )}
                        </CardContent>
                    </Card>


                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)', mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2.5 }}>
                                Blacklist Monitoring
                            </Typography>

                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 2,
                                borderRadius: 2.5,
                                bgcolor: monitor.blacklistMonitoring ? alpha('#6366f1', 0.06) : '#F8FAFC',
                                border: `1px solid ${monitor.blacklistMonitoring ? alpha('#6366f1', 0.2) : 'rgba(0,0,0,0.06)'}`,
                                mb: 2
                            }}>
                                <Zap size={20} color={monitor.blacklistMonitoring ? '#6366f1' : '#94a3b8'} />
                                <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 700, color: monitor.blacklistMonitoring ? '#6366f1' : '#111827' }}>
                                        {monitor.blacklistMonitoring ? 'Blacklist Monitoring Active' : 'Blacklist Monitoring Disabled'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {monitor.blacklistMonitoring ? 'Checking against major RBLs' : 'Enable to check if domain/IP is blacklisted'}
                                    </Typography>
                                </Box>
                            </Box>

                            {monitor.blacklistMonitoring && (
                                <Box sx={{ p: 2, borderRadius: 2, bgcolor: alpha('#0A3D62', 0.03), border: '1px solid rgba(0,0,0,0.05)' }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}>Status</Typography>
                                    {(() => {
                                        try {
                                            const status = JSON.parse(monitor.lastBlacklistStatus || '{}');
                                            const listings = Object.entries(status).filter(([_, listed]) => listed);

                                            if (listings.length === 0) {
                                                return (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <CheckCircle size={14} color="#10b981" />
                                                        <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>Clean - Not listed on any major RBLs</Typography>
                                                    </Box>
                                                );
                                            }

                                            return (
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                    <Typography variant="caption" sx={{ color: '#ef4444', fontWeight: 700 }}>Listed on {listings.length} RBL(s):</Typography>
                                                    {listings.map(([rbl]) => (
                                                        <Box key={rbl} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <Activity size={12} color="#ef4444" />
                                                            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>{rbl}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            );
                                        } catch (e) {
                                            return <Typography variant="caption" color="text.secondary">No blacklist scan results yet</Typography>;
                                        }
                                    })()}
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <Card sx={{ borderRadius: 3, boxShadow: '0 2px 16px rgba(0,0,0,0.07)', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2.5 }}>
                                Incident Summary
                            </Typography>

                            {[
                                {
                                    label: 'Total Incidents',
                                    value: incidents.length,
                                    color: '#64748b'
                                },
                                {
                                    label: 'Open',
                                    value: incidents.filter(i => i.status === INCIDENT_STATUS.OPEN).length,
                                    color: '#ef4444'
                                },
                                {
                                    label: 'Resolved',
                                    value: incidents.filter(i => i.status === INCIDENT_STATUS.RESOLVED).length,
                                    color: '#10b981'
                                },
                            ].map(({ label, value, color }) => (
                                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1.25, borderBottom: '1px solid rgba(0,0,0,0.05)', '&:last-child': { borderBottom: 0 } }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                        {label}
                                    </Typography>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color }}>
                                        {value}
                                    </Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>

                    
                </Grid>
            </Grid>

            {/* Edit Modal */}
            <MonitorForm
                open={editOpen}
                onClose={() => setEditOpen(false)}
                onSubmit={handleEditSubmit}
                initialData={monitor}
                loading={false}
            />
        </Box>
    );
};

export default MonitorDetailPage;
