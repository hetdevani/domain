import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Stack,
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, Globe, User, ShieldCheck, Zap, ArrowRight, CheckCircle, Headphones } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ButtonLoader } from '../../components/common/Loaders';
import { motion } from 'framer-motion';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../../theme';

/* ── Shorthand tokens ── */
const A  = BRAND.amber;
const AL = BRAND.amberLt;
const AD = BRAND.amberDk;
const AG = BRAND.amberGlow;

/* ── Static data ── */
const features = [
    { icon: <ShieldCheck size={17} />, label: 'Free WHOIS Privacy' },
    { icon: <Zap         size={17} />, label: 'Instant Activation'  },
    { icon: <Headphones  size={17} />, label: '24/7 Support'         },
];

const benefits = [
    'Free WHOIS privacy on all domains',
    'GST-compliant invoices',
    '24/7 Hindi & English support',
    '30-day money-back guarantee',
];

/* ── Shared input style (light theme) ── */
const inputSx = {
    '& .MuiOutlinedInput-root': {
        bgcolor:      '#ffffff',
        borderRadius: '10px',
        color:        BRAND.textPrimary,
        '& fieldset':             { borderColor: BRAND.borderLight },
        '&:hover fieldset':       { borderColor: `${A}88` },
        '&.Mui-focused fieldset': { borderColor: A, borderWidth: '1.5px' },
    },
    '& .MuiInputBase-input': { color: BRAND.textPrimary },
    '& .MuiInputBase-input::placeholder': { color: BRAND.textMuted, opacity: 1 },
    '& .MuiFormHelperText-root':          { color: BRAND.danger },
};

/* ── Amber CTA button ── */
const AmberBtn: React.FC<{ loading: boolean; label: string }> = ({ loading, label }) => (
    <Button
        type="submit" fullWidth variant="contained" size="large" disabled={loading}
        sx={{
            py: 1.75, fontSize: '0.9375rem', fontWeight: 800, borderRadius: '12px',
            background:  `linear-gradient(135deg, ${AL} 0%, ${A} 55%, ${AD} 100%)`,
            color:       '#0a0f1e',
            boxShadow:   `0 6px 24px ${AG}`,
            transition:  'filter 0.18s, box-shadow 0.18s',
            '&:hover':    { filter: 'brightness(1.1)', boxShadow: `0 8px 30px rgba(245,158,11,0.42)` },
            '&:disabled': { background: 'rgba(245,158,11,0.22)', color: 'rgba(10,15,30,0.4)' },
        }}
    >
        {loading ? <ButtonLoader /> : (
            <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                <span>{label}</span>
                <ArrowRight size={18} />
            </Stack>
        )}
    </Button>
);

/* ── Field label ── */
const Label: React.FC<{ text: string }> = ({ text }) => (
    <Typography sx={{ mb: 0.75, fontWeight: 700, fontSize: '0.8rem', color: BRAND.textSecondary, letterSpacing: '0.03em' }}>
        {text}
    </Typography>
);

