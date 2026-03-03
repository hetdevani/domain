import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, Globe, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ButtonLoader } from '../../components/common/Loaders';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [authStep, setAuthStep] = useState<'creds' | '2fa' | 'otp' | 'register' | 'forgot'>('creds');
    const [otp, setOtp] = useState('');
    const [loginData, setLoginData] = useState<any>(null);
    const { login, verify2FA, verifyEmailOTP, registerUser, forgotPassword } = useAuth();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            if (authStep === 'register') {
                // if (data.password !== data.confirmPassword) {
                //     toast.error('Passwords do not match');
                //     return;
                // }
                await registerUser({
                    email: data.username,
                    password: data.password,
                    name: data.name
                });
                toast.success('Registration successful! Please sign in.');
                reset();
                setAuthStep('creds');
                return;
            }

            if (authStep === 'forgot') {
                await forgotPassword(data.username);
                toast.success('If the email is verified, you will receive reset instructions.');
                setAuthStep('creds');
                reset();
                return;
            }

            // Normal login
            const step = await login(data);
            if (step === 'TWO_FACTOR_REQUIRED') {
                setAuthStep('2fa');
                setLoginData(data);
                toast.success('Two-factor authentication required.');
            } else if (step === 'OTP_REQUIRED') {
                setAuthStep('otp');
                setLoginData(data);
                toast.success('OTP has been sent to your registered email/mobile.');
            } else if (step === 'success') {
                toast.success('Login successful! Welcome back.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Action failed. Please check your credentials.');
        }
    };

    const onVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (authStep === '2fa') {
                await verify2FA(loginData.username, otp);
                toast.success('2FA Verified! Welcome back.');
            } else if (authStep === 'otp') {
                await verifyEmailOTP(loginData.username, otp);
                toast.success('OTP Verified! Welcome back.');
            }
        } catch (err: any) {
            toast.error(err.message || 'Invalid code.');
        }
    };

    const features = [
        { icon: <ShieldCheck size={20} />, text: 'Secure Data Encryption' },
        { icon: <Zap size={20} />, text: 'High-Performance Management' },
        { icon: <Globe size={20} />, text: 'Global Access Anywhere' }
    ];

    const animationConfig = {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.3 }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#fff' }}>
            {/* Left Side - Branding (70%) */}
            <Box
                sx={{
                    flex: 0.7,
                    position: 'relative',
                    bgcolor: '#0A3D62',
                    display: { xs: 'none', md: 'flex' },
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    overflow: 'hidden',
                    p: 6
                }}
            >
                {/* Animated Background Blobs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0], x: [0, 50, 0], y: [0, -30, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%',
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(46, 204, 113, 0.15) 0%, transparent 70%)', filter: 'blur(60px)',
                    }}
                />
                <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0], x: [0, -50, 0], y: [0, 50, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%',
                        borderRadius: '50%', background: 'radial-gradient(circle, rgba(235, 245, 255, 0.1) 0%, transparent 70%)', filter: 'blur(80px)',
                    }}
                />

                {/* Left Content Container */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Box
                            component="img"
                            src="/logo-white.png"
                            alt="LeasePacket Logo"
                            onClick={() => navigate('/')}
                            sx={{
                                width: 280,
                                mb: 4,
                                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))',
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 }
                            }}
                        />
                    </motion.div>

                    <Typography variant="h2" sx={{color: '#ffffff', fontWeight: 800, mb: 2, fontSize: '3.5rem', lineHeight: 1.1 }}>
                        Optimized Infrastructure <br />
                        <Box component="span" sx={{ color: '#2ECC71' }}>Management</Box>
                    </Typography>

                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 6, fontWeight: 400, maxWidth: 550, mx: 'auto' }}>
                        Streamline your lease packets and optimize your network operations with our high-performance control panel.
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        {features.map((feature, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (idx * 0.1) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}>
                                    <Box sx={{ color: '#2ECC71' }}>{feature.icon}</Box>
                                    <Typography variant="caption" sx={{color: '#ffffff', fontWeight: 600, letterSpacing: 0.5 }}>
                                        {feature.text.toUpperCase()}
                                    </Typography>
                                </Box>
                            </motion.div>
                        ))}
                    </Box>
                </motion.div>

                {/* Decorative Grid */}
                <Box
                    sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }}
                />
            </Box>

            {/* Right Side - Login Form (30%) */}
            <Box
                sx={{
                    flex: { xs: 1, md: 0.3 }, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', p: { xs: 4, md: 6 }, position: 'relative', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
                    zIndex: 2, bgcolor: '#fff', overflowY: 'auto'
                }}
            >
                {/* Mobile Logo */}
                <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
                    <img src="/logo.png" alt="LeasePacket Logo" style={{ width: 180 }} />
                </Box>

                <Box style={{ width: '100%', maxWidth: 360, minHeight: 400 }}>
                    <AnimatePresence mode="wait">
                        {authStep === 'creds' && (
                            <motion.div key="creds" {...animationConfig}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>Welcome Back</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Please enter your details to sign in</Typography>
                                </Box>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Email Address</Typography>
                                        <TextField
                                            {...register('username', { required: 'Email is required' })}
                                            error={!!errors.username}
                                            helperText={errors.username?.message as string}
                                            fullWidth placeholder="name@company.com"
                                            InputProps={{ startAdornment: (<InputAdornment position="start"><Mail size={18} color="#94a3b8" /></InputAdornment>) }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 4 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569' }}>Password</Typography>
                                            <Typography variant="caption" onClick={() => { setAuthStep('forgot'); reset(); }}
                                                sx={{ color: '#2ECC71', fontWeight: 700, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                                            >Forgot Password?</Typography>
                                        </Box>
                                        <TextField
                                            {...register('password', { required: 'Password is required' })}
                                            error={!!errors.password} helperText={errors.password?.message as string}
                                            fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                            InputProps={{
                                                startAdornment: (<InputAdornment position="start"><Lock size={18} color="#94a3b8" /></InputAdornment>),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Box>

                                    <Button fullWidth variant="contained" size="large" type="submit" disabled={isSubmitting}
                                        sx={{ py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#2ECC71', boxShadow: '0 4px 14px 0 rgba(46, 204, 113, 0.39)', '&:hover': { backgroundColor: '#27ae60', transform: 'translateY(-1px)' } }}
                                    >
                                        {isSubmitting ? <ButtonLoader /> : 'Sign In to Dashboard'}
                                    </Button>
                                </form>

                                <Box sx={{ mt: 4, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        New here? {' '}
                                        <Typography component="span" variant="body2" onClick={() => { setAuthStep('register'); reset(); }}
                                            sx={{ color: '#0A3D62', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                        >Create an Account</Typography>
                                    </Typography>
                                </Box>
                            </motion.div>
                        )}

                        {authStep === 'register' && (
                            <motion.div key="register" {...animationConfig}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>Create Account</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Fill in the details to join us</Typography>
                                </Box>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Full Name</Typography>
                                        <TextField
                                            {...register('name', { required: 'Name is required' })}
                                            error={!!errors.name} helperText={errors.name?.message as string}
                                            fullWidth placeholder="John Doe"
                                            InputProps={{ startAdornment: (<InputAdornment position="start"><User size={18} color="#94a3b8" /></InputAdornment>) }}
                                        />
                                    </Box>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Email Address</Typography>
                                        <TextField
                                            {...register('username', { required: 'Email is required' })}
                                            error={!!errors.username} helperText={errors.username?.message as string}
                                            fullWidth placeholder="name@company.com"
                                            InputProps={{ startAdornment: (<InputAdornment position="start"><Mail size={18} color="#94a3b8" /></InputAdornment>) }}
                                        />
                                    </Box>

                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Password</Typography>
                                        <TextField
                                            {...register('password', { required: 'Password is required' })}
                                            error={!!errors.password} helperText={errors.password?.message as string}
                                            fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                            InputProps={{
                                                startAdornment: (<InputAdornment position="start"><Lock size={18} color="#94a3b8" /></InputAdornment>),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                        />
                                    </Box>

                                    {/* <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Confirm Password</Typography>
                                        <TextField
                                            {...register('confirmPassword', { required: 'Confirm Password is required' })}
                                            error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message as string}
                                            fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                                            InputProps={{
                                                startAdornment: (<InputAdornment position="start"><Lock size={18} color="#94a3b8" /></InputAdornment>),
                                            }}
                                        />
                                    </Box> */}

                                    <Button fullWidth variant="contained" size="large" type="submit" disabled={isSubmitting}
                                        sx={{ py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#2ECC71', boxShadow: '0 4px 14px 0 rgba(46, 204, 113, 0.39)', '&:hover': { backgroundColor: '#27ae60', transform: 'translateY(-1px)' } }}
                                    >
                                        {isSubmitting ? <ButtonLoader /> : 'Sign Up'}
                                    </Button>
                                </form>

                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        Already have an account? {' '}
                                        <Typography component="span" variant="body2" onClick={() => { setAuthStep('creds'); reset(); }}
                                            sx={{ color: '#0A3D62', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                        >Sign In</Typography>
                                    </Typography>
                                </Box>
                            </motion.div>
                        )}

                        {authStep === 'forgot' && (
                            <motion.div key="forgot" {...animationConfig}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>Reset Password</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Enter your email to receive recovery instructions.</Typography>
                                </Box>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Box sx={{ mb: 4 }}>
                                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Email Address</Typography>
                                        <TextField
                                            {...register('username', { required: 'Email is required' })}
                                            error={!!errors.username} helperText={errors.username?.message as string}
                                            fullWidth placeholder="name@company.com"
                                            InputProps={{ startAdornment: (<InputAdornment position="start"><Mail size={18} color="#94a3b8" /></InputAdornment>) }}
                                        />
                                    </Box>

                                    <Button fullWidth variant="contained" size="large" type="submit" disabled={isSubmitting}
                                        sx={{ py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#0A3D62', mb: 2 }}
                                    >
                                        {isSubmitting ? <ButtonLoader /> : 'Send Reset Link'}
                                    </Button>

                                    <Button fullWidth variant="text" onClick={() => { setAuthStep('creds'); reset(); }} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        Back to Login
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {(authStep === '2fa' || authStep === 'otp') && (
                            <motion.div key="otp" {...animationConfig}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>
                                        {authStep === '2fa' ? 'Two-Factor Auth' : 'OTP Verification'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                        {authStep === '2fa' ? 'Enter 6-digit code from your authenticator app' : 'Enter 6-digit code sent to your email/mobile'}
                                    </Typography>
                                </Box>

                                <form onSubmit={onVerifyOTP}>
                                    <Box sx={{ mb: 4 }}>
                                        <TextField fullWidth placeholder="000 000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                            inputProps={{ style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.4rem', fontWeight: 800 } }} autoFocus />
                                    </Box>

                                    <Button fullWidth variant="contained" size="large" type="submit" disabled={otp.length !== 6 || isSubmitting}
                                        sx={{ py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#10b981', mb: 2 }}
                                    >
                                        {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Verify Code'}
                                    </Button>

                                    <Button fullWidth variant="text" onClick={() => { setAuthStep('creds'); setOtp(''); }} sx={{ color: 'text.secondary', fontWeight: 600 }}>
                                        Back to Login
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>

                {/* Powered By Footer */}
                {/* <Box sx={{ position: 'absolute', bottom: 30, textAlign: 'center', width: '100%', px: 2 }}>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 500, letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        POWERED BY{' '}
                        <Box
                            component="a"
                            href="https://leasepacket.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                color: '#0A3D62',
                                fontWeight: 800,
                                textDecoration: 'none',
                                cursor: 'pointer',
                                '&:hover': { textDecoration: 'underline' }
                            }}
                        >
                            Lease Packet
                        </Box>
                    </Typography>
                </Box> */}
            </Box>
        </Box>
    );
};

export default LoginPage;
