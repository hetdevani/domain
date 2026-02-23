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
    Typography,
    Box,
    IconButton
} from '@mui/material';
import { X } from 'lucide-react';
import type { IMaster } from '../../../types';

interface MasterFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<IMaster>) => void;
    initialData?: IMaster | null;
    loading?: boolean;
}

const MasterForm: React.FC<MasterFormProps> = ({ open, onClose, onSubmit, initialData, loading }) => {
    const [formData, setFormData] = React.useState<Partial<IMaster>>({
        name: '',
        code: '',
        isActive: true,
        isDefault: false,
        sortingSequence: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                code: '',
                isActive: true,
                isDefault: false,
                sortingSequence: 0
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
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={700}>
                        {initialData ? 'Edit Master Entry' : 'Create Master Entry'}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <X size={20} />
                    </IconButton>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Category Name"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                required
                                placeholder="e.g. CAT_001"
                                disabled={!!initialData}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Sorting Sequence"
                                name="sortingSequence"
                                type="number"
                                value={formData.sortingSequence}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControlLabel
                                control={<Checkbox name="isActive" checked={formData.isActive} onChange={handleChange} />}
                                label="Active"
                            />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                            <FormControlLabel
                                control={<Checkbox name="isDefault" checked={formData.isDefault} onChange={handleChange} />}
                                label="Default"
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} color="inherit">Cancel</Button>
                    <Button type="submit" variant="contained" loading={loading} sx={{ px: 4 }}>
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default MasterForm;
