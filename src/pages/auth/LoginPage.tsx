import React, { useState } from 'react';
import {
    Box, Typography, TextField, Button,
    IconButton, InputAdornment, Stack, CircularProgress,
} from '@mui/material';
import {
    Mail, Lock, Eye, EyeOff, Globe,
    User, ShieldCheck, Zap, ArrowRight, CheckCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ButtonLoader } from '../../components/common/Loaders';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../../theme';

/* ── animation ── */
const slide = {
    initial:    { opacity: 0, y: 12 },
    animate:    { opacity: 1, y: 0  },
    exit:       { opacity: 0, y: -12 },
    transition: { duration: 0.26, ease: [0.22, 1, 0.36, 1] as any },
};

/* ── shared input style (light) ── */
const inputSx = {
    '& .MuiInputLabel-root': { display: 'none' },
    '& .MuiOutlinedInput-root': {
        bgcolor:      '#ffffff',
        borderRadius: '10px',
        color:        BRAND.textPrimary,
        fontSize:     '0.9rem',
        '& fieldset':             { borderColor: BRAND.borderLight },
        '&:hover fieldset':       { borderColor: `${BRAND.amber}70` },
        '&.Mui-focused fieldset': { borderColor: BRAND.amber, borderWidth: '1.5px' },
        '&.Mui-error fieldset':   { borderColor: BRAND.danger },
    },
    '& .MuiInputBase-input::placeholder': { color: BRAND.textMuted, opacity: 1 },
    '& .MuiFormHelperText-root': { color: BRAND.danger, fontSize: '0.75rem', mt: 0.5 },
};

/* ── amber CTA button ── */
const AmberBtn: React.FC<{ type?: 'submit'|'button'; disabled?: boolean; onClick?: ()=>void; children: React.ReactNode }> =
({ type='button', disabled, onClick, children }) => (
    <Button type={type} disabled={disabled} onClick={onClick} fullWidth variant="contained" size="large"
        sx={{
            py: 1.6, fontSize: '0.9375rem', fontWeight: 800, borderRadius: '12px',
            background: `linear-gradient(135deg, ${BRAND.amberLt} 0%, ${BRAND.amber} 55%, ${BRAND.amberDk} 100%)`,
            color: '#0a0f1e', boxShadow: `0 4px 18px ${BRAND.amberGlow}`,
            transition: 'filter 0.18s, box-shadow 0.18s',
            '&:hover': { background: `linear-gradient(135deg, ${BRAND.amberLt} 0%, ${BRAND.amber} 55%, ${BRAND.amberDk} 100%)`, filter: 'brightness(1.08)', boxShadow: `0 6px 26px rgba(245,158,11,0.36)` },
            '&:disabled': { background: 'rgba(245,158,11,0.2)', color: 'rgba(10,15,30,0.4)' },
        }}
    >
        {children}
    </Button>
);

/* ── field wrapper ── */
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ mb: 0.75, fontSize: '0.75rem', fontWeight: 700, color: BRAND.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</Typography>
        {children}
    </Box>
);

