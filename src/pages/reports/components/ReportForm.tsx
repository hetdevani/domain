import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    Typography,
    FormControlLabel,
    Switch,
    FormHelperText,
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Divider,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Chip,
    Button,
    alpha,
} from '@mui/material';
import { Search, Activity, Mail, Plus } from 'lucide-react';
import FormModal from '../../../components/common/FormModal';
import { monitorApi } from '../../monitors/api/monitorApi';
import type { IMonitor } from '../../../types';

interface ReportFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    loading?: boolean;
}

const ReportForm: React.FC<ReportFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading
}) => {
    const [name, setName] = useState('');
    const [format, setFormat] = useState('PDF');
    const [frequency, setFrequency] = useState('weekly');
    const [isActive, setIsActive] = useState(true);
    const [recipients, setRecipients] = useState<string[]>([]);
    const [newRecipient, setNewRecipient] = useState('');
    const [selectedMonitors, setSelectedMonitors] = useState<number[]>([]);
    const [monitors, setMonitors] = useState<IMonitor[]>([]);
    const [monitorSearch, setMonitorSearch] = useState('');
    const [errors, setErrors] = useState<any>({});

    useEffect(() => {
        const fetchMonitors = async () => {
            try {
                const response = await monitorApi.getPaginated({ 
                    pagination: { page: 1, limit: 1000 },
                    filter: {},
                    sorting: { field: 'name', sort: 'ASC' }
                });
                setMonitors(response.data.data.results || []);
            } catch (error) {
                console.error('Failed to fetch monitors', error);
            }
        };
        fetchMonitors();
    }, []);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setFormat(initialData.format || 'PDF');
            setFrequency(initialData.frequency || 'weekly');
            setIsActive(initialData.isActive ?? true);
            setRecipients(initialData.recipients || []);
            setSelectedMonitors(initialData.monitorIds || []);
        } else {
            setName('');
            setFormat('PDF');
            setFrequency('weekly');
            setIsActive(true);
            setRecipients([]);
            setSelectedMonitors(monitors.map(m => m.id));
        }
        setErrors({});
    }, [initialData, open]);

    const handleAddRecipient = () => {
        if (newRecipient && !recipients.includes(newRecipient)) {
            if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newRecipient)) {
                setRecipients([...recipients, newRecipient]);
                setNewRecipient('');
            } else {
                setErrors({ ...errors, recipient: 'Invalid email address' });
            }
        }
    };

    const handleRemoveRecipient = (email: string) => {
        setRecipients(recipients.filter(item => item !== email));
    };

    const handleSubmit = () => {
        const newErrors: any = {};
        if (!name) newErrors.name = 'Name is required';
        if (recipients.length === 0) newErrors.recipients = 'Add at least one recipient';
        if (selectedMonitors.length === 0) newErrors.monitors = 'Select at least one monitor';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name,
            format,
            frequency,
            recipients,
            monitorIds: selectedMonitors,
            isActive
        });
    };

    const handleToggleMonitor = (id: number) => {
        setSelectedMonitors(prev => 
            prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
        );
    };

    const filteredMonitors = monitors.filter(m => 
        m.name.toLowerCase().includes(monitorSearch.toLowerCase()) ||
        m.url.toLowerCase().includes(monitorSearch.toLowerCase())
    );

    return (
        <FormModal
            open={open}
            onClose={onClose}
            title={initialData ? 'Update Report Schedule' : 'Schedule New Report'}
            isEdit={!!initialData}
            loading={loading}
            onSubmit={handleSubmit}
            maxWidth="md"
        >
            <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Report Name"
                        placeholder="e.g. Weekly Operations Report"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        size="small"
                    />
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Format</InputLabel>
                        <Select
                            value={format}
                            label="Format"
                            onChange={(e) => setFormat(e.target.value)}
                        >
                            <MenuItem value="PDF">PDF Report</MenuItem>
                            <MenuItem value="CSV">CSV Data Export</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth size="small">
                        <InputLabel>Frequency</InputLabel>
                        <Select
                            value={frequency}
                            label="Frequency"
                            onChange={(e) => setFrequency(e.target.value)}
                        >
                            <MenuItem value="daily">Daily</MenuItem>
                            <MenuItem value="weekly">Weekly</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                        </Select>
                    </FormControl>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>
                        Email Recipients
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter email address..."
                            value={newRecipient}
                            onChange={(e) => {
                                setNewRecipient(e.target.value);
                                if (errors.recipient) setErrors({ ...errors, recipient: null });
                            }}
                            error={!!errors.recipient}
                            helperText={errors.recipient}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRecipient())}
                        />
                        <Button 
                            variant="outlined" 
                            onClick={handleAddRecipient}
                            startIcon={<Plus size={16} />}
                            sx={{ borderRadius: 2 }}
                        >
                            Add
                        </Button>
                    </Box>
                    {errors.recipients && <FormHelperText error>{errors.recipients}</FormHelperText>}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {recipients.map((email) => (
                            <Chip
                                key={email}
                                label={email}
                                onDelete={() => handleRemoveRecipient(email)}
                                icon={<Mail size={14} />}
                                sx={{ bgcolor: alpha('#0A3D62', 0.05) }}
                            />
                        ))}
                    </Box>
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                        control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                        label="Schedule is currently active"
                    />
                </Grid>

                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                            Included Monitors ({selectedMonitors.length} selected)
                        </Typography>
                        <TextField
                            placeholder="Filter monitors..."
                            size="small"
                            value={monitorSearch}
                            onChange={(e) => setMonitorSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search size={14} style={{ marginRight: 8 }} />,
                                sx: { fontSize: '0.75rem', borderRadius: 2 }
                            }}
                        />
                    </Box>
                    {errors.monitors && <FormHelperText error>{errors.monitors}</FormHelperText>}
                    
                    <Paper sx={{ 
                        border: '1px solid rgba(0,0,0,0.06)', 
                        borderRadius: 3, 
                        maxHeight: 250, 
                        overflow: 'auto',
                        bgcolor: '#F8FAFC'
                    }}>
                        <List>
                            {filteredMonitors.map((monitor) => (
                                <ListItem key={monitor.id} disablePadding>
                                    <ListItemButton onClick={() => handleToggleMonitor(monitor.id)}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={selectedMonitors.includes(monitor.id)}
                                                tabIndex={-1}
                                                disableRipple
                                            />
                                        </ListItemIcon>
                                        <ListItemText 
                                            primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{monitor.name}</Typography>}
                                            secondary={<Typography variant="caption" color="text.secondary">{monitor.url}</Typography>}
                                        />
                                        <Activity size={14} color={monitor.isActive ? '#10b981' : '#64748b'} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </FormModal>
    );
};

export default ReportForm;
