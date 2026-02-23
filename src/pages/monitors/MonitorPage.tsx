import React from 'react';
import { Box, Chip, Typography, IconButton, Tooltip, Link } from '@mui/material';
import { ExternalLink, Globe, Activity, Shield, ShieldOff, History } from 'lucide-react';
import DynamicTable, { type Column } from '../../components/table/DynamicTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import MonitorForm from './components/MonitorForm';
import MonitorLogModal from './components/MonitorLogModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useMonitorLogic } from './hooks/useMonitorLogic';
import { monitorApi } from './api/monitorApi';
import { MONITOR_TYPE, MONITOR_STATUS, USER_TYPES } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

const MonitorPage: React.FC = () => {
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
                const types: any = {
                    [MONITOR_TYPE.HTTP]: 'HTTP(s)',
                    [MONITOR_TYPE.PING]: 'Ping',
                    [MONITOR_TYPE.TCP]: 'TCP Port',
                    [MONITOR_TYPE.DNS]: 'DNS',
                    [MONITOR_TYPE.KEYWORD]: 'Keyword'
                };
                return (
                    <Chip
                        label={types[value] || 'Unknown'}
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
            id: 'sslMonitoring',
            label: 'SSL',
            format: (value) => (
                value ? (
                    <Tooltip title="SSL Monitoring Active">
                        <Shield size={18} color="#2ECC71" />
                    </Tooltip>
                ) : (
                    <Tooltip title="SSL Monitoring Disabled">
                        <ShieldOff size={18} color="#94a3b8" />
                    </Tooltip>
                )
            )
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
        setTotalMonitors(total);
        return {
            data: response.data.data.data,
            total: total
        };
    };

    return (
        <Box>
            <Breadcrumb />
            <DynamicTable
                key={refreshTrigger}
                title="Website Monitors"
                columns={columns}
                fetchData={fetchMonitors}
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
                renderExtraActions={(row) => (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title={row.isActive ? 'Pause Monitor' : 'Resume Monitor'}>
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleToggleStatus(row); }}
                                sx={{
                                    color: row.isActive ? '#fbbf24' : '#10b981',
                                    bgcolor: row.isActive ? 'rgba(251, 191, 36, 0.05)' : 'rgba(16, 185, 129, 0.05)'
                                }}
                            >
                                <Activity size={16} />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="View History">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleViewLogs(row); }}
                                sx={{
                                    color: '#6366f1',
                                    bgcolor: 'rgba(99, 102, 241, 0.05)'
                                }}
                            >
                                <History size={16} />
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
