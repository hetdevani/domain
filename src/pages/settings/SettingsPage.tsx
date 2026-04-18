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
    Tabs,
    Tab,
    Avatar,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Card,
    CardContent,
    TextField as MuiTextField,
} from '@mui/material';
import {
    Shield,
    Lock,
    CheckCircle,
    User as UserIcon,
    Mail,
    Phone,
    Bell,
    Smartphone,
    ChevronRight,
    AlertCircle
} from 'lucide-react';
import api from '../../api';
import Breadcrumb from '../../components/layout/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`settings-tabpanel-${index}`}
            aria-labelledby={`settings-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
};

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.isTwoFactorEnabled || false);
    const [loading, setLoading] = useState(false);
    const [setupStep, setSetupStep] = useState<'none' | 'qr' | 'verify'>('none');
    const [secretData, setSecretData] = useState<any>(null);
    const [otpValue, setOtpValue] = useState('');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

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
        <Box sx={{ pb: 6 }}>
            <Breadcrumb />

            {/* Header Section */}
            <Box sx={{ mb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, color: '#0A3D62', letterSpacing: '-0.02em' }}>
                        Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Manage your account preferences, security, and profile information.
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, bgcolor: '#fff', p: 1, pr: 2, borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}>
                    <Avatar sx={{ bgcolor: '#0A3D62', color: '#fff', fontWeight: 800 }}>{user?.name?.[0].toUpperCase() || 'U'}</Avatar>
                    <Box>
                        <Typography variant="subtitle2" fontWeight={800} color="#0A3D62">{user?.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
                    </Box>
                </Box>
            </Box>

            <Paper sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: '#FAFBFE' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        sx={{
                            px: 2,
                            '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: '#0A3D62' },
                            '& .MuiTab-root': { fontWeight: 700, minHeight: 64, color: '#64748b', '&.Mui-selected': { color: '#0A3D62' } }
                        }}
                    >
                        <Tab icon={<UserIcon size={18} />} iconPosition="start" label="Profile" />
                        <Tab icon={<Shield size={18} />} iconPosition="start" label="Security" />
                        <Tab icon={<Bell size={18} />} iconPosition="start" label="Preferences" />
                    </Tabs>
                </Box>

                <Box sx={{ p: { xs: 2, md: 4 } }}>
                    {/* PROFILE TAB */}
                    <TabPanel value={tabValue} index={0}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="h6" fontWeight={800} sx={{ color: '#0A3D62', mb: 1 }}>Public Profile</Typography>
                                <Typography variant="body2" color="text.secondary">This is how other users will see you on the platform.</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                                        <Avatar sx={{ width: 80, height: 80, bgcolor: alpha('#0A3D62', 0.1), color: '#0A3D62', fontSize: '1.5rem', fontWeight: 800 }}>{user?.name?.[0].toUpperCase()}</Avatar>
                                        <Box>
                                            <Button variant="outlined" size="small" sx={{ borderRadius: 2, fontWeight: 700 }}>Change Avatar</Button>
                                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>JPG, GIF or PNG. Max size of 800K</Typography>
                                        </Box>
                                    </Box>
                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MuiTextField fullWidth label="Full Name" defaultValue={user?.name} variant="outlined" InputProps={{ readOnly: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: alpha('#0A3D62', 0.02) } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <MuiTextField fullWidth label="Username" defaultValue={user?.email?.split('@')[0]} variant="outlined" InputProps={{ readOnly: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: alpha('#0A3D62', 0.02) } }} />
                                        </Grid>
                                        <Grid size={{ xs: 12 }}>
                                            <MuiTextField fullWidth label="Bio" placeholder="User bio coming soon..." multiline rows={3} variant="outlined" InputProps={{ readOnly: true }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, bgcolor: alpha('#0A3D62', 0.02) } }} />
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 1 }}>
                                        <Button variant="contained" disabled sx={{ bgcolor: alpha('#0A3D62', 0.5), fontWeight: 700, borderRadius: 2, px: 4 }}>Save Changes</Button>
                                        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary', verticalAlign: 'middle' }}>Profile updates are coming soon</Typography>
                                    </Box>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12 }} sx={{ my: 4 }}><Divider /></Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="h6" fontWeight={800} sx={{ color: '#0A3D62', mb: 1 }}>Contact Info</Typography>
                                <Typography variant="body2" color="text.secondary">Your verified contact details for notifications.</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <List sx={{ border: '1px solid rgba(0,0,0,0.08)', borderRadius: 3, overflow: 'hidden' }}>
                                    <ListItem
                                        secondaryAction={<Button size="small">Change</Button>}
                                        sx={{ py: 2, borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                                    >
                                        <ListItemIcon><Mail color="#0A3D62" size={20} /></ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="subtitle2" fontWeight={700}>Email Address</Typography>}
                                            secondary={user?.email}
                                        />
                                    </ListItem>
                                    <ListItem
                                        secondaryAction={<Button size="small">Change</Button>}
                                        sx={{ py: 2 }}
                                    >
                                        <ListItemIcon><Phone color="#0A3D62" size={20} /></ListItemIcon>
                                        <ListItemText
                                            primary={<Typography variant="subtitle2" fontWeight={700}>Phone Number</Typography>}
                                            secondary={user?.mobile || 'No phone set'}
                                        />
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* SECURITY TAB */}
                    <TabPanel value={tabValue} index={1}>
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="h6" fontWeight={800} sx={{ color: '#0A3D62', mb: 1 }}>Two-Factor Authentication</Typography>
                                <Typography variant="body2" color="text.secondary">Add an extra layer of security to your account by requiring a verification code at login.</Typography>

                                <Box sx={{ mt: 3, p: 2, bgcolor: is2FAEnabled ? alpha('#10b981', 0.05) : alpha('#f59e0b', 0.05), borderRadius: 3, border: '1px solid', borderColor: is2FAEnabled ? alpha('#10b981', 0.2) : alpha('#f59e0b', 0.2) }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                        {is2FAEnabled ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#f59e0b" />}
                                        <Typography variant="subtitle2" fontWeight={800} color={is2FAEnabled ? '#065f46' : '#92400e'}>
                                            Status: {is2FAEnabled ? 'Active' : 'Unprotected'}
                                        </Typography>
                                    </Box>
                                    <Typography variant="caption" color="text.secondary">
                                        Last updated: {new Date().toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Card variant="outlined" sx={{ borderRadius: 4, mb: 4, border: '1px solid rgba(0,0,0,0.08)' }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <Box sx={{ p: 1.5, bgcolor: alpha('#0A3D62', 0.1), color: '#0A3D62', borderRadius: 2 }}>
                                                    <Smartphone size={20} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle1" fontWeight={800}>Authenticator App</Typography>
                                                    <Typography variant="body2" color="text.secondary">Use Google Authenticator or similar</Typography>
                                                </Box>
                                            </Box>
                                            <Switch
                                                checked={is2FAEnabled}
                                                onChange={handleToggle2FA}
                                                disabled={loading || setupStep !== 'none'}
                                                color="primary"
                                                sx={{
                                                    '& .MuiSwitch-switchBase.Mui-checked': { color: '#0A3D62' },
                                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#0A3D62' }
                                                }}
                                            />
                                        </Box>
                                    </CardContent>

                                    {/* Expanded Setup Flow */}
                                    {setupStep !== 'none' && (
                                        <Box sx={{ p: 4, bgcolor: '#FAFBFE', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                            {setupStep === 'qr' && secretData && (
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography variant="h6" fontWeight={800} color="#0A3D62" sx={{ mb: 1 }}>Setup Authenticator</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Scan this QR with your app or use the secret key.</Typography>

                                                    <Box sx={{ mb: 4, p: 2, bgcolor: '#fff', borderRadius: 3, border: '1px solid rgba(0,0,0,0.1)', display: 'inline-block' }}>
                                                        <img
                                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(secretData.uri)}`}
                                                            alt="2FA QR"
                                                            style={{ width: 160, height: 160, display: 'block' }}
                                                        />
                                                    </Box>

                                                    <Paper variant="outlined" sx={{ p: 1.5, mb: 4, bgcolor: '#fff', borderRadius: 2, fontFamily: 'monospace', fontSize: '1rem', fontWeight: 800, letterSpacing: 2 }}>
                                                        {secretData.base32}
                                                    </Paper>

                                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                                        <Button variant="outlined" onClick={() => setSetupStep('none')} sx={{ borderRadius: 2, px: 3 }}>Cancel</Button>
                                                        <Button variant="contained" onClick={() => setSetupStep('verify')} sx={{ bgcolor: '#0A3D62', borderRadius: 2, px: 4 }}>Next Step</Button>
                                                    </Box>
                                                </Box>
                                            )}

                                            {setupStep === 'verify' && (
                                                <Box sx={{ textAlign: 'center' }}>
                                                    <Typography variant="h6" fontWeight={800} color="#0A3D62" sx={{ mb: 1 }}>Final Verification</Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Enter the 6-digit code from your app.</Typography>

                                                    <TextField
                                                        autoFocus
                                                        variant="outlined"
                                                        placeholder="000000"
                                                        value={otpValue}
                                                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                        inputProps={{ style: { textAlign: 'center', fontSize: '2rem', fontWeight: 800, letterSpacing: 4, padding: '16px' } }}
                                                        sx={{ maxWidth: 280, mb: 4, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                                                    />

                                                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                                                        <Button variant="outlined" onClick={() => setSetupStep('qr')} sx={{ borderRadius: 2 }}>Back</Button>
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleVerifyOTP}
                                                            disabled={otpValue.length < 6 || loading}
                                                            sx={{ bgcolor: '#0A3D62', borderRadius: 2, px: 4 }}
                                                        >
                                                            {loading ? <CircularProgress size={20} /> : 'Verify & Finish'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    )}
                                </Card>

                                <Typography variant="h6" fontWeight={800} sx={{ color: '#0A3D62', mb: 2, mt: 6 }}>Password</Typography>
                                <Card variant="outlined" sx={{ borderRadius: 4, border: '1px solid rgba(0,0,0,0.08)' }}>
                                    <List>
                                        <ListItem
                                            secondaryAction={<ChevronRight size={20} color="#94a3b8" />}
                                            sx={{ cursor: 'pointer', py: 2.5, '&:hover': { bgcolor: alpha('#0A3D62', 0.02) } }}
                                            onClick={() => toast('Redirecting to password reset flow...')}
                                        >
                                            <ListItemIcon><Lock size={20} color="#0A3D62" /></ListItemIcon>
                                            <ListItemText
                                                primary={<Typography variant="subtitle2" fontWeight={800}>Change Password</Typography>}
                                                secondary="Last changed 3 months ago"
                                            />
                                        </ListItem>
                                    </List>
                                </Card>
                            </Grid>

                            <Grid size={{ xs: 12 }} sx={{ my: 4 }}><Divider /></Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="h6" fontWeight={800} sx={{ color: '#ef4444', mb: 1 }}>Danger Zone</Typography>
                                <Typography variant="body2" color="text.secondary">Sensitive actions related to your account permanence.</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Card variant="outlined" sx={{ borderRadius: 4, border: '1px solid rgba(239, 68, 68, 0.2)', bgcolor: alpha('#ef4444', 0.02) }}>
                                    <CardContent sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={800} color="#ef4444">Delete Account</Typography>
                                            <Typography variant="caption" color="text.secondary">Once you delete your account, there is no going back. Please be certain.</Typography>
                                        </Box>
                                        <Button variant="text" color="error" sx={{ fontWeight: 700 }}>Request Deletion</Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </TabPanel>

                    {/* PREFERENCES TAB */}
                    <TabPanel value={tabValue} index={2}>
                        <Box sx={{ textAlign: 'center', py: 8 }}>
                            <Box sx={{ p: 2, bgcolor: alpha('#0A3D62', 0.05), borderRadius: '50%', display: 'inline-flex', mb: 2 }}>
                                <Bell size={32} color="#0A3D62" />
                            </Box>
                            <Typography variant="h6" fontWeight={800} color="#0A3D62" sx={{ mb: 1 }}>Notifications & Preferences</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>Notification settings and display preferences are coming soon.</Typography>
                            <Button variant="outlined" disabled sx={{ borderRadius: 2 }}>Manage Preferences</Button>
                        </Box>
                    </TabPanel>
                </Box>
            </Paper>
        </Box>
    );
};

export default SettingsPage;
