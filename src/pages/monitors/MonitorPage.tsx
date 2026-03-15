import React from 'react';
import { Box, Chip, Typography, IconButton, Tooltip, Link, Card, CardContent, Grid, alpha } from '@mui/material';
import { ExternalLink, Globe, Activity, Shield, ShieldOff, History, CheckCircle2, ServerCrash, CalendarClock } from 'lucide-react';
import DynamicTable, { type Column } from '../../components/table/DynamicTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import MonitorForm from './components/MonitorForm';
import MonitorLogModal from './components/MonitorLogModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useMonitorLogic } from './hooks/useMonitorLogic';
import { monitorApi } from './api/monitorApi';
import { MONITOR_TYPE, MONITOR_STATUS, USER_TYPES } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

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

const MonitorPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        loading,
        modalOpen,
        confirmOpen,
        selectedMonitor,
        refreshTrigger,
        setModalOpen,
        setConfirmOpen,
        handleCreate,
        handleEdit,
        handleDeleteClick,
        handleToggleStatus,
        onFormSubmit,
        onConfirmDelete
    } = useMonitorLogic();

    const [totalMonitors, setTotalMonitors] = React.useState(0);
    const [monitorRows, setMonitorRows] = React.useState<any[]>([]);
    const { user } = useAuth();

    const [logModalOpen, setLogModalOpen] = React.useState(false);
    const [selectedLogMonitor, setSelectedLogMonitor] = React.useState<any>(null);

    const handleViewLogs = (monitor: any) => {
        setSelectedLogMonitor(monitor);
        setLogModalOpen(true);
    };

    const columns: Column[] = [
        {
            id: 'name',
            label: 'Monitor',
            minWidth: 200,
            format: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'rgba(10, 61, 98, 0.05)',
                            color: '#0A3D62'
                        }}
                    >
                        <Globe size={20} />
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62' }}>{value}</Typography>
                        <Link
                            href={row.url}
                            target="_blank"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                variant: 'caption',
                                color: 'text.secondary',
                                textDecoration: 'none',
                                '&:hover': { color: 'primary.main', textDecoration: 'underline' }
                            }}
                        >
                            {row.url} <ExternalLink size={12} />
                        </Link>
                    </Box>
                </Box>
            )
        },
        {
            id: 'type',
            label: 'Type',
            format: (value) => {
                return (
                    <Chip
                        label={MONITOR_TYPE_LABELS[value] || 'Unknown'}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, borderRadius: '6px', fontSize: '0.75rem' }}
                    />
                );
            }
        },
        {
            id: 'checkInterval',
            label: 'Interval',
            format: (value) => `${value} min`
        },
        {
            id: 'url',
            label: 'Target Details',
            minWidth: 210,
            format: (value, row) => {
                const isTcp = row.type === MONITOR_TYPE.TCP;
                const tcpPorts = isTcp && typeof value === 'string' && value.includes(':')
                    ? value.split(':').slice(1).join(':')
                    : null;

                return (
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#111827' }}>
                            {isTcp ? value.split(':')[0] : value}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {isTcp && tcpPorts
                                ? `Ports: ${tcpPorts}`
                                : `Checks every ${row.checkInterval} min`}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            id: 'sslMonitoring',
            label: 'SSL',
            minWidth: 180,
            format: (value, row) => {
                if (!value) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="SSL Monitoring Disabled">
                                <ShieldOff size={18} color="#94a3b8" />
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary">Disabled</Typography>
                        </Box>
                    );
                }

                return (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="SSL Monitoring Active">
                                <Shield size={18} color="#2ECC71" />
                            </Tooltip>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827' }}>
                                {row.sslWarningDaysRemaining != null ? `${row.sslWarningDaysRemaining} day(s)` : 'Active'}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {row.sslExpiresAt
                                ? `Expires: ${new Date(row.sslExpiresAt).toLocaleDateString()}`
                                : 'Expiry date pending'}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            id: 'domainMonitoring',
            label: 'Domain Expiry',
            minWidth: 210,
            format: (value, row) => {
                if (!value) {
                    return (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Domain Expiry Monitoring Disabled">
                                <CalendarClock size={18} color="#94a3b8" />
                            </Tooltip>
                            <Typography variant="caption" color="text.secondary">Disabled</Typography>
                        </Box>
                    );
                }

                return (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Domain Expiry Monitoring Active">
                                <CalendarClock size={18} color="#f59e0b" />
                            </Tooltip>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#111827' }}>
                                {row.domainWarningDaysRemaining != null ? `${row.domainWarningDaysRemaining} day(s)` : 'Active'}
                            </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                            {row.domainExpiresAt
                                ? `Expires: ${new Date(row.domainExpiresAt).toLocaleDateString()}`
                                : 'Expiry date pending'}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            id: 'isActive',
            label: 'Status',
            format: (value) => (
                <Chip
                    label={value ? 'Active' : 'Paused'}
                    size="small"
                    color={value ? 'success' : 'warning'}
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                />
            )
        },
        {
            id: 'lastStatus',
            label: 'Last Check',
            format: (value) => {
                if (!value) return <Typography variant="caption" color="text.secondary">N/A</Typography>;
                const isUp = value === MONITOR_STATUS.UP;
                return (
                    <Chip
                        label={isUp ? 'Online' : 'Offline'}
                        size="small"
                        sx={{
                            bgcolor: isUp ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                            color: isUp ? '#27ae60' : '#c0392b',
                            fontWeight: 800,
                            borderRadius: '6px',
                            border: 'none'
                        }}
                    />
                );
            }
        }
    ];

    const isLimitReached = React.useMemo(() => {
        if (!user || user.type === USER_TYPES.MASTER_ADMIN) return false;
        return totalMonitors >= (user.plan?.maxMonitors || 0);
    }, [user, totalMonitors]);

    if (user?.type === USER_TYPES.MASTER_ADMIN) {
        columns.splice(1, 0, {
            id: 'owner',
            label: 'Customer',
            minWidth: 150,
            format: (value) => value?.name || <Typography variant="caption" color="text.secondary">-</Typography>
        });
    }

    const fetchMonitors = async (params: any) => {
        const response = await monitorApi.getPaginated(params);
        const total = response.data.data.totalRecords;
        const rows = response.data.data.data || [];
        setTotalMonitors(total);
        setMonitorRows(rows);
        return {
            data: rows,
            total: total
        };
    };

    const activeCount = React.useMemo(
        () => monitorRows.filter((item) => item.isActive).length,
        [monitorRows]
    );
    const downCount = React.useMemo(
        () => monitorRows.filter((item) => item.lastStatus === MONITOR_STATUS.DOWN).length,
        [monitorRows]
    );
    const sslEnabledCount = React.useMemo(
        () => monitorRows.filter((item) => item.sslMonitoring).length,
        [monitorRows]
    );
    const domainEnabledCount = React.useMemo(
        () => monitorRows.filter((item) => item.domainMonitoring).length,
        [monitorRows]
    );

    return (
        <Box>
            <Breadcrumb />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Monitors', value: totalMonitors, icon: <Activity size={18} />, color: '#0A3D62' },
                    { label: 'Active', value: activeCount, icon: <CheckCircle2 size={18} />, color: '#10b981' },
                    { label: 'Down', value: downCount, icon: <ServerCrash size={18} />, color: '#ef4444' },
                    { label: 'SSL Enabled', value: sslEnabledCount, icon: <Shield size={18} />, color: '#14b8a6' },
                    { label: 'Domain Expiry Enabled', value: domainEnabledCount, icon: <CalendarClock size={18} />, color: '#f59e0b' },
                ].map((item) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <Card sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box>
                                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                            {item.label}
                                        </Typography>
                                        <Typography variant="h4" sx={{ mt: 0.75, fontWeight: 900, color: '#0A3D62' }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ width: 42, height: 42, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(item.color, 0.12), color: item.color }}>
                                        {item.icon}
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            <DynamicTable
                key={refreshTrigger}
                title={user?.type === USER_TYPES.MASTER_ADMIN ? 'Platform Monitors' : 'Your Monitors'}
                columns={columns}
                fetchData={fetchMonitors}
                onRowClick={(row) => navigate(`/monitors/${row.id}`)}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
                onCreate={() => {
                    if (isLimitReached) {
                        import('react-hot-toast').then(t => t.default.error(`Plan Limit Reached: You have used all ${user?.plan?.maxMonitors} monitor slots in your ${user?.plan?.name} plan.`));
                    } else {
                        handleCreate();
                    }
                }}
                titleComponent={
                    user?.type !== USER_TYPES.MASTER_ADMIN && (
                        <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                Usage: {totalMonitors} / {user?.plan?.maxMonitors || 0}
                            </Typography>
                            <Box sx={{ width: 80, height: 6, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                                <Box
                                    sx={{
                                        width: `${Math.min((totalMonitors / (user?.plan?.maxMonitors || 1)) * 100, 100)}%`,
                                        height: '100%',
                                        bgcolor: isLimitReached ? '#ef4444' : '#10b981',
                                        transition: 'width 0.5s ease-in-out'
                                    }}
                                />
                            </Box>
                        </Box>
                    )
                }
                searchPlaceholder="Search monitors by name or URL..."
                searchKeys={['name', 'url']}
                filterConfig={[
                    {
                        key: 'type',
                        label: 'Monitor Type',
                        type: 'select',
                        options: Object.entries(MONITOR_TYPE_LABELS).map(([value, label]) => ({ value: Number(value), label }))
                    },
                    {
                        key: 'isActive',
                        label: 'Lifecycle',
                        type: 'select',
                        options: [
                            { label: 'Active', value: true },
                            { label: 'Paused', value: false }
                        ]
                    },
                    {
                        key: 'lastStatus',
                        label: 'Last Status',
                        type: 'select',
                        options: [
                            { label: 'Up', value: MONITOR_STATUS.UP },
                            { label: 'Down', value: MONITOR_STATUS.DOWN }
                        ]
                    }
                ]}
                renderExtraActions={(row) => (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title={row.isActive ? 'Pause Monitor' : 'Resume Monitor'}>
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(row); }}
                                sx={{
                                    color: row.isActive ? '#fbbf24' : '#10b981',
                                    bgcolor: row.isActive ? 'rgba(251, 191, 36, 0.05)' : 'rgba(16, 185, 129, 0.05)'
                                }}
                            >
                                <Activity size={15} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="View History">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleViewLogs(row); }}
                                sx={{ color: '#6366f1', bgcolor: 'rgba(99, 102, 241, 0.05)' }}
                            >
                                <History size={15} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                )}
            />

            <MonitorForm
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={onFormSubmit}
                initialData={selectedMonitor}
                loading={loading}
            />

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Monitor"
                message={`Are you sure you want to delete "${selectedMonitor?.name}"? All associated incident history will also be removed.`}
                onConfirm={onConfirmDelete}
                onCancel={() => setConfirmOpen(false)}
                loading={loading}
            />

            <MonitorLogModal
                open={logModalOpen}
                onClose={() => setLogModalOpen(false)}
                monitor={selectedLogMonitor}
            />
        </Box>
    );
};

export default MonitorPage;
