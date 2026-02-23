import React from 'react';
import { useForm } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    alpha
} from '@mui/material';
import { X, Lock, ShieldCheck } from 'lucide-react';

interface PasswordResetModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (password: string) => Promise<boolean>;
    userName: string;
    loading?: boolean;
}

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
    open,
    onClose,
    onSubmit,
    userName,
    loading = false
}) => {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        defaultValues: {
            newPassword: '',
            confirmPassword: ''
        }
    });

    const handleFormSubmit = async (data: any) => {
        if (data.newPassword !== data.confirmPassword) {
            return; // Controller should handle validation but double check
        }
        const success = await onSubmit(data.newPassword);
        if (success) {
            reset();
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="xs"
            fullWidth
            PaperProps={{
                sx: { borderRadius: '16px', p: 1 }
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{
                        p: 1,
                        borderRadius: '10px',
                        bgcolor: alpha('#0ea5e9', 0.1),
                        color: '#0ea5e9',
                        display: 'flex'
                    }}>
                        <ShieldCheck size={20} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Reset Password</Typography>
                </Box>
                <IconButton onClick={onClose} disabled={loading} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <DialogContent sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        Setting a new password for <strong>{userName}</strong>. The user will be required to use this new password for their next login.
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            size="small"
                            placeholder="Min. 8 characters"
                            {...register('newPassword', {
                                required: 'Password is required',
                                minLength: { value: 8, message: 'Minimum 8 characters' }
                            })}
                            error={!!errors.newPassword}
                            helperText={errors.newPassword?.message}
                            InputProps={{
                                startAdornment: <Lock size={18} style={{ marginRight: 10, color: '#94a3b8' }} />
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            size="small"
                            placeholder="Repeat new password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value, formValues) => value === formValues.newPassword || 'Passwords do not match'
                            })}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            InputProps={{
                                startAdornment: <Lock size={18} style={{ marginRight: 10, color: '#94a3b8' }} />
                            }}
                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                    </Box>
                </DialogContent>

                <DialogActions sx={{ p: 2.5, gap: 1 }}>
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        color="inherit"
                        disabled={loading}
                        sx={{ borderRadius: '10px', px: 3 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        loading={loading}
                        sx={{ borderRadius: '10px', px: 3 }}
                    >
                        Update Password
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default PasswordResetModal;
