import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Paper,

    CircularProgress,
    TextField,
    Grid,
    FormControlLabel,
    Checkbox,
    Button,
    alpha,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';

import {
    Shield,
    Save,
    Layers,
    ChevronRight,
    Search,
    Info
} from 'lucide-react';

import PermissionMatrix from '../users/components/PermissionMatrix';
import { useRoleLogic } from './hooks/useRoleLogic';
import { useAuth } from '../../contexts/AuthContext';
import { USER_TYPES, type PermissionModule } from '../../types';

const RoleManagementPage: React.FC = () => {
    const { user } = useAuth();
    const isMasterAdmin = user?.type === USER_TYPES.MASTER_ADMIN;

    const {
        roles,
        loading,
        activeTab,
        setActiveTab,
        onFormSubmit
    } = useRoleLogic();

    const [formData, setFormData] = useState({
        title: '',
        userType: 2,
        permissions: [] as PermissionModule[],
        isAppliedToAll: false
    });

    const currentRole = roles[activeTab];

    useEffect(() => {
        if (currentRole) {
            setFormData({
                title: currentRole.title || '',
                userType: currentRole.userType || 2,
                permissions: currentRole.permissions || [],
                isAppliedToAll: false
            });
        }
    }, [currentRole, activeTab]);

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
        onFormSubmit(currentRole.id, formData);
    };

    if (loading && roles.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pb: 1 }}>
            <Grid container spacing={4}>
                {/* Left Sidebar - Roles List */}
                <Grid size={{ xs: 12, md: 3.5 }}>
                    <Box sx={{ position: 'sticky', top: 0 }}>
                        <Paper sx={{
                            borderRadius: '24px',
                            overflow: 'hidden',
                            border: '1px solid rgba(0,0,0,0.06)',
                            boxShadow: '0 4px 30px rgba(0,0,0,0.03)',
                            bgcolor: '#fff',
                        }}>
                            <Box sx={{ p: 3, borderBottom: '1px solid #f1f5f9', bgcolor: alpha('#0A3D62', 0.02) }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Layers size={18} /> AVAILABLE ROLES
                                </Typography>
                                <Box sx={{
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: '#f8fafc',
                                    borderRadius: '12px',
                                    px: 1.5,
                                    border: '1px solid #e2e8f0'
                                }}>
                                    <Search size={16} color="#94a3b8" />
                                    <TextField
                                        placeholder="Filter roles..."
                                        variant="standard"
                                        fullWidth
                                        sx={{
                                            px: 1, py: 1,
                                            '& .MuiInput-root:before, & .MuiInput-root:after': { display: 'none' },
                                            '& input': { fontSize: '0.85rem', fontWeight: 600 }
                                        }}
                                    />
                                </Box>
                            </Box>
                            <Box sx={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                <List sx={{ p: 1.5 }}>
                                    {roles.map((role, index) => (
                                        <ListItemButton
                                            key={role.id}
                                            selected={activeTab === index}
                                            onClick={() => setActiveTab(index)}
                                            sx={{
                                                borderRadius: '16px',
                                                mb: 1,
                                                py: 2,
                                                px: 2.5,
                                                transition: 'all 0.2s',
                                                '&.Mui-selected': {
                                                    bgcolor: alpha('#0A3D62', 0.08),
                                                    color: '#0A3D62',
                                                    '&:hover': { bgcolor: alpha('#0A3D62', 0.12) },
                                                    '& .MuiListItemIcon-root': { color: '#0A3D62' },
                                                    '& .MuiListItemText-primary': { fontWeight: 800 }
                                                },
                                                '&:hover': {
                                                    bgcolor: '#f8fafc',
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 40, color: '#94a3b8' }}>
                                                <Shield size={22} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={role.title}
                                                secondary={role.userType === 1 ? 'Master Level' : (role.userType === 2 ? 'Admin Level' : 'Standard User')}
                                                primaryTypographyProps={{ sx: { fontSize: '0.95rem', fontWeight: 600 } }}
                                                secondaryTypographyProps={{ sx: { fontSize: '0.75rem', fontWeight: 600, opacity: 0.7 } }}
                                            />
                                            <ChevronRight size={16} color="#cbd5e1" />
                                        </ListItemButton>
                                    ))}
                                </List>
                            </Box>
                            <Box sx={{ p: 3, pt: 1 }}>
                                <Paper sx={{
                                    p: 2.5,
                                    borderRadius: '16px',
                                    bgcolor: alpha('#fbbf24', 0.05),
                                    border: '1px dashed #fbbf24',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: 2
                                }}>
                                    <Info size={20} color="#b45309" />
                                    <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600, lineHeight: 1.5 }}>
                                        Select a role to refine its specific module interaction protocol.
                                    </Typography>
                                </Paper>
                            </Box>
                        </Paper>
                    </Box>
                </Grid>


                {/* Right Content - Role Editor */}
                <Grid size={{ xs: 12, md: 8.5 }}>
                    <Paper sx={{
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid rgba(0,0,0,0.06)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.04)',
                        bgcolor: '#fff',
                        position: 'relative'
                    }}>
                        <Box sx={{
                            height: 'calc(100vh - 100px)',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                             <Box sx={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>
                                {currentRole ? (
                                    <form onSubmit={handleSubmit} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                        {/* Premium Studio Toolbar */}
                                        <Box sx={{
                                            p: 2,
                                            bgcolor: '#fff',
                                            borderBottom: '1px solid #f1f5f9',
                                            flexShrink: 0,
                                            zIndex: 10,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 3,
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                                        }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                                                <Box sx={{ 
                                                    width: 40, 
                                                    height: 40, 
                                                    borderRadius: '12px', 
                                                    bgcolor: alpha('#0A3D62', 0.05),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#0A3D62'
                                                }}>
                                                    <Shield size={22} />
                                                </Box>
                                                <Box sx={{ flex: 1 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <TextField
                                                            variant="standard"
                                                            name="title"
                                                            value={formData.title}
                                                            onChange={handleChange}
                                                            placeholder="Role Name"
                                                            InputProps={{
                                                                disableUnderline: true,
                                                                sx: { 
                                                                    fontSize: '1.1rem', 
                                                                    fontWeight: 900, 
                                                                    color: '#0A3D62',
                                                                    '& input': { p: 0 }
                                                                }
                                                            }}
                                                            sx={{ maxWidth: 200 }}
                                                        />
                                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#cbd5e1' }} />
                                                        <TextField
                                                            select
                                                            name="userType"
                                                            value={formData.userType}
                                                            onChange={handleChange}
                                                            variant="standard"
                                                            InputProps={{
                                                                disableUnderline: true,
                                                                sx: { 
                                                                    fontSize: '0.75rem', 
                                                                    fontWeight: 700, 
                                                                    color: '#64748b',
                                                                    bgcolor: '#f1f5f9',
                                                                    px: 1,
                                                                    py: 0.2,
                                                                    borderRadius: '6px'
                                                                }
                                                            }}
                                                            SelectProps={{ native: true }}
                                                        >
                                                            <option value={1}>Master Tier</option>
                                                            <option value={2}>Admin Tier</option>
                                                            <option value={3}>User Tier</option>
                                                        </TextField>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600 }}>
                                                        Configuration Slot #{activeTab + 1}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                {isMasterAdmin && (
                                                    <Box sx={{ 
                                                        px: 1.5, 
                                                        py: 0.8, 
                                                        bgcolor: alpha('#3b82f6', 0.05), 
                                                        borderRadius: '10px', 
                                                        border: '1px solid',
                                                        borderColor: alpha('#3b82f6', 0.1),
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <FormControlLabel
                                                            control={
                                                                <Checkbox
                                                                    name="isAppliedToAll"
                                                                    checked={formData.isAppliedToAll}
                                                                    onChange={handleChange}
                                                                    size="small"
                                                                    sx={{ p: 0.2, color: '#3b82f6' }}
                                                                />
                                                            }
                                                            label={<Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#1e40af', ml: 0.5 }}>Sync All</Typography>}
                                                            sx={{ m: 0 }}
                                                        />
                                                    </Box>
                                                )}
                                                <Button
                                                    type="submit"
                                                    variant="contained"
                                                    disabled={loading}
                                                    size="small"
                                                    startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Save size={16} />}
                                                    sx={{
                                                        borderRadius: '10px',
                                                        px: 3,
                                                        py: 1,
                                                        fontWeight: 900,
                                                        bgcolor: '#22c55e',
                                                        textTransform: 'none',
                                                        fontSize: '0.85rem',
                                                        boxShadow: '0 4px 14px rgba(34, 197, 94, 0.2)',
                                                        '&:hover': { bgcolor: '#16a34a' }
                                                    }}
                                                >
                                                    Commit
                                                </Button>
                                            </Box>
                                        </Box>

                                        {/* Permission Workspace */}
                                        <Box sx={{
                                            flex: 1,
                                            overflowY: 'auto',
                                            bgcolor: '#fcfcfc',
                                            p: 3,
                                            '&::-webkit-scrollbar': { width: '5px' },
                                            '&::-webkit-scrollbar-thumb': { bgcolor: '#e2e8f0', borderRadius: '10px' }
                                        }}>
                                            {/* Advanced Matrix Controls */}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                                                    <Layers size={18} color="#0A3D62" />
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0A3D62', fontSize: '0.9rem' }}>
                                                        Permission Matrix
                                                    </Typography>
                                                </Box>
                                                
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button 
                                                        variant="text" 
                                                        size="small" 
                                                        onClick={() => {
                                                            const allGranted = formData.permissions.map(p => ({
                                                                ...p,
                                                                permissions: { list: true, view: true, insert: true, update: true, delete: true }
                                                            }));
                                                            handlePermissionChange(allGranted);
                                                        }}
                                                        sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748b' }}
                                                    >
                                                        Grant All
                                                    </Button>
                                                    <Button 
                                                        variant="text" 
                                                        size="small" 
                                                        onClick={() => {
                                                            const allRevoked = formData.permissions.map(p => ({
                                                                ...p,
                                                                permissions: { list: false, view: false, insert: false, update: false, delete: false }
                                                            }));
                                                            handlePermissionChange(allRevoked);
                                                        }}
                                                        sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#f43f5e' }}
                                                    >
                                                        Clear
                                                    </Button>
                                                </Box>
                                            </Box>

                                            <Box sx={{
                                                borderRadius: '16px',
                                                p: 0,
                                                bgcolor: '#fff',
                                                border: '1px solid #e2e8f0',
                                                overflow: 'hidden',
                                                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
                                            }}>
                                                <PermissionMatrix
                                                    permissions={formData.permissions}
                                                    onChange={handlePermissionChange}
                                                />
                                            </Box>
                                            
                                            <Box sx={{ height: 40 }} />
                                        </Box>
                                    </form>




                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 20 }}>
                                        <Shield size={60} color="#e2e8f0" style={{ marginBottom: 20 }} />
                                        <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 700 }}>
                                            No role selected for refinement
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                                            Select a role from the sidebar to begin the configuration process
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Paper>


                </Grid>
            </Grid>
        </Box>
    );
};

export default RoleManagementPage;

