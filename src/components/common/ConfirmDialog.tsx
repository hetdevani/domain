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
    alpha
} from '@mui/material';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    loading?: boolean;
    confirmText?: string;
    confirmColor?: 'error' | 'primary' | 'warning';
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    loading = false,
    confirmText = 'Delete',
    confirmColor = 'error'
}) => {
    return (
        <Dialog
            open={open}
            onClose={onCancel}
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    width: '100%',
                    maxWidth: 400,
                    p: 1
                }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            bgcolor: alpha(confirmColor === 'error' ? '#ef4444' : '#f59e0b', 0.1),
                            color: confirmColor === 'error' ? 'error.main' : 'warning.main',
                            display: 'flex'
                        }}
                    >
                        <AlertTriangle size={20} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {title}
                    </Typography>
                </Box>
                <IconButton onClick={onCancel} size="small" sx={{ color: 'text.secondary' }}>
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {message}
                </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    fullWidth
                    variant="outlined"
                    color="inherit"
                    onClick={onCancel}
                    disabled={loading}
                    sx={{ py: 1, borderRadius: 2 }}
                >
                    Cancel
                </Button>
                <Button
                    fullWidth
                    variant="contained"
                    color={confirmColor}
                    onClick={onConfirm}
                    disabled={loading}
                    sx={{ py: 1, borderRadius: 2, fontWeight: 700 }}
                >
                    {loading ? 'Processing...' : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