/* ══════════════════════════════ PAGE ══════════════════════════════ */
const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [showPwd, setShowPwd] = useState(false);
    const [step, setStep]       = useState<'creds'|'2fa'|'otp'|'register'|'forgot'>('creds');
    const [otp, setOtp]         = useState('');
    const [loginData, setLoginData] = useState<any>(null);
    const { login, verify2FA, verifyEmailOTP, registerUser, forgotPassword } = useAuth();
    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            if (step === 'register') {
                await registerUser({ email: data.username, password: data.password, name: data.name });
                toast.success('Registration successful! Please sign in.');
                reset(); setStep('creds'); return;
            }
            if (step === 'forgot') {
                await forgotPassword(data.username);
                toast.success('If the email is verified, you will receive reset instructions.');
                setStep('creds'); reset(); return;
            }
            const result = await login(data);
            if (result === 'TWO_FACTOR_REQUIRED') { setStep('2fa'); setLoginData(data); toast.success('2FA required.'); }
            else if (result === 'OTP_REQUIRED')   { setStep('otp'); setLoginData(data); toast.success('OTP sent to email/mobile.'); }
            else if (result === 'success')         { toast.success('Welcome back!'); }
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Invalid credentials.');
        }
    };

    const onVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (step === '2fa') await verify2FA(loginData.username, otp);
            else await verifyEmailOTP(loginData.username, otp);
            toast.success('Verified! Welcome back.');
        } catch (err: any) { toast.error(err.message || 'Invalid code.'); }
    };

    const leftStats = [
        { icon: <ShieldCheck size={16}/>, text: 'Free WHOIS Privacy'    },
        { icon: <Zap         size={16}/>, text: 'Instant Activation'    },
        { icon: <CheckCircle size={16}/>, text: 'GST-Ready Invoices'    },
        { icon: <Globe       size={16}/>, text: '100+ Domain Extensions'},
    ];

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: BRAND.bgPage }}>

            {/* ══ LEFT — branding panel (dark landing style) ══ */}
            <Box
                sx={{
                    flex:           0.7,
                    display:        { xs: 'none', md: 'flex' },
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    position:       'relative',
                    overflow:       'hidden',
                    p:              6,
                    background:     `linear-gradient(160deg, ${BRAND.bgDeep} 0%, #070b1c 45%, #0c1230 100%)`,
                    borderRight:    `1px solid rgba(148,163,184,0.08)`,
                }}
            >
                {/* Aurora gradient layers */}
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: [
                        `radial-gradient(ellipse 80% 60% at 10% 0%,  ${BRAND.violetGlow} 0%, transparent 55%)`,
                        `radial-gradient(ellipse 70% 50% at 90% 10%, ${BRAND.amberGlow}  0%, transparent 52%)`,
                        `radial-gradient(ellipse 50% 40% at 50% 85%, ${BRAND.cyanGlow}   0%, transparent 48%)`,
                    ].join(','),
                }} />

                {/* Animated orbs */}
                <motion.div aria-hidden animate={{ y: [0, -20, 0], scale: [1, 1.06, 1] }} transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ position: 'absolute', top: '6%', left: '4%', width: 380, height: 380, borderRadius: '50%', background: `radial-gradient(circle, ${BRAND.amberGlow} 0%, transparent 68%)`, filter: 'blur(2px)', pointerEvents: 'none' }} />
                <motion.div aria-hidden animate={{ y: [0, -16, 0], scale: [1, 1.04, 1] }} transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                    style={{ position: 'absolute', bottom: '8%', right: '2%', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${BRAND.violetGlow} 0%, transparent 65%)`, pointerEvents: 'none' }} />

                {/* Dot grid */}
                <Box aria-hidden sx={{ position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1px)`, backgroundSize: '36px 36px', pointerEvents: 'none' }} />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 460 }}>

                    {/* Brand mark */}
                    <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                        <Box
                            sx={{
                                width: 72, height: 72, borderRadius: '20px', mx: 'auto', mb: 3,
                                background: `linear-gradient(135deg, ${BRAND.amberLt}, ${BRAND.amber}, ${BRAND.amberDk})`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 14px 40px ${BRAND.amberGlow}`,
                                cursor: 'pointer',
                            }}
                            onClick={() => navigate('/')}
                        >
                            <Globe size={32} color="#0a0f1e" strokeWidth={2.2} />
                        </Box>
                    </motion.div>

                    {/* Eyebrow label */}
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 99, px: 2, py: 0.6, mb: 2.5 }}>
                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: BRAND.amber, boxShadow: `0 0 8px ${BRAND.amberGlow}` }} />
                        <Typography sx={{ color: BRAND.amber, fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                            Plan A Hosting
                        </Typography>
                    </Box>

                    <Typography sx={{
                        fontFamily: '"Outfit","DM Sans",sans-serif', fontWeight: 900,
                        fontSize: { md: '2.8rem', lg: '3.4rem' }, lineHeight: 1.05,
                        letterSpacing: '-0.04em', color: BRAND.textLt, mb: 2.5,
                    }}>
                        Welcome back
                        <Box component="span" sx={{
                            display: 'block',
                            background: `linear-gradient(135deg, ${BRAND.amberLt} 0%, ${BRAND.amber} 55%, ${BRAND.amberDk} 100%)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            to your dashboard
                        </Box>
                    </Typography>

                    <Typography sx={{ color: 'rgba(148,163,184,0.75)', fontSize: '1.0625rem', fontWeight: 400, lineHeight: 1.75, letterSpacing: '0.01em', mb: 5, maxWidth: 400, mx: 'auto' }}>
                        Manage domains, hosting &amp; services from one powerful control panel built for Indian businesses.
                    </Typography>

                    <Box sx={{ display: 'inline-grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, textAlign: 'left' }}>
                        {leftStats.map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.1 }}>
                                <Stack direction="row" spacing={1.25} alignItems="center"
                                    sx={{ bgcolor: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.08)`, borderRadius: '10px', px: 2, py: 1.1, backdropFilter: 'blur(8px)', transition: 'border-color 0.2s', '&:hover': { borderColor: 'rgba(245,158,11,0.3)' } }}>
                                    <Box sx={{ color: BRAND.amber, flexShrink: 0 }}>{s.icon}</Box>
                                    <Typography sx={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.01em', color: 'rgba(248,250,252,0.75)' }}>{s.text}</Typography>
                                </Stack>
                            </motion.div>
                        ))}
                    </Box>
                </motion.div>
            </Box>

            {/* ══ RIGHT — form panel ══ */}
            <Box
                sx={{
                    flex:           { xs: 1, md: 0.3 },
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    p:              { xs: 3, sm: 5, md: 6 },
                    bgcolor:        '#ffffff',
                    overflowY:      'auto',
                    position:       'relative',
                }}
            >
                {/* Mobile brand */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '11px', background: `linear-gradient(135deg, ${BRAND.amberLt}, ${BRAND.amberDk})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${BRAND.amberGlow}` }}>
                        <Globe size={20} color="#0a0f1e" strokeWidth={2.3} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, color: BRAND.textPrimary, fontFamily: '"Outfit",sans-serif', fontSize: '1rem' }}>Plan A</Typography>
                        <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: BRAND.amber, letterSpacing: '0.14em', textTransform: 'uppercase' }}>Hosting</Typography>
                    </Box>
                </Box>

                <Box sx={{ width: '100%', maxWidth: 400 }}>
                    <AnimatePresence mode="wait">

                        {/* ── Sign In ── */}
                        {step === 'creds' && (
                            <motion.div key="creds" {...slide}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: BRAND.textPrimary, fontFamily: '"Outfit",sans-serif', letterSpacing: '-0.035em', lineHeight: 1.1, mb: 0.75 }}>Sign in</Typography>
                                    <Typography sx={{ color: BRAND.textMuted, fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.6 }}>Enter your credentials to continue</Typography>
                                </Box>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Field label="Email Address">
                                        <TextField fullWidth placeholder="name@company.com"
                                            {...register('username', { required: 'Email is required' })}
                                            error={!!errors.username} helperText={errors.username?.message as string}
                                            inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={17} color={BRAND.textMuted} /></InputAdornment> }}
                                            sx={inputSx} />
                                    </Field>
                                    <Box sx={{ mb: 2.5 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                                            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: BRAND.textSecondary, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Password</Typography>
                                            <Typography onClick={() => { setStep('forgot'); reset(); }}
                                                sx={{ fontSize: '0.78rem', color: BRAND.amberDk, fontWeight: 700, letterSpacing: '0.01em', cursor: 'pointer', '&:hover': { color: BRAND.amber } }}>
                                                Forgot password?
                                            </Typography>
                                        </Box>
                                        <TextField fullWidth type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                                            {...register('password', { required: 'Password is required' })}
                                            error={!!errors.password} helperText={errors.password?.message as string}
                                            inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Lock size={17} color={BRAND.textMuted} /></InputAdornment>,
                                                endAdornment: <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small" sx={{ color: BRAND.textMuted, '&:hover': { color: BRAND.amberDk } }}>
                                                        {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                                                    </IconButton>
                                                </InputAdornment>,
                                            }}
                                            sx={inputSx} />
                                    </Box>
                                    <Box sx={{ mt: 3.5 }}>
                                        <AmberBtn type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <ButtonLoader /> : <Stack direction="row" alignItems="center" spacing={1} justifyContent="center"><span>Sign In to Dashboard</span><ArrowRight size={17} /></Stack>}
                                        </AmberBtn>
                                    </Box>
                                </form>
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography sx={{ color: BRAND.textMuted, fontSize: '0.875rem', fontWeight: 400, letterSpacing: '0.01em' }}>
                                        New here?{' '}
                                        <Box component="span" onClick={() => { setStep('register'); reset(); }} sx={{ color: BRAND.amberDk, fontWeight: 700, letterSpacing: '0.01em', cursor: 'pointer', '&:hover': { color: BRAND.amber } }}>
                                            Create an Account
                                        </Box>
                                    </Typography>
                                </Box>
                            </motion.div>
                        )}

                        {/* ── Register ── */}
                        {step === 'register' && (
                            <motion.div key="register" {...slide}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: BRAND.textPrimary, fontFamily: '"Outfit",sans-serif', letterSpacing: '-0.035em', lineHeight: 1.1, mb: 0.75 }}>Create Account</Typography>
                                    <Typography sx={{ color: BRAND.textMuted, fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.6 }}>Fill in the details to join us</Typography>
                                </Box>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Field label="Full Name">
                                        <TextField fullWidth placeholder="John Doe"
                                            {...register('name', { required: 'Name is required' })}
                                            error={!!errors.name} helperText={errors.name?.message as string}
                                            inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><User size={17} color={BRAND.textMuted} /></InputAdornment> }}
                                            sx={inputSx} />
                                    </Field>
                                    <Field label="Email Address">
                                        <TextField fullWidth placeholder="name@company.com"
                                            {...register('username', { required: 'Email is required' })}
                                            error={!!errors.username} helperText={errors.username?.message as string}
                                            inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={17} color={BRAND.textMuted} /></InputAdornment> }}
                                            sx={inputSx} />
                                    </Field>
                                    <Field label="Password">
                                        <TextField fullWidth type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                                            {...register('password', { required: 'Password is required' })}
                                            error={!!errors.password} helperText={errors.password?.message as string}
                                            inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><Lock size={17} color={BRAND.textMuted} /></InputAdornment>,
                                                endAdornment: <InputAdornment position="end">
                                                    <IconButton onClick={() => setShowPwd(!showPwd)} edge="end" size="small" sx={{ color: BRAND.textMuted, '&:hover': { color: BRAND.amberDk } }}>
                                                        {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                                                    </IconButton>
                                                </InputAdornment>,
                                            }}
                                            sx={inputSx} />
                                    </Field>
                                    <Box sx={{ mt: 3.5 }}>
                                        <AmberBtn type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <ButtonLoader /> : 'Create Account'}
                                        </AmberBtn>
                                    </Box>
                                </form>
                                <Box sx={{ mt: 3, textAlign: 'center' }}>
                                    <Typography sx={{ color: BRAND.textMuted, fontSize: '0.875rem', fontWeight: 400, letterSpacing: '0.01em' }}>
                                        Already have an account?{' '}
                                        <Box component="span" onClick={() => { setStep('creds'); reset(); }} sx={{ color: BRAND.amberDk, fontWeight: 700, letterSpacing: '0.01em', cursor: 'pointer', '&:hover': { color: BRAND.amber } }}>
                                            Sign In
                                        </Box>
                                    </Typography>
                                </Box>
                            </motion.div>
                        )}

                        {/* ── Forgot Password ── */}
                        {step === 'forgot' && (
                            <motion.div key="forgot" {...slide}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: BRAND.textPrimary, fontFamily: '"Outfit",sans-serif', letterSpacing: '-0.035em', lineHeight: 1.1, mb: 0.75 }}>Reset Password</Typography>
                                    <Typography sx={{ color: BRAND.textMuted, fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.6 }}>Enter your email to receive recovery instructions.</Typography>
                                </Box>
                                <form onSubmit={handleSubmit(onSubmit)}>
                                    <Field label="Email Address">
                                        <TextField fullWidth placeholder="name@company.com"
                                            {...register('username', { required: 'Email is required' })}
                                            error={!!errors.username} helperText={errors.username?.message as string}
                                            inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={17} color={BRAND.textMuted} /></InputAdornment> }}
                                            sx={inputSx} />
                                    </Field>
                                    <Box sx={{ mt: 3.5 }}>
                                        <AmberBtn type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <ButtonLoader /> : 'Send Reset Link'}
                                        </AmberBtn>
                                    </Box>
                                    <Button fullWidth variant="text" onClick={() => { setStep('creds'); reset(); }}
                                        sx={{ mt: 1.5, color: BRAND.textSecondary, fontWeight: 600, '&:hover': { color: BRAND.textPrimary, bgcolor: BRAND.bgSection } }}>
                                        ← Back to Sign In
                                    </Button>
                                </form>
                            </motion.div>
                        )}

                        {/* ── 2FA / OTP ── */}
                        {(step === '2fa' || step === 'otp') && (
                            <motion.div key="otp" {...slide}>
                                <Box sx={{ mb: 4 }}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '2rem', color: BRAND.textPrimary, fontFamily: '"Outfit",sans-serif', letterSpacing: '-0.035em', lineHeight: 1.1, mb: 0.75 }}>
                                        {step === '2fa' ? 'Two-Factor Auth' : 'OTP Verification'}
                                    </Typography>
                                    <Typography sx={{ color: BRAND.textMuted, fontSize: '0.9rem', fontWeight: 400, letterSpacing: '0.01em', lineHeight: 1.6 }}>
                                        {step === '2fa' ? 'Enter the 6-digit code from your authenticator app' : 'Enter the 6-digit code sent to your email/mobile'}
                                    </Typography>
                                </Box>
                                <form onSubmit={onVerifyOTP}>
                                    <TextField fullWidth placeholder="000000" value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g,'').slice(0,6))}
                                        autoFocus
                                        inputProps={{ style: { textAlign: 'center', fontSize: '2rem', letterSpacing: '0.5rem', fontWeight: 900, paddingTop: 18, paddingBottom: 18, color: BRAND.textPrimary } }}
                                        sx={inputSx} />
                                    <Box sx={{ mt: 3.5 }}>
                                        <AmberBtn type="submit" disabled={otp.length !== 6 || isSubmitting}>
                                            {isSubmitting ? <CircularProgress size={22} sx={{ color: 'inherit' }} /> : 'Verify Code'}
                                        </AmberBtn>
                                    </Box>
                                    <Button fullWidth variant="text" onClick={() => { setStep('creds'); setOtp(''); }}
                                        sx={{ mt: 1.5, color: BRAND.textSecondary, fontWeight: 600, '&:hover': { color: BRAND.textPrimary, bgcolor: BRAND.bgSection } }}>
                                        ← Back to Sign In
                                    </Button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Box>
            </Box>
        </Box>
    );
};

export default LoginPage;
