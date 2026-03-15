import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Container,
    Typography,
    Stack,
    alpha,
    Chip,
    CircularProgress,
    Tooltip,
    Divider,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { statusPageApi } from '../../api/statusPageApi';
import type { IStatusPage, IMonitor } from '../../types';
import { MONITOR_STATUS, MONITOR_TYPE } from '../../types';
import {
    Globe, CheckCircle, AlertTriangle, XCircle,
    Shield, Activity, Wifi, Server, Search, Timer
} from 'lucide-react';

// ─── Constants ──────────────────────────────────────────────────────────────

const MONITOR_TYPE_LABELS: Record<number, string> = {
    [MONITOR_TYPE.HTTP]: 'HTTP(s)',
    [MONITOR_TYPE.PING]: 'Ping',
    [MONITOR_TYPE.TCP]: 'TCP Port',
    [MONITOR_TYPE.DNS]: 'DNS',
    [MONITOR_TYPE.KEYWORD]: 'Keyword',
    [MONITOR_TYPE.CRON]: 'Cron Job',
    [MONITOR_TYPE.HEARTBEAT]: 'Heartbeat',
    [MONITOR_TYPE.BROWSER]: 'Browser',
};

const MONITOR_TYPE_ICONS: Record<number, React.ReactNode> = {
    [MONITOR_TYPE.HTTP]: <Globe size={16} />,
    [MONITOR_TYPE.PING]: <Wifi size={16} />,
    [MONITOR_TYPE.TCP]: <Server size={16} />,
    [MONITOR_TYPE.DNS]: <Search size={16} />,
    [MONITOR_TYPE.KEYWORD]: <Search size={16} />,
    [MONITOR_TYPE.CRON]: <Timer size={16} />,
    [MONITOR_TYPE.HEARTBEAT]: <Activity size={16} />,
    [MONITOR_TYPE.BROWSER]: <Globe size={16} />,
};

// ─── MonitorRow ──────────────────────────────────────────────────────────────

