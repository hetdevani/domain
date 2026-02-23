import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    IconButton,
    alpha,
    Divider
} from '@mui/material';
import { X, Save, Plus } from 'lucide-react';
import { ButtonLoader } from './Loaders';

interface FormModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    onSubmit: () => void;
    children: React.ReactNode;
    loading?: boolean;
    submitLabel?: string;
    isEdit?: boolean;
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const FormModal: React.FC<FormModalProps> = ({
    open,
    title,
    onClose,
    onSubmit,
    children,
    loading = false,
    submitLabel,
    isEdit = false,
    maxWidth = 'sm'
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '20px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    backgroundImage: 'none',
                    position: 'relative',
                    overflow: 'visible'
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#0A3D62', letterSpacing: '-0.02em', mb: 0.5 }}>
                        {title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {isEdit ? 'Update the details below to save changes' : 'Fill in the required information to create a new entry'}
                    </Typography>
                </Box>
                <IconButton
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 16,
                        top: 16,
                        color: 'text.secondary',
                        bgcolor: alpha('#000', 0.04),
                        borderRadius: '12px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            bgcolor: alpha('#ef4444', 0.1),
                            color: '#ef4444',
                            transform: 'rotate(90deg)'
                        }
                    }}
                >
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <Divider sx={{ opacity: 0.1 }} />

            <DialogContent sx={{ p: 3, py: 4 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    {children}
                </Box>
            </DialogContent>

            <Divider sx={{ opacity: 0.1 }} />

            <DialogActions sx={{ p: 3, gap: 2 }}>
                <Button
                    variant="text"
                    color="inherit"
                    onClick={onClose}
                    disabled={loading}
                    sx={{
                        px: 3,
                        py: 1.2,
                        borderRadius: '12px',
                        fontWeight: 600,
                        color: 'text.secondary',
                        '&:hover': { bgcolor: alpha('#000', 0.05) }
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                    disabled={loading}
                    startIcon={loading ? null : (isEdit ? <Save size={18} /> : <Plus size={18} />)}
                    sx={{
                        px: 4,
                        py: 1.2,
                        borderRadius: '12px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        backgroundColor: isEdit ? '#0A3D62' : '#2ECC71',
                        boxShadow: `0 8px 20px -4px ${alpha(isEdit ? '#0A3D62' : '#2ECC71', 0.4)}`,
                        minWidth: 160,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            backgroundColor: isEdit ? '#072e4a' : '#27ae60',
                            boxShadow: `0 12px 25px -4px ${alpha(isEdit ? '#0A3D62' : '#2ECC71', 0.5)}`,
                            transform: 'translateY(-2px)'
                        },
                        '&:active': { transform: 'translateY(0)' },
                        '&.Mui-disabled': {
                            backgroundColor: alpha(isEdit ? '#0A3D62' : '#2ECC71', 0.5),
                            color: '#fff'
                        }
                    }}
                >
                    {loading ? <ButtonLoader /> : (submitLabel || (isEdit ? 'Update Details' : 'Confirm & Add'))}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FormModal;
