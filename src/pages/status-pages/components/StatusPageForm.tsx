import React, { useEffect, useState } from 'react';
import {
    Box,
    Grid,
    TextField,
    Typography,
    FormControlLabel,
    Switch,
    Checkbox,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Paper,
    Divider,
    Chip,
} from '@mui/material';
import { Search, Activity } from 'lucide-react';
import FormModal from '../../../components/common/FormModal';
import { monitorApi } from '../../monitors/api/monitorApi';
import type { IMonitor } from '../../../types';

interface StatusPageFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    loading?: boolean;
}

const StatusPageForm: React.FC<StatusPageFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    loading
}) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [logo, setLogo] = useState('');
    const [theme, setTheme] = useState('#0A3D62');
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
            setDescription(initialData.description || '');
            setIsActive(initialData.isActive ?? true);
            setLogo(initialData.logo || '');
            setTheme(initialData.theme || '#0A3D62');
            setSelectedMonitors((initialData.monitors || []).map((m: any) => m.id));
        } else {
            setName('');
            setDescription('');
            setIsActive(true);
            setLogo('');
            setTheme('#0A3D62');
            setSelectedMonitors([]);
        }
        setErrors({});
    }, [initialData, open]);

    const handleSubmit = () => {
        const newErrors: any = {};
        if (!name.trim()) newErrors.name = 'Name is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        onSubmit({ name, description, isActive, logo, theme, monitorIds: selectedMonitors });
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
            title="Edit Status Page"
            isEdit={true}
            loading={loading}
            onSubmit={handleSubmit}
            maxWidth="md"
        >
            <Grid container spacing={3}>
                {/* Basic Info */}
                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        label="Page Name"
                        placeholder="e.g. System Status"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={!!errors.name}
                        helperText={errors.name}
                        size="small"
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={2}
                        label="Description"
                        placeholder="Public description visible on the status page..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        size="small"
                    />
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <FormControlLabel
                        control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                        label="Published (visible to public)"
                    />
                </Grid>

                {/* Appearance */}
                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 2 }}>
                        Appearance
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                fullWidth
                                label="Logo URL"
                                placeholder="https://example.com/logo.png"
                                value={logo}
                                onChange={(e) => setLogo(e.target.value)}
                                size="small"
                                helperText="URL to your company logo (PNG/SVG recommended)"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Brand Color"
                                type="color"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                size="small"
                                sx={{ '& .MuiInputBase-input': { height: 40, p: 0.5 } }}
                                helperText="Primary color for the page"
                            />
                        </Grid>
                    </Grid>
                </Grid>

                {/* Monitors */}
                <Grid size={{ xs: 12 }}>
                    <Divider sx={{ mb: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                            Monitors <Chip label={`${selectedMonitors.length} selected`} size="small" sx={{ ml: 1, fontWeight: 600, borderRadius: '6px' }} />
                        </Typography>
                        <TextField
                            placeholder="Filter..."
                            size="small"
                            value={monitorSearch}
                            onChange={(e) => setMonitorSearch(e.target.value)}
                            InputProps={{
                                startAdornment: <Search size={14} style={{ marginRight: 8 }} />,
                                sx: { fontSize: '0.75rem', borderRadius: 2 }
                            }}
                        />
                    </Box>
                    <Paper sx={{
                        border: '1px solid rgba(0,0,0,0.06)',
                        borderRadius: 3,
                        maxHeight: 280,
                        overflow: 'auto',
                        bgcolor: '#F8FAFC'
                    }}>
                        <List dense>
                            {filteredMonitors.length === 0 && (
                                <ListItem>
                                    <ListItemText secondary="No monitors found" />
                                </ListItem>
                            )}
                            {filteredMonitors.map((monitor) => (
                                <ListItem key={monitor.id} disablePadding>
                                    <ListItemButton onClick={() => handleToggleMonitor(monitor.id)}>
                                        <ListItemIcon sx={{ minWidth: 40 }}>
                                            <Checkbox
                                                edge="start"
                                                checked={selectedMonitors.includes(monitor.id)}
                                                tabIndex={-1}
                                                disableRipple
                                                size="small"
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

export default StatusPageForm;
