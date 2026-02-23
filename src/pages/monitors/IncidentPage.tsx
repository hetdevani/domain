import React from 'react';
import { Box, Chip, Typography, IconButton, Tooltip, Link } from '@mui/material';
import { CheckCircle, AlertCircle, Clock, Globe, ExternalLink } from 'lucide-react';
import DynamicTable, { type Column } from '../../components/table/DynamicTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useIncidentLogic } from './hooks/useIncidentLogic';
import { incidentApi } from '../../api/incidentApi';
import { INCIDENT_STATUS } from '../../types';
const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
};

const getDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime).getTime();
    const end = endTime ? new Date(endTime).getTime() : Date.now();
    const diff = Math.abs(end - start);

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor((diff / (1000 * 60 * 60)));

    let res = '';
    if (hours > 0) res += `${hours}h `;
    if (minutes > 0 || hours > 0) res += `${minutes}m `;
    res += `${seconds}s`;
    return res;
};

const IncidentPage: React.FC = () => {
    const { refreshTrigger, handleResolve } = useIncidentLogic();

    const fetchIncidents = async (params: any) => {
        if (!params.populateFields) params.populateFields = [];
        if (!params.populateFields.includes('monitor')) {
            params.populateFields.push('monitor');
        }

        try {
            const response = await incidentApi.paginate(params);
            return {
                data: response.data.data.data,
                total: response.data.data?.totalRecords || 0
            };
        } catch (error) {
            console.error('Error fetching incidents:', error);
            return { data: [], total: 0 };
        }
    };

    const columns: Column[] = [
        {
            id: 'monitor',
            label: 'Monitor',
            minWidth: 200,
            format: (_, row) => (
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
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62' }}>
                            {row.monitor?.name || `Monitor #${row.monitorId}`}
                        </Typography>
                        {row.monitor?.url && (
                            <Link
                                href={row.monitor.url}
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
                                {row.monitor.url} <ExternalLink size={12} />
                            </Link>
                        )}
                    </Box>
                </Box>
            )
        },
        {
            id: 'startTime',
            label: 'Detected At',
            minWidth: 170,
            format: (value) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Clock size={14} color="#64748b" />
                    <Typography variant="body2">{formatDate(value)}</Typography>
                </Box>
            )
        },
        {
            id: 'endTime',
            label: 'Resolved At',
            minWidth: 170,
            format: (value) => value ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircle size={14} color="#10b981" />
                    <Typography variant="body2">{formatDate(value)}</Typography>
                </Box>
            ) : (
                <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600 }}>In Progress</Typography>
            )
        },
        {
            id: 'duration',
            label: 'Down Duration',
            format: (_, row) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                    {getDuration(row.startTime, row.endTime)}
                </Typography>
            )
        },
        {
            id: 'cause',
            label: 'Reason',
            minWidth: 150,
            format: (value) => (
                <Typography variant="body2" sx={{ color: 'error.main', fontStyle: 'italic' }}>
                    {value || 'Unknown connection error'}
                </Typography>
            )
        },
        {
            id: 'status',
            label: 'Status',
            format: (value) => (
                <Chip
                    icon={value === INCIDENT_STATUS.OPEN ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                    label={value === INCIDENT_STATUS.OPEN ? 'Active' : 'Resolved'}
                    size="small"
                    color={value === INCIDENT_STATUS.OPEN ? 'error' : 'success'}
                    variant={value === INCIDENT_STATUS.OPEN ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                />
            )
        }
    ];

    return (
        <Box>
            <Breadcrumb />
            <DynamicTable
                key={refreshTrigger}
                title="Incident History"
                columns={columns}
                fetchData={fetchIncidents}
                actions={true}
                searchPlaceholder="Search by cause..."
                searchKeys={['cause']}
                renderExtraActions={(row) => (
                    row.status === INCIDENT_STATUS.OPEN && (
                        <Tooltip title="Mark as Resolved">
                            <IconButton
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleResolve(row.id); }}
                                sx={{
                                    color: '#10b981',
                                    bgcolor: 'rgba(16, 185, 129, 0.05)',
                                    '&:hover': { bgcolor: 'rgba(16, 185, 129, 0.1)' }
                                }}
                            >
                                <CheckCircle size={18} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
            />
        </Box>
    );
};

export default IncidentPage;
