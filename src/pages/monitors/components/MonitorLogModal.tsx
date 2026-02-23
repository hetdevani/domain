import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    alpha
} from '@mui/material';
import { X, History, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cronActivityLogApi } from '../../../api/cronActivityLogApi';

interface MonitorLogModalProps {
    open: boolean;
    onClose: () => void;
    monitor: any;
}

const MonitorLogModal: React.FC<MonitorLogModalProps> = ({ open, onClose, monitor }) => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && monitor) {
            fetchLogs();
        }
    }, [open, monitor]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await cronActivityLogApi.getPaginated({
                page: 1,
                limit: 50,
                filter: {
                    monitorId: monitor.id
                },
                sortBy: { createdAt: -1 }
            });
            setLogs(response.data.data.data);
        } catch (error) {
            console.error('Failed to fetch monitor logs', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusChip = (log: any) => {
        const isUp = log.status === 2; // COMPLETED in CronActivityLog
        const label = isUp ? 'UP' : 'DOWN';
        return (
            <Chip
                label={label}
                size="small"
                icon={isUp ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                sx={{
                    fontWeight: 700,
                    borderRadius: '6px',
                    bgcolor: alpha(isUp ? '#10b981' : '#ef4444', 0.1),
                    color: isUp ? '#059669' : '#dc2626',
                    '& .MuiChip-icon': { color: 'inherit' }
                }}
            />
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 4, p: 1 }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha('#10b981', 0.1), color: '#10b981', display: 'flex' }}>
                        <History size={20} />
                    </Box>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            Monitor Execution Logs
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {monitor?.name} ({monitor?.url})
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress size={32} thickness={5} />
                    </Box>
                ) : logs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Activity size={40} color="#94a3b8" style={{ marginBottom: 16 }} />
                        <Typography variant="body1" color="text.secondary">No execution logs found yet.</Typography>
                        <Typography variant="caption" color="text.disabled">Logs will appear as the cron job runs.</Typography>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table size="medium">
                            <TableHead>
                                <TableRow sx={{ bgcolor: alpha('#94a3b8', 0.05) }}>
                                    <TableCell sx={{ fontWeight: 700 }}>Time</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Human Readable Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {logs.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>
                                            {new Date(log.createdAt).toLocaleString('en-GB', {
                                                day: '2-digit',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                {log.jobName?.replace(/_/g, ' ')}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{getStatusChip(log)}</TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.primary" sx={{ fontWeight: 500 }}>
                                                {log.errorMessage || (log.status === 2 ? 'Check Successful' : 'Check Failed')}
                                            </Typography>
                                            {(log.durationMs || log.metadata?.durationMs) && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Response Time: {log.durationMs || log.metadata.durationMs}ms
                                                </Typography>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default MonitorLogModal;
