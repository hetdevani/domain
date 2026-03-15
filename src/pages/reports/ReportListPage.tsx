import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
    alpha,
    Stack,
    Chip,
    Tooltip,
    Divider,
} from '@mui/material';
import {
    Plus,
    Search,
    FileText,
    Edit,
    Trash2,
    Send,
    Calendar,
    Mail,
} from 'lucide-react';
import { reportApi } from '../../api/reportApi';
import toast from 'react-hot-toast';
import ReportForm from './components/ReportForm';

const ReportListPage: React.FC = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingReport, setEditingReport] = useState<any | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await reportApi.paginate({ page: 1, limit: 100, search: { keys: ['name'], keyword: searchTerm } });
            setReports(response.data.data.data || []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, [searchTerm]);

    const handleCreate = () => {
        setEditingReport(null);
        setFormOpen(true);
    };

    const handleEdit = (report: any) => {
        setEditingReport(report);
        setFormOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this report schedule?')) return;
        try {
            await reportApi.softDelete(id);
            toast.success('Report schedule deleted');
            fetchReports();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete report');
        }
    };

    const handleTrigger = async (id: number) => {
        try {
            toast.loading('Triggering report generation...', { id: 'trigger-report' });
            await reportApi.trigger(id);
            toast.success('Report triggered successfully', { id: 'trigger-report' });
            fetchReports();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to trigger report', { id: 'trigger-report' });
        }
    };

    const handleFormSubmit = async (data: any) => {
        try {
            setFormLoading(true);
            if (editingReport) {
                await reportApi.update(editingReport.id, data);
                toast.success('Report updated');
            } else {
                await reportApi.create(data);
                toast.success('Report created');
            }
            setFormOpen(false);
            fetchReports();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save report');
        } finally {
            setFormLoading(false);
        }
    };

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>
                        Automated Reports
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Schedule automated uptime and performance reports delivered to your inbox.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleCreate}
                    startIcon={<Plus size={18} />}
                    sx={{
                        borderRadius: 2.5,
                        px: 3,
                        py: 1.2,
                        textTransform: 'none',
                        fontWeight: 700,
                        boxShadow: '0 4px 12px rgba(10, 61, 98, 0.2)',
                    }}
                >
                    Create Report
                </Button>
            </Box>

            <Card sx={{ borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.06)', mb: 4 }}>
                <CardContent sx={{ p: 2 }}>
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Search reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={20} color="#64748b" />
                                </InputAdornment>
                            ),
                            sx: { borderRadius: 3, bgcolor: '#F8FAFC' }
                        }}
                    />
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {reports.map((report) => (
                    <Grid size={{ xs: 12, md: 6, lg: 4 }} key={report.id}>
                        <Card sx={{ 
                            borderRadius: 4, 
                            height: '100%',
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }
                        }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: alpha('#0A3D62', 0.08) }}>
                                        <FileText size={24} color="#0A3D62" />
                                    </Box>
                                    <Stack direction="row" spacing={1}>
                                        <Tooltip title="Trigger Now">
                                            <IconButton size="small" color="secondary" onClick={() => handleTrigger(report.id)}>
                                                <Send size={18} />
                                            </IconButton>
                                        </Tooltip>
                                        <IconButton size="small" color="primary" onClick={() => handleEdit(report)}>
                                            <Edit size={18} />
                                        </IconButton>
                                        <IconButton size="small" color="error" onClick={() => handleDelete(report.id)}>
                                            <Trash2 size={18} />
                                        </IconButton>
                                    </Stack>
                                </Box>

                                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>
                                    {report.name}
                                </Typography>
                                
                                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Calendar size={14} color="#64748b" />
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, textTransform: 'capitalize' }}>
                                            {report.frequency}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <FileText size={14} color="#64748b" />
                                        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                            {report.format}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Recipients:</Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {report.recipients.map((email: string, idx: number) => (
                                            <Chip key={idx} label={email} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                                        ))}
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2, opacity: 0.1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Mail size={14} color="#64748b" />
                                        <Typography variant="caption" sx={{ fontWeight: 600, color: '#64748b' }}>
                                            Last Sent: {report.lastSentAt ? new Date(report.lastSentAt).toLocaleDateString() : 'Never'}
                                        </Typography>
                                    </Box>
                                    <Chip 
                                        label={report.isActive ? 'Active' : 'Inactive'} 
                                        size="small"
                                        color={report.isActive ? 'success' : 'default'}
                                        sx={{ fontWeight: 700 }}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
                {reports.length === 0 && !loading && (
                    <Grid size={{ xs: 12 }}>
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Typography variant="body1" color="text.secondary">
                                No reports scheduled. Set up your first one to stay updated on monitor performance.
                            </Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>

            {formOpen && (
                <ReportForm
                    open={formOpen}
                    onClose={() => setFormOpen(false)}
                    initialData={editingReport}
                    loading={formLoading}
                    onSubmit={handleFormSubmit}
                />
            )}
        </Box>
    );
};

export default ReportListPage;