/* ══════════════════════════════════════════════════ */
const SignupPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            await api.post('/web/auth/signup', data);
            toast.success('Account created! Please sign in.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Signup failed.');
        }
    };

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: '#f4f6fc' }}>

            {/* ══ LEFT PANEL — amber/cream gradient ══ */}
            <Box
                sx={{
                    flex:           0.58,
                    position:       'relative',
                    display:        { xs: 'none', md: 'flex' },
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    overflow:       'hidden',
                    background:     'linear-gradient(145deg, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)',
                    p: 6,
                }}
            >
                {/* Soft amber orbs */}
                {[
                    { top:    '5%',  left:  '10%', size: 320, opacity: 0.35 },
                    { bottom: '8%',  right:  '6%', size: 260, opacity: 0.28 },
                    { top:   '42%',  right: '18%', size: 140, opacity: 0.20 },
                ].map((o, i) => (
                    <motion.div
                        key={i} aria-hidden
                        style={{
                            position: 'absolute', borderRadius: '50%', pointerEvents: 'none',
                            width: o.size, height: o.size,
                            background: `radial-gradient(circle, rgba(245,158,11,${o.opacity}) 0%, transparent 68%)`,
                            top: (o as any).top, bottom: (o as any).bottom,
                            left: (o as any).left, right: (o as any).right,
                        }}
                        animate={{ y: [0, -14, 0], scale: [1, 1.04, 1] }}
                        transition={{ duration: 9 + i * 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                ))}

                {/* Dot grid */}
                <Box aria-hidden sx={{
                    position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.18,
                    backgroundImage: 'radial-gradient(rgba(180,120,0,0.55) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }} />

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                    style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 520 }}
                >
                    {/* Globe logo */}
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Box
                            onClick={() => navigate('/')}
                            sx={{
                                width: 72, height: 72, borderRadius: '20px', mx: 'auto', mb: 3.5,
                                background: `linear-gradient(135deg, ${AL} 0%, ${A} 55%, ${AD} 100%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: `0 16px 48px ${AG}, 0 0 0 1px ${A}40 inset`,
                                cursor: 'pointer',
                            }}
                        >
                            <Globe size={34} color="#0a0f1e" strokeWidth={2.3} />
                        </Box>
                    </motion.div>

                    {/* Brand label */}
                    <Typography sx={{ color: AD, fontSize: '0.76rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', mb: 1.5 }}>
                        Plan A Hosting
                    </Typography>

                    {/* Headline */}
                    <Typography sx={{
                        fontWeight: 900, mb: 2.5,
                        fontSize: { md: '2.7rem', lg: '3.1rem' },
                        lineHeight: 1.06, letterSpacing: '-0.03em',
                        fontFamily: '"Outfit","DM Sans",sans-serif',
                        color: '#1c1400',
                    }}>
                        Join India's most
                        <Box component="span" sx={{
                            display: 'block',
                            background: `linear-gradient(135deg, ${AD} 0%, ${A} 60%, #b45309 100%)`,
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                        }}>
                            trusted platform
                        </Box>
                    </Typography>

                    {/* Sub-text */}
                    <Typography sx={{ color: '#92681a', fontSize: '1rem', lineHeight: 1.7, mb: 4, maxWidth: 400, mx: 'auto' }}>
                        Register your domain and get blazing-fast hosting in minutes. Serving 50,000+ Indian businesses.
                    </Typography>

                    {/* Feature pills */}
                    <Stack direction="row" spacing={1.5} justifyContent="center" flexWrap="wrap" sx={{ gap: 1.25, mb: 4 }}>
                        {features.map((f, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.12 }}>
                                <Stack direction="row" spacing={0.75} alignItems="center"
                                    sx={{
                                        bgcolor: 'rgba(245,158,11,0.12)', border: `1px solid rgba(245,158,11,0.35)`,
                                        borderRadius: 99, px: 1.75, py: 0.65,
                                    }}>
                                    <Box sx={{ color: AD }}>{f.icon}</Box>
                                    <Typography sx={{ color: '#78480a', fontSize: '0.78rem', fontWeight: 700 }}>{f.label}</Typography>
                                </Stack>
                            </motion.div>
                        ))}
                    </Stack>

                    {/* Benefits list */}
                    <Stack spacing={1.25} alignItems="flex-start" sx={{ display: 'inline-flex', textAlign: 'left' }}>
                        {benefits.map(b => (
                            <Stack key={b} direction="row" spacing={1} alignItems="center">
                                <CheckCircle size={15} color={BRAND.success} />
                                <Typography sx={{ color: '#5a3b08', fontSize: '0.875rem', fontWeight: 500 }}>{b}</Typography>
                            </Stack>
                        ))}
                    </Stack>

                    {/* Stats row */}
                    <Stack direction="row" spacing={0} sx={{ mt: 4.5, borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.25)' }}>
                        {[
                            { value: '50K+',   label: 'Businesses' },
                            { value: '99.9%',  label: 'Uptime SLA' },
                            { value: '2M+',    label: 'Domains'    },
                        ].map((s, i) => (
                            <Box key={i} sx={{
                                flex: 1, py: 1.5, px: 1, textAlign: 'center',
                                bgcolor: i === 1 ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.08)',
                                borderRight: i < 2 ? '1px solid rgba(245,158,11,0.25)' : 'none',
                            }}>
                                <Typography sx={{ fontWeight: 900, fontSize: '1.05rem', color: AD, fontFamily: '"Outfit",sans-serif', lineHeight: 1.1 }}>
                                    {s.value}
                                </Typography>
                                <Typography sx={{ fontSize: '0.68rem', color: '#a06020', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                    {s.label}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </motion.div>
            </Box>

            {/* ══ RIGHT PANEL — white form ══ */}
            <Box
                sx={{
                    flex:           { xs: 1, md: 0.42 },
                    display:        'flex',
                    flexDirection:  'column',
                    alignItems:     'center',
                    justifyContent: 'center',
                    p:              { xs: 3, md: 5 },
                    position:       'relative',
                    zIndex:         2,
                    bgcolor:        '#ffffff',
                    borderLeft:     `1px solid ${BRAND.borderLight}`,
                    overflowY:      'auto',
                }}
            >
                {/* Mobile brand header */}
                <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.5, mb: 4 }}>
                    <Box sx={{
                        width: 40, height: 40, borderRadius: '11px',
                        background: `linear-gradient(135deg, ${AL}, ${AD})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 16px ${AG}`,
                    }}>
                        <Globe size={20} color="#0a0f1e" strokeWidth={2.3} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, color: BRAND.textPrimary, fontFamily: '"Outfit",sans-serif', fontSize: '1rem', lineHeight: 1.1 }}>
                            Plan A
                        </Typography>
                        <Typography sx={{ fontSize: '0.58rem', fontWeight: 700, color: A, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                            Hosting
                        </Typography>
                    </Box>
                </Box>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] as any }}
                    style={{ width: '100%', maxWidth: 380 }}
                >
                    {/* Page heading */}
                    <Box sx={{ mb: 3.5 }}>
                        <Typography sx={{
                            fontWeight: 900, fontSize: '1.65rem', color: BRAND.textPrimary,
                            fontFamily: '"Outfit",sans-serif', letterSpacing: '-0.02em', mb: 0.5,
                        }}>
                            Create Account
                        </Typography>
                        <Typography sx={{ color: BRAND.textSecondary, fontSize: '0.9rem' }}>
                            Start your journey with Plan A Hosting
                        </Typography>
                    </Box>

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Full Name */}
                        <Box sx={{ mb: 2.25 }}>
                            <Label text="Full Name" />
                            <TextField
                                {...register('name', { required: 'Name is required' })}
                                error={!!errors.name}
                                helperText={errors.name?.message as string}
                                fullWidth
                                placeholder="John Doe"
                                inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <User size={17} color={BRAND.textMuted} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                            />
                        </Box>

                        {/* Email */}
                        <Box sx={{ mb: 2.25 }}>
                            <Label text="Email Address" />
                            <TextField
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email' },
                                })}
                                error={!!errors.email}
                                helperText={errors.email?.message as string}
                                fullWidth
                                placeholder="name@company.com"
                                inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Mail size={17} color={BRAND.textMuted} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                            />
                        </Box>

                        {/* Password */}
                        <Box sx={{ mb: 3.5 }}>
                            <Label text="Password" />
                            <TextField
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 8, message: 'Minimum 8 characters' },
                                })}
                                error={!!errors.password}
                                helperText={errors.password?.message as string}
                                fullWidth
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                inputProps={{ style: { paddingTop: 13, paddingBottom: 13 } }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock size={17} color={BRAND.textMuted} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end" size="small"
                                                sx={{ color: BRAND.textMuted, '&:hover': { color: A } }}
                                            >
                                                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={inputSx}
                            />
                        </Box>

                        <AmberBtn loading={isSubmitting} label="Create Free Account" />
                    </form>

                    {/* Sign-in link */}
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography sx={{ color: BRAND.textSecondary, fontSize: '0.875rem' }}>
                            Already have an account?{' '}
                            <Box
                                component="span"
                                onClick={() => navigate('/login')}
                                sx={{ color: A, fontWeight: 700, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
                            >
                                Sign In
                            </Box>
                        </Typography>
                    </Box>

                    {/* Terms note */}
                    <Typography sx={{ mt: 2.5, textAlign: 'center', color: BRAND.textMuted, fontSize: '0.73rem', lineHeight: 1.6 }}>
                        By creating an account, you agree to our{' '}
                        <Box component="span" sx={{ color: A, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>Terms of Service</Box>
                        {' '}and{' '}
                        <Box component="span" sx={{ color: A, cursor: 'pointer', '&:hover': { opacity: 0.8 } }}>Privacy Policy</Box>.
                    </Typography>
                </motion.div>

                {/* Footer copyright */}
                <Box sx={{ position: 'absolute', bottom: 20, textAlign: 'center' }}>
                    <Typography sx={{ color: BRAND.textMuted, fontSize: '0.73rem' }}>
                        &copy; {new Date().getFullYear()} Plan A Hosting. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default SignupPage;
