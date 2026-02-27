import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Switch,
    Button,
    TextField,
    CircularProgress,
    Grid,
    Divider,
    alpha,
} from '@mui/material';
import { Shield, Lock, Key, CheckCircle } from 'lucide-react';
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
            if (!window.confirm('Are you sure you want to disable Two-Factor Authentication?')) return;
            setLoading(true);
            try {
                await api.post('/web/auth/authenticate-reset', { username: user?.email });
                setIs2FAEnabled(false);
                toast.success('2FA disabled successfully');
            } catch (error: any) {
                toast.error(error.message || 'Failed to disable 2FA');
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(true);
            try {
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

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: '#0A3D62', letterSpacing: '-0.02em' }}>
                    Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Manage your account preferences and security settings.
                </Typography>
            </Box>

            <Grid container spacing={3} sx={{ maxWidth: 900 }}>
                {/* Security Card */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{
                        borderRadius: 3,
                        boxShadow: '0 2px 20px rgba(0,0,0,0.07)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        overflow: 'hidden'
                    }}>
                        {/* Card Header */}
                        <Box sx={{
                            px: 3,
                            py: 2.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            borderBottom: '1px solid rgba(0,0,0,0.06)',
                            bgcolor: '#F8FAFC'
                        }}>
                            <Box sx={{ p: 1, bgcolor: alpha('#10b981', 0.1), borderRadius: 2 }}>
                                <Shield size={22} color="#10b981" />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={800} color="#0A3D62">
                                    Security Settings
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Protect your account with additional security measures
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ p: 3 }}>
                            {/* 2FA Toggle Row */}
                            <Box sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 2.5,
                                borderRadius: 2.5,
                                border: '1px solid',
                                borderColor: is2FAEnabled ? alpha('#10b981', 0.25) : 'rgba(0,0,0,0.08)',
                                bgcolor: is2FAEnabled ? alpha('#10b981', 0.04) : '#FAFBFE',
                                transition: 'all 0.3s ease'
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{
                                        p: 1,
                                        borderRadius: 1.5,
                                        bgcolor: is2FAEnabled ? alpha('#10b981', 0.12) : 'rgba(0,0,0,0.05)',
                                        color: is2FAEnabled ? '#10b981' : '#94a3b8',
                                        transition: 'all 0.3s ease'
                                    }}>
                                        <Lock size={18} />
                                    </Box>
                                    <Box>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.25 }}>
                                            Two-Factor Authentication (2FA)
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {is2FAEnabled
                                                ? 'Your account is protected with 2FA'
                                                : 'Add an extra layer of security to your login'}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    {is2FAEnabled && (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#10b981' }}>
                                            <CheckCircle size={15} />
                                            <Typography variant="caption" fontWeight={700}>Active</Typography>
                                        </Box>
                                    )}
                                    <Switch
                                        checked={is2FAEnabled}
                                        onChange={handleToggle2FA}
                                        disabled={loading || setupStep !== 'none'}
                                        color="success"
                                    />
                                </Box>
                            </Box>

                            {/* QR Code Setup */}
                            {setupStep === 'qr' && secretData && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="overline" sx={{ fontWeight: 700, color: '#0A3D62', letterSpacing: '0.1em' }}>
                                            Step 1 of 2
                                        </Typography>
                                        <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5, color: '#0A3D62' }}>
                                            Set up Authenticator App
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 480, mx: 'auto' }}>
                                            Scan the QR code below with Google Authenticator, Authy, or any TOTP-compatible app.
                                        </Typography>

                                        <Box sx={{
                                            mb: 3,
                                            p: 2.5,
                                            bgcolor: '#fff',
                                            display: 'inline-block',
                                            borderRadius: 3,
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                                            border: '1px solid rgba(0,0,0,0.06)'
                                        }}>
                                            <img
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(secretData.uri)}`}
                                                alt="2FA QR Code"
                                                style={{ width: 180, height: 180, display: 'block' }}
                                            />
                                        </Box>

                                        <Box sx={{ mb: 4, p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid rgba(0,0,0,0.06)', maxWidth: 400, mx: 'auto' }}>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', mb: 1 }}>
                                                Manual Entry Key
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontFamily: 'monospace', letterSpacing: 4, color: '#111827', fontWeight: 700 }}>
                                                {secretData.base32}
                                            </Typography>
                                        </Box>

                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => setSetupStep('verify')}
                                            sx={{ px: 6, borderRadius: 2, fontWeight: 700, bgcolor: '#0A3D62', '&:hover': { bgcolor: '#0d4d7a' } }}
                                        >
                                            Continue to Verify
                                        </Button>
                                    </Box>
                                </>
                            )}

                            {/* OTP Verification */}
                            {setupStep === 'verify' && (
                                <>
                                    <Divider sx={{ my: 3 }} />
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="overline" sx={{ fontWeight: 700, color: '#0A3D62', letterSpacing: '0.1em' }}>
                                            Step 2 of 2
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 0.5 }}>
                                            <Key size={22} color="#0A3D62" />
                                            <Typography variant="h6" fontWeight={800} color="#0A3D62">
                                                Verify Your Code
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                                            Enter the 6-digit code from your authenticator app to complete 2FA setup.
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
                                                    fontSize: '2rem',
                                                    letterSpacing: '0.6rem',
                                                    fontWeight: 800,
                                                    fontFamily: 'monospace',
                                                    padding: '16px',
                                                }
                                            }}
                                            sx={{
                                                maxWidth: 280,
                                                mb: 4,
                                                mx: 'auto',
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 2.5,
                                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#0A3D62', borderWidth: 2 }
                                                }
                                            }}
                                            autoFocus
                                        />

                                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                            <Button
                                                variant="outlined"
                                                size="large"
                                                onClick={() => setSetupStep('qr')}
                                                disabled={loading}
                                                sx={{ px: 4, borderRadius: 2, fontWeight: 600 }}
                                            >
                                                Back
                                            </Button>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                color="success"
                                                onClick={handleVerifyOTP}
                                                disabled={loading || otpValue.length !== 6}
                                                sx={{ px: 5, borderRadius: 2, fontWeight: 700, boxShadow: 'none' }}
                                            >
                                                {loading ? <CircularProgress size={22} color="inherit" /> : 'Verify & Enable'}
                                            </Button>
                                        </Box>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default SettingsPage;
