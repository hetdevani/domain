import React, { useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    FormControlLabel,
    Checkbox,
    MenuItem,
    Typography,
    Box,
    Divider,
    IconButton,
    Chip
} from '@mui/material';
import { X } from 'lucide-react';
import type { IPlan } from '../../../types';

interface PlanFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<IPlan>) => void;
    initialData?: IPlan | null;
    loading?: boolean;
}

const PlanForm: React.FC<PlanFormProps> = ({ open, onClose, onSubmit, initialData, loading }) => {
    const [formData, setFormData] = React.useState<Partial<IPlan>>({
        name: '',
        slug: '',
        description: '',
        price: 0,
        billingCycle: 'monthly',
        maxMonitors: 5,
        minCheckInterval: 5,
        maxStatusPages: 1,
        maxTeamMembers: 0,
        logRetentionDays: 7,
        smsNotifications: false,
        webhookNotifications: false,
        emailNotifications: true,
        isDefault: false,
        sortOrder: 0,
        isActive: true
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                slug: '',
                description: '',
                price: 0,
                billingCycle: 'monthly',
                maxMonitors: 5,
                minCheckInterval: 5,
                maxStatusPages: 1,
                maxTeamMembers: 0,
                logRetentionDays: 7,
                smsNotifications: false,
                webhookNotifications: false,
                emailNotifications: true,
                isDefault: false,
                sortOrder: 0,
                isActive: true
            });
        }
    }, [initialData, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                        {initialData ? 'Edit Plan' : 'Create New Plan'}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <X size={20} />
                    </IconButton>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Plan Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Professional"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Slug"
                                name="slug"
                                value={formData.slug}
                                onChange={handleChange}
                                placeholder="e.g. professional (optional)"
                                helperText="URL friendly identifier"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                multiline
                                rows={2}
                                placeholder="Describe the plan benefits..."
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Price ($)"
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                select
                                label="Billing Cycle"
                                name="billingCycle"
                                value={formData.billingCycle}
                                onChange={handleChange}
                                required
                            >
                                <MenuItem value="monthly">Monthly</MenuItem>
                                <MenuItem value="yearly">Yearly</MenuItem>
                                <MenuItem value="lifetime">Lifetime</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider>
                                <Chip label="Limits & Features" size="small" />
                            </Divider>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Max Monitors"
                                name="maxMonitors"
                                type="number"
                                value={formData.maxMonitors}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Min Interval (min)"
                                name="minCheckInterval"
                                type="number"
                                value={formData.minCheckInterval}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Log Retention (days)"
                                name="logRetentionDays"
                                type="number"
                                value={formData.logRetentionDays}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Max Status Pages"
                                name="maxStatusPages"
                                type="number"
                                value={formData.maxStatusPages}
                                onChange={handleChange}
                                required
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Max Team Members"
                                name="maxTeamMembers"
                                type="number"
                                value={formData.maxTeamMembers}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Divider>
                                <Chip label="Notifications & Status" size="small" />
                            </Divider>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                                control={<Checkbox name="emailNotifications" checked={formData.emailNotifications} onChange={handleChange} />}
                                label="Email Alerts"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                                control={<Checkbox name="smsNotifications" checked={formData.smsNotifications} onChange={handleChange} />}
                                label="SMS Alerts"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                                control={<Checkbox name="webhookNotifications" checked={formData.webhookNotifications} onChange={handleChange} />}
                                label="Webhook Alerts"
                            />
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                                control={<Checkbox name="isDefault" checked={formData.isDefault} onChange={handleChange} />}
                                label="Set as Default"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <FormControlLabel
                                control={<Checkbox name="isActive" checked={formData.isActive} onChange={handleChange} />}
                                label="Plan Active"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Sort Order"
                                name="sortOrder"
                                type="number"
                                value={formData.sortOrder}
                                onChange={handleChange}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button type="submit" variant="contained" loading={loading} sx={{ px: 4 }}>
                        {initialData ? 'Update Plan' : 'Create Plan'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PlanForm;
