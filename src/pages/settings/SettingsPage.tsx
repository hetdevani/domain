import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Switch,
    Button,
    TextField,
    CircularProgress,
    Container
} from '@mui/material';
import { Shield, Lock, Key } from 'lucide-react';
import api from '../../api';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
    const [loading, setLoading] = useState(false);
    const [setupStep, setSetupStep] = useState<'none' | 'qr' | 'verify'>('none');
    const [secretData, setSecretData] = useState<any>(null);
    const [otpValue, setOtpValue] = useState('');

    const handleToggle2FA = async () => {
        if (is2FAEnabled) {
            // Disable 2FA
            if (!window.confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
            setLoading(true);
            try {
                // The backend uses authenticate-reset to disable 2FA
                await api.post('/web/auth/authenticate-reset', { username: user?.email });
                setIs2FAEnabled(false);
                toast.success('2FA disabled successfully');
            } catch (error: any) {
                toast.error(error.message || 'Failed to disable 2FA');
            } finally {
                setLoading(false);
            }
        } else {
            // Start Enable flow
            setLoading(true);
            try {
                // The backend uses authenticate-registered-user to start 2FA setup
                const response = await api.post('/web/auth/authenticate-registered-user', { username: user?.email });
                setSecretData(response.data.data.secreateKey);
                setSetupStep('qr');
            } catch (error: any) {
                toast.error(error.message || 'Failed to initiate 2FA setup');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOTP = async () => {
        if (!otpValue) return;
        setLoading(true);
        try {
            // Verification step enables 2FA if it's currently disabled
            await api.post('/web/auth/authenticate-otp-verification', {
                username: user?.email,
                otp: otpValue,
                secretKey: secretData.base32
            });
            setIs2FAEnabled(true);
            setSetupStep('none');
            setOtpValue('');
            toast.success('2FA enabled successfully');
        } catch (error: any) {
            toast.error(error.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box>
            <Breadcrumb />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4, borderRadius: 3, bgcolor: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(16, 185, 129, 0.1)', borderRadius: 2 }}>
                            <Shield size={28} color="#10b981" />
                        </Box>
                        <Typography variant="h5" fontWeight={700}>Security Settings</Typography>
                    </Box>

                    <Box sx={{
                        p: 3,
                        border: '1px solid',
                        borderColor: is2FAEnabled ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.08)',
                        borderRadius: 3,
                        bgcolor: is2FAEnabled ? 'rgba(16, 185, 129, 0.02)' : 'transparent'
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Lock size={20} color={is2FAEnabled ? '#10b981' : 'inherit'} />
                                <Typography variant="subtitle1" fontWeight={700}>
                                    Two-Factor Authentication (2FA)
                                </Typography>
                            </Box>
                            <Switch
                                checked={is2FAEnabled}
                                onChange={handleToggle2FA}
                                disabled={loading || setupStep !== 'none'}
                                color="success"
                            />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                            Add an extra layer of security to your account. Once enabled, you'll need to enter a code from your authenticator app to log in.
                        </Typography>
                    </Box>

                    {setupStep === 'qr' && secretData && (
                        <Box sx={{ mt: 4, p: 4, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Step 1: Set up Authenticator</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Scan the QR code below with your Google Authenticator or similar app.
                            </Typography>

                            <Box sx={{ mb: 4, p: 2, bgcolor: '#fff', display: 'inline-block', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(secretData.uri)}`}
                                    alt="2FA QR Code"
                                    style={{ width: 200, height: 200 }}
                                />
                            </Box>

                            <Box sx={{ mb: 4 }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', textTransform: 'uppercase' }}>
                                    Secret Key (Manual Entry)
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 'monospace', letterSpacing: 3, mt: 1, color: '#111827' }}>
                                    {secretData.base32}
                                </Typography>
                            </Box>

                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => setSetupStep('verify')}
                                sx={{ px: 6, borderRadius: 2, fontWeight: 700 }}
                            >
                                Next Step
                            </Button>
                        </Box>
                    )}

                    {setupStep === 'verify' && (
                        <Box sx={{ mt: 4, p: 4, bgcolor: 'rgba(0,0,0,0.02)', borderRadius: 3, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 2 }}>
                                <Key size={24} color="#3b82f6" />
                                <Typography variant="h6" fontWeight={700}>Step 2: Verify OTP</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                                Enter the 6-digit code from your authenticator app to complete setup.
                            </Typography>

                            <TextField
                                fullWidth
                                placeholder="000 000"
                                value={otpValue}
                                variant="outlined"
                                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                inputProps={{
                                    style: {
                                        textAlign: 'center',
                                        fontSize: '1.5rem',
                                        letterSpacing: '0.5rem',
                                        fontWeight: 700
                                    }
                                }}
                                sx={{ maxWidth: 350, mb: 4 }}
                                autoFocus
                            />

                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => setSetupStep('qr')}
                                    disabled={loading}
                                    sx={{ px: 4, borderRadius: 2 }}
                                >
                                    Back
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    color="success"
                                    onClick={handleVerifyOTP}
                                    disabled={loading || otpValue.length !== 6}
                                    sx={{ px: 4, borderRadius: 2, fontWeight: 700 }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify & Enable'}
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Container>
        </Box>
    );
};

export default SettingsPage;
