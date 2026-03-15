import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    alpha,
    Stack,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Globe,
    Activity,
    CheckCircle2,
    ExternalLink,
} from 'lucide-react';
import DynamicTable, { type Column } from '../../components/table/DynamicTable';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { statusPageApi } from '../../api/statusPageApi';
import type { IStatusPage } from '../../types';
import toast from 'react-hot-toast';
import StatusPageForm from './components/StatusPageForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const StatusPageListPage: React.FC = () => {
    const [statusPages, setStatusPages] = useState<IStatusPage[]>([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingPage, setEditingPage] = useState<IStatusPage | null>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const fetchStatusPages = async (params: any) => {
        try {
            const response = await statusPageApi.paginate(params);
            const data = response.data.data.data || [];
            const total = response.data.data.totalRecords || 0;
            setStatusPages(data);
            return { data, total };
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch status pages');
            return { data: [], total: 0 };
        }
    };

    const columns: Column[] = [
        {
            id: 'name',
            label: 'Monitor',
            minWidth: 220,
            format: (value, row) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: row.theme ? alpha(row.theme, 0.1) : alpha('#0A3D62', 0.08),
                        color: row.theme || '#0A3D62',
                        overflow: 'hidden'
                    }}>
                        {row.logo
                            ? <img src={row.logo} alt="" style={{ width: 24, height: 24, objectFit: 'contain' }} />
                            : <Globe size={18} />
                        }
                    </Box>
                    <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#0A3D62' }}>{value}</Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: '#94a3b8', fontFamily: 'monospace', cursor: 'pointer', '&:hover': { color: '#0A3D62' } }}
                            onClick={(e) => { e.stopPropagation(); window.open(`/status/${row.slug}`, '_blank'); }}
                        >
                            /status/{row.slug} ↗
                        </Typography>
                    </Box>
                </Box>
            )
        },
        {
            id: 'accessLevel',
            label: 'Access',
            format: () => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Globe size={14} color="#64748b" />
                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>Public</Typography>
                </Stack>
            )
        },
        {
            id: 'isActive',
            label: 'Status',
            format: (value) => (
                <Chip
                    label={value ? 'Published' : 'Draft'}
                    size="small"
                    color={value ? 'success' : 'default'}
                    sx={{ fontWeight: 700, borderRadius: '6px' }}
                />
            )
        }
    ];

    const handleEdit = (page: IStatusPage) => {
        setEditingPage(page);
        setFormOpen(true);
    };

    const handleDelete = async () => {
        if (!editingPage) return;
        try {
            setFormLoading(true);
            await statusPageApi.softDelete(editingPage.id);
            toast.success('Status page deleted');
            setConfirmOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete status page');
        } finally {
            setFormLoading(false);
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            setFormLoading(true);
            if (editingPage) {
                await statusPageApi.update(editingPage.id, data);
                toast.success('Status page updated');
            }
            setFormOpen(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save status page');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Box>
            <Breadcrumb />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                {[
                    { label: 'Total Pages', value: statusPages.length, icon: <Globe size={18} />, color: '#0A3D62' },
                    { label: 'Published', value: statusPages.filter(p => p.isActive).length, icon: <CheckCircle2 size={18} />, color: '#10b981' },
                    { label: 'Active Monitors', value: 'All', icon: <Activity size={18} />, color: '#f59e0b' },
                ].map((item) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 4 }}>
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
                title="Status Pages"
                columns={columns}
                fetchData={fetchStatusPages}
                onEdit={handleEdit}
                onDelete={(row) => {
                    setEditingPage(row);
                    setConfirmOpen(true);
                }}
                searchPlaceholder="Search status pages..."
                renderExtraActions={(row) => (
                    <Tooltip title="Open Public Page">
                        <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); window.open(`/status/${row.slug}`, '_blank'); }}
                            sx={{ bgcolor: alpha('#0A3D62', 0.08), '&:hover': { bgcolor: alpha('#0A3D62', 0.18) } }}
                        >
                            <ExternalLink size={15} color="#0A3D62" />
                        </IconButton>
                    </Tooltip>
                )}
            />

            {formOpen && (
                <StatusPageForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    initialData={editingPage || undefined}
                    loading={formLoading}
                    onSubmit={handleFormSubmit}
                />
            )}

            <ConfirmDialog
                open={confirmOpen}
                title="Delete Status Page"
                message={`Are you sure you want to delete "${editingPage?.name}"?`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmOpen(false)}
                loading={formLoading}
            />
        </Box>
    );
};

export default StatusPageListPage;
