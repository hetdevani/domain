import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    FormControlLabel,
    Checkbox,
    alpha,
    Typography,
    Grid
} from '@mui/material';
import { Shield, Save, X } from 'lucide-react';
import PermissionMatrix from '../../users/components/PermissionMatrix';
import { USER_TYPES, type PermissionModule } from '../../../types';
import { useAuth } from '../../../contexts/AuthContext';

interface RoleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    initialData?: any;
    loading?: boolean;
}

const RoleForm: React.FC<RoleFormProps> = ({ open, onClose, onSubmit, initialData, loading }) => {
    const { user } = useAuth();
    const isMasterAdmin = user?.type === USER_TYPES.MASTER_ADMIN;

    const [formData, setFormData] = useState({
        title: '',
        userType: 2,
        permissions: [] as PermissionModule[],
        isAppliedToAll: false
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                title: initialData.title || '',
                userType: initialData.userType || 2,
                permissions: initialData.permissions || [],
                isAppliedToAll: false
            });
        } else {
            setFormData({
                title: '',
                userType: 2,
                permissions: [],
                isAppliedToAll: false
            });
        }
    }, [initialData, open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'isAppliedToAll' ? checked : value
        }));
    };

    const handlePermissionChange = (permissions: PermissionModule[]) => {
        setFormData(prev => ({ ...prev, permissions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
                sx: { borderRadius: '20px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }
            }}
        >
            <DialogTitle sx={{ 
                bgcolor: alpha('#0A3D62', 0.04), 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                borderBottom: '1px solid',
                borderColor: alpha('#000', 0.08)
            }}>
                <Box sx={{ p: 1, bgcolor: '#0A3D62', borderRadius: '10px', color: '#fff', display: 'flex' }}>
                    <Shield size={20} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#0A3D62' }}>
                    {initialData ? 'Edit Role' : 'Create New Role'}
                </Typography>
            </DialogTitle>
            
            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 4 }}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 8 }}>
                            <TextField
                                label="Role Title"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                fullWidth
                                required
                                placeholder="e.g. Standard Admin"
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                select
                                label="User Type"
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                fullWidth
                                required
                                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                            >
                                <MenuItem value={1}>Master Admin</MenuItem>
                                <MenuItem value={2}>Admin</MenuItem>
                                <MenuItem value={3}>Customer</MenuItem>
                            </TextField>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <PermissionMatrix 
                                permissions={formData.permissions} 
                                onChange={handlePermissionChange} 
                            />
                        </Grid>

                        {isMasterAdmin && (
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{ 
                                    p: 2, 
                                    bgcolor: alpha('#fbbf24', 0.08), 
                                    borderRadius: '12px', 
                                    border: '1px solid', 
                                    borderColor: alpha('#fbbf24', 0.2) 
                                }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                name="isAppliedToAll"
                                                checked={formData.isAppliedToAll}
                                                onChange={handleChange}
                                                color="warning"
                                            />
                                        }
                                        label={
                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#b45309' }}>
                                                Apply these permissions to ALL existing users with this user type
                                            </Typography>
                                        }
                                    />
                                    <Typography variant="caption" sx={{ display: 'block', ml: 4, color: '#b45309', opacity: 0.8 }}>
                                        Warning: This will overwrite specific permissions for all users of this role.
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                
                <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: alpha('#000', 0.08) }}>
                    <Button 
                        onClick={onClose} 
                        startIcon={<X size={18} />}
                        sx={{ borderRadius: '10px', px: 3, fontWeight: 600, color: '#64748b' }}
                    >
                        Cancel
                    </Button>
                    <Button 
                        type="submit" 
                        variant="contained" 
                        disabled={loading}
                        startIcon={<Save size={18} />}
                        sx={{ 
                            borderRadius: '10px', 
                            px: 4, 
                            fontWeight: 700, 
                            bgcolor: '#0A3D62',
                            boxShadow: '0 4px 12px rgba(10, 61, 98, 0.25)',
                            '&:hover': { bgcolor: '#08304d' }
                        }}
                    >
                        {loading ? 'Saving...' : initialData ? 'Update Role' : 'Create Role'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default RoleForm;