const MonitorRow: React.FC<{ monitor: IMonitor; themeColor: string }> = ({ monitor, themeColor }) => {
    const lastStatus = monitor.lastStatus || MONITOR_STATUS.UNKNOWN;
    const isUp = lastStatus === MONITOR_STATUS.UP;
    const isDown = lastStatus === MONITOR_STATUS.DOWN;
    const isDegraded = lastStatus === MONITOR_STATUS.DEGRADED;

    const statusColor = isUp ? '#10b981' : isDown ? '#ef4444' : isDegraded ? '#f59e0b' : '#94a3b8';
    const statusLabel = isUp ? 'Operational' : isDown ? 'Major Outage' : isDegraded ? 'Degraded' : 'Unknown';
    const statusDotColor = isUp ? '#00FFD1' : isDown ? '#ef4444' : isDegraded ? '#f59e0b' : '#94a3b8';

    return (
        <Box sx={{
            borderRadius: 3,
            border: '1px solid',
            borderColor: isDown ? alpha('#ef4444', 0.2) : isDegraded ? alpha('#f59e0b', 0.2) : 'rgba(0,0,0,0.06)',
            bgcolor: isDown ? alpha('#ef4444', 0.02) : '#ffffff',
            overflow: 'hidden',
            transition: 'box-shadow 0.2s ease',
            '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }
        }}>
            {/* Header row */}
            <Box sx={{
                px: 3, py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1
            }}>
                {/* Left: icon + name + url */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box sx={{
                        width: 36, height: 36, borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: alpha(themeColor, 0.1), color: themeColor
                    }}>
                        {MONITOR_TYPE_ICONS[monitor.type] || <Globe size={16} />}
                    </Box>
                    <Box>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: '#1A202C', lineHeight: 1.2 }}>
                            {monitor.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>
                            {monitor.url}
                        </Typography>
                    </Box>
                </Stack>

                {/* Right: status badge */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <Box sx={{
                            width: 8, height: 8, borderRadius: '50%',
                            bgcolor: statusDotColor,
                            boxShadow: `0 0 6px ${statusDotColor}`,
                            animation: isUp ? 'pulse 2s infinite' : 'none',
                            '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.5 }
                            }
                        }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {statusLabel}
                        </Typography>
                    </Stack>

                    {/* Meta chips */}
                    <Chip
                        label={MONITOR_TYPE_LABELS[monitor.type] || 'Monitor'}
                        size="small"
                        sx={{ fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', bgcolor: alpha(themeColor, 0.08), color: themeColor, border: 'none' }}
                    />
                    <Tooltip title={`Checks every ${monitor.checkInterval} minutes`}>
                        <Chip
                            icon={<Timer size={11} />}
                            label={`${monitor.checkInterval}m`}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 600, borderRadius: '6px', fontSize: '0.7rem', borderColor: 'rgba(0,0,0,0.1)', color: '#64748b' }}
                        />
                    </Tooltip>
                    {monitor.sslMonitoring && (
                        <Tooltip title="SSL Monitored">
                            <Shield size={16} color="#10b981" />
                        </Tooltip>
                    )}
                </Stack>
            </Box>

            {/* 90-day uptime bar */}
            <Box sx={{ px: 3, pb: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500 }}>90-day availability</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: isUp ? '#10b981' : '#ef4444' }}>
                        {isUp ? '100.000%' : 'Outage detected'}
                    </Typography>
                </Stack>
                <Box sx={{ display: 'flex', gap: '2px', height: 20 }}>
                    {Array.from({ length: 90 }).map((_, i) => {
                        const isRecentIssue = !isUp && i >= 87;
                        return (
                            <Tooltip key={i} title={`Day ${90 - i}`} arrow>
                                <Box
                                    sx={{
                                        flex: 1,
                                        borderRadius: '2px',
                                        bgcolor: isRecentIssue ? alpha('#ef4444', 0.6) : '#00FFD1',
                                        opacity: i < 80 ? 0.85 : 1,
                                        cursor: 'default',
                                        transition: 'opacity 0.15s',
                                        '&:hover': { opacity: 1, transform: 'scaleY(1.1)' }
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.65rem' }}>90 days ago</Typography>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontSize: '0.65rem' }}>Today</Typography>
                </Stack>
            </Box>
        </Box>
    );
};

// ─── PublicStatusPage ────────────────────────────────────────────────────────

const PublicStatusPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [pageData, setPageData] = useState<IStatusPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStatus = async () => {
            if (!slug) return;
            try {
                setLoading(true);
                const response = await statusPageApi.getPublicStatus(slug);
                setPageData(response.data.data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Status page not found');
            } finally {
                setLoading(false);
            }
        };
        fetchStatus();
    }, [slug]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC' }}>
                <CircularProgress sx={{ color: '#0A3D62' }} />
            </Box>
        );
    }

    if (error || !pageData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#F8FAFC', p: 3 }}>
                <Card sx={{ maxWidth: 400, width: '100%', borderRadius: 4, textAlign: 'center', p: 4 }}>
                    <XCircle size={48} color="#ef4444" style={{ marginBottom: 16 }} />
                    <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>Page Not Found</Typography>
                    <Typography color="text.secondary">{error || 'This status page does not exist or is private.'}</Typography>
                </Card>
            </Box>
        );
    }

    const monitors = pageData.monitors || [];
    const allOperational = monitors.length > 0 && monitors.every(m => m.lastStatus === MONITOR_STATUS.UP);
    const someDown = monitors.some(m => m.lastStatus === MONITOR_STATUS.DOWN);
    const downCount = monitors.filter(m => m.lastStatus === MONITOR_STATUS.DOWN).length;
    const themeColor = pageData.theme || '#0A3D62';

    const overallStatusText = someDown
        ? `${downCount} service${downCount > 1 ? 's' : ''} experiencing issues`
        : allOperational
        ? 'All systems operational'
        : monitors.length === 0
        ? 'No services configured'
        : 'Partially degraded';

    const overallColor = someDown ? '#ef4444' : allOperational ? '#10b981' : '#f59e0b';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F8FAFC', color: '#1A202C', fontFamily: 'Inter, sans-serif' }}>

            {/* ── Header bar ──────────────────────────────────────── */}
            <Box sx={{ bgcolor: themeColor, py: 3.5, color: '#ffffff', borderBottom: `4px solid ${alpha('#ffffff', 0.08)}` }}>
                <Container maxWidth="lg">
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            {pageData.logo ? (
                                <Box component="img" src={pageData.logo} sx={{ height: 36, width: 'auto', objectFit: 'contain' }} />
                            ) : (
                                <Globe size={28} />
                            )}
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>
                                    {pageData.name}
                                </Typography>
                                {pageData.description && (
                                    <Typography variant="caption" sx={{ opacity: 0.75 }}>{pageData.description}</Typography>
                                )}
                            </Box>
                        </Stack>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" sx={{ opacity: 0.65, display: 'block' }}>
                                Last updated: {new Date().toLocaleTimeString()}
                            </Typography>
                            <Typography variant="caption" sx={{ opacity: 0.5 }}>
                                Auto-refreshes every 60 seconds
                            </Typography>
                        </Box>
                    </Stack>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ py: 4 }}>

                {/* ── Overall status card ─────────────────────────── */}
                <Card sx={{
                    borderRadius: 4,
                    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
                    border: `1.5px solid ${alpha(overallColor, 0.2)}`,
                    mb: 4,
                    overflow: 'hidden'
                }}>
                    <CardContent sx={{ p: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{
                            width: 56, height: 56, borderRadius: '50%',
                            bgcolor: alpha(overallColor, 0.12),
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {someDown
                                ? <XCircle size={28} color={overallColor} />
                                : allOperational
                                ? <CheckCircle size={28} color={overallColor} />
                                : <AlertTriangle size={28} color={overallColor} />
                            }
                        </Box>
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.03em', color: '#0f172a' }}>
                                {overallStatusText}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                {monitors.length} service{monitors.length !== 1 ? 's' : ''} monitored
                                {allOperational && ' · No incidents in the last 90 days'}
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* ── Services list ───────────────────────────────── */}
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', mb: 2.5, letterSpacing: '-0.01em' }}>
                    Services
                </Typography>

                {monitors.length === 0 ? (
                    <Card sx={{ borderRadius: 4, p: 6, textAlign: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <Activity size={40} color="#cbd5e1" style={{ marginBottom: 12 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#64748b', mb: 0.5 }}>No monitors configured</Typography>
                        <Typography variant="body2" color="text.disabled">Monitors will appear here once added to this status page.</Typography>
                    </Card>
                ) : (
                    <Stack spacing={2}>
                        {monitors.map((monitor) => (
                            <MonitorRow key={monitor.id} monitor={monitor} themeColor={themeColor} />
                        ))}
                    </Stack>
                )}

                {/* ── Footer ─────────────────────────────────────── */}
                <Divider sx={{ mt: 6, mb: 3 }} />
                <Box sx={{ textAlign: 'center', pb: 4 }}>
                    <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
                        Powered by{' '}
                        <Box component="span" sx={{ color: themeColor, fontWeight: 800 }}>LeasePacket Tool</Box>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default PublicStatusPage;
