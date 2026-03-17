import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
} from '@mui/material';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Zap, Globe, User } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { ButtonLoader } from '../../components/common/Loaders';
import { motion } from 'framer-motion';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const SignupPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            await api.post('/web/auth/signup', data); // Assuming signup route exists, if not this is mock
            toast.success('Signup successful! Please login.');
            navigate('/login');
        } catch (err: any) {
            toast.error(err.response?.data?.message || err.message || 'Signup failed.');
        }
    };

    const features = [
        { icon: <ShieldCheck size={20} />, text: 'Secure Data Encryption' },
        { icon: <Zap size={20} />, text: 'High-Performance Management' },
        { icon: <Globe size={20} />, text: 'Global Access Anywhere' }
    ];

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
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(46, 204, 113, 0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
                <motion.div animate={{ scale: [1, 1.3, 1], rotate: [0, -90, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(235, 245, 255, 0.1) 0%, transparent 70%)', filter: 'blur(80px)' }} />

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 800 }}>
                    <Box component="img" src="/logo-white.png" alt="LeasePacket Logo" sx={{ width: 280, mb: 4, filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.2))' }} />
                    <Typography variant="h2" sx={{color: '#ffffff', fontWeight: 800, mb: 2, fontSize: '3.5rem', lineHeight: 1.1 }}>Join The Network <Box component="span" sx={{ color: '#2ECC71' }}>Revolution</Box></Typography>
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.7)', mb: 6, fontWeight: 400, maxWidth: 450, mx: 'auto' }}>Create your account to start managing your lease packets securely.</Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4 }}>
                        {features.map((feature, idx) => (
                            <motion.div key={idx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + (idx * 0.1) }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8 }}><Box sx={{ color: '#2ECC71' }}>{feature.icon}</Box><Typography variant="caption" sx={{color: '#ffffff', fontWeight: 600, letterSpacing: 0.5 }}>{feature.text.toUpperCase()}</Typography></Box>
                            </motion.div>
                        ))}
                    </Box>
                </motion.div>

                <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.05, backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />
            </Box>

            {/* Right Side - Signup Form (30%) */}
            <Box sx={{ flex: { xs: 1, md: 0.3 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: { xs: 4, md: 6 }, position: 'relative', boxShadow: '-10px 0 30px rgba(0,0,0,0.05)', zIndex: 2, bgcolor: '#fff' }}>
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ width: '100%', maxWidth: 360 }}>
                    
                     {/* Mobile Logo */}
                    <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 4 }}>
                        <img src="/logo-dark.png" alt="LeasePacket Logo" style={{ width: 180 }} />
                    </Box>
                    
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0A3D62', mb: 1 }}>Create Account</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>Sign up to start monitoring.</Typography>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Full Name</Typography>
                            <TextField {...register('name', { required: 'Name is required' })} error={!!errors.name} helperText={errors.name?.message as string} fullWidth placeholder="John Doe" inputProps={{ style: { paddingTop: 14, paddingBottom: 14 } }} InputProps={{ startAdornment: (<InputAdornment position="start"><User size={18} color="#94a3b8" /></InputAdornment>), }} />
                        </Box>

                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, color: '#475569' }}>Email Address</Typography>
                            <TextField {...register('email', { required: 'Email is required' })} error={!!errors.email} helperText={errors.email?.message as string} fullWidth placeholder="name@company.com" inputProps={{ style: { paddingTop: 14, paddingBottom: 14 } }} InputProps={{ startAdornment: (<InputAdornment position="start"><Mail size={18} color="#94a3b8" /></InputAdornment>), }} />
                        </Box>

                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#475569', mb: 1 }}>Password</Typography>
                            <TextField {...register('password', { required: 'Password is required' })} error={!!errors.password} helperText={errors.password?.message as string} fullWidth type={showPassword ? 'text' : 'password'} placeholder="••••••••" inputProps={{ style: { paddingTop: 14, paddingBottom: 14 } }} InputProps={{ startAdornment: (<InputAdornment position="start"><Lock size={18} color="#94a3b8" /></InputAdornment>), endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</IconButton></InputAdornment>), }} />
                        </Box>

                        <Button fullWidth variant="contained" size="large" type="submit" disabled={isSubmitting} sx={{ py: 1.8, fontSize: '1rem', fontWeight: 700, borderRadius: '12px', backgroundColor: '#2ECC71', boxShadow: '0 4px 14px 0 rgba(46, 204, 113, 0.39)', '&:hover': { backgroundColor: '#27ae60' }, }}>
                            {isSubmitting ? <ButtonLoader /> : 'Sign Up'}
                        </Button>
                    </form>

                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>Already have an account? {' '}<Typography component="span" variant="body2" sx={{ color: '#0A3D62', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }} onClick={() => navigate('/login')}>Sign In</Typography></Typography>
                    </Box>
                </motion.div>
            </Box>
        </Box>
    );
};

export default SignupPage;
