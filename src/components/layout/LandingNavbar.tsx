import React, { useState, useEffect } from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Button,
    Typography,
    Drawer,
    IconButton,
    Container,
    Divider,
    Stack,
} from '@mui/material';
import {
    User,
    Globe,
    Menu as MenuIcon,
    X,
    Server,
    Shield,
    Search,
    HelpCircle,
    Tag,
    ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const HEADER_Z = 1300;
export const LANDING_HEADER_OFFSET_PX = { xs: 64, md: 72 };

/* ── shared nav constants ── */
const NAV_BG_TOP      = 'rgba(4, 6, 20, 0.72)';   // always visible, not fully transparent
const NAV_BG_SCROLLED = 'rgba(4, 6, 20, 0.96)';
const AMBER      = '#f59e0b';
const AMBER_DARK = '#d97706';
const AMBER_GLOW = 'rgba(245,158,11,0.25)';

const navLinks = [
    { label: 'Domains', sectionId: 'tlds', icon: Tag },
    { label: 'Hosting', sectionId: 'hosting', icon: Server },
    { label: 'Features', sectionId: 'features', icon: Shield },
    { label: 'FAQ', sectionId: 'faq', icon: HelpCircle },
];

const LandingNavbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeLink, setActiveLink] = useState<string | null>(null);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const goToSection = (id: string) => {
        setMobileOpen(false);
        setActiveLink(id);
        if (location.pathname !== '/') {
            navigate('/');
            window.setTimeout(() => scrollToSection(id), 80);
        } else {
            scrollToSection(id);
        }
    };

    return (
        <>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    top: 0, left: 0, right: 0, width: '100%',
                    zIndex: HEADER_Z,
                    background: scrolled ? NAV_BG_SCROLLED : NAV_BG_TOP,
                    backdropFilter: 'blur(20px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
                    borderBottom: scrolled
                        ? '1px solid rgba(148,163,184,0.12)'
                        : '1px solid rgba(148,163,184,0.07)',
                    transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                    boxShadow: scrolled
                        ? `0 4px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.06) inset`
                        : 'none',
                    /* subtle top amber line when scrolled */
                    '&::before': scrolled ? {
                        content: '""',
                        position: 'absolute',
                        top: 0, left: 0, right: 0, height: '1px',
                        background: `linear-gradient(90deg, transparent 0%, ${AMBER}60 30%, ${AMBER}80 50%, ${AMBER}60 70%, transparent 100%)`,
                    } : {},
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 72 } }}>

                        {/* ── Logo ── */}
                        <motion.div
                            whileHover={{ scale: 1.04 }}
                            whileTap={{ scale: 0.97 }}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/')}
                        >
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Box
                                    sx={{
                                        width: 42, height: 42, borderRadius: '12px',
                                        background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: `0 4px 20px ${AMBER_GLOW}, 0 0 0 1px ${AMBER}30 inset`,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        '&::after': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 0, left: '-100%',
                                            width: '60%', height: '100%',
                                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                                            animation: 'shimmer 3s infinite',
                                        },
                                        '@keyframes shimmer': {
                                            '0%': { left: '-100%' },
                                            '100%': { left: '200%' },
                                        },
                                    }}
                                >
                                    <Globe color="#fff" size={21} strokeWidth={2.3} />
                                </Box>
                                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 800, fontSize: '1.05rem',
                                            letterSpacing: '-0.03em', color: '#f8fafc',
                                            lineHeight: 1.1,
                                            fontFamily: '"Outfit","DM Sans",sans-serif',
                                        }}
                                    >
                                        Plan A
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: '0.62rem', fontWeight: 700,
                                            letterSpacing: '0.15em', color: AMBER,
                                            textTransform: 'uppercase', lineHeight: 1,
                                        }}
                                    >
                                        Hosting
                                    </Typography>
                                </Box>
                            </Stack>
                        </motion.div>

                        {/* ── Desktop nav links ── */}
                        <Box
                            sx={{
                                display: { xs: 'none', md: 'flex' },
                                alignItems: 'center', gap: 0.5,
                            }}
                        >
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                const isActive = activeLink === link.sectionId;
                                return (
                                    <motion.div key={link.label} whileHover={{ y: -1 }} whileTap={{ scale: 0.96 }}>
                                        <Button
                                            onClick={() => goToSection(link.sectionId)}
                                            startIcon={<Icon size={15} strokeWidth={2.2} />}
                                            sx={{
                                                color: isActive ? AMBER : 'rgba(226,232,240,0.88)',
                                                textTransform: 'none', fontWeight: 600,
                                                fontSize: '0.875rem', px: 2, py: 1,
                                                borderRadius: '10px', minWidth: 'auto',
                                                position: 'relative',
                                                transition: 'all 0.18s',
                                                '&:hover': {
                                                    color: '#fff',
                                                    bgcolor: 'rgba(255,255,255,0.07)',
                                                },
                                                ...(isActive && {
                                                    bgcolor: `${AMBER}15`,
                                                    '&::after': {
                                                        content: '""',
                                                        position: 'absolute',
                                                        bottom: 6, left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: 16, height: 2,
                                                        borderRadius: 4,
                                                        bgcolor: AMBER,
                                                    },
                                                }),
                                            }}
                                        >
                                            {link.label}
                                        </Button>
                                    </motion.div>
                                );
                            })}
                        </Box>

                        {/* ── Right CTA ── */}
                        <Stack direction="row" alignItems="center" spacing={1}>
                            {/* Desktop-only search */}
                            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
                                <IconButton
                                    onClick={() => goToSection('search')}
                                    sx={{
                                        display: { xs: 'none', md: 'flex' },
                                        color: 'rgba(148,163,184,0.7)',
                                        width: 38, height: 38,
                                        border: '1px solid rgba(148,163,184,0.16)',
                                        borderRadius: '10px',
                                        transition: 'all 0.18s',
                                        '&:hover': {
                                            color: AMBER,
                                            borderColor: `${AMBER}50`,
                                            bgcolor: `${AMBER}10`,
                                        },
                                    }}
                                >
                                    <Search size={17} />
                                </IconButton>
                            </motion.div>

                            {/* Auth buttons */}
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, alignItems: 'center' }}>
                                {isAuthenticated ? (
                                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        <Button
                                            variant="contained"
                                            onClick={() => navigate(user?.type === 3 ? '/status-pages' : '/dashboard')}
                                            startIcon={<User size={16} />}
                                            sx={{
                                                background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
                                                color: '#0a0f1e', borderRadius: '10px',
                                                px: 2.5, fontWeight: 700, fontSize: '0.875rem',
                                                textTransform: 'none',
                                                boxShadow: `0 4px 18px ${AMBER_GLOW}`,
                                                border: 'none',
                                                transition: 'filter 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
                                                    filter: 'brightness(1.13)',
                                                    boxShadow: `0 6px 24px rgba(245,158,11,0.45)`,
                                                },
                                            }}
                                        >
                                            Dashboard
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <>
                                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                            <Button
                                                onClick={() => navigate('/login')}
                                                sx={{
                                                    color: 'rgba(226,232,240,0.85)',
                                                    fontWeight: 600, textTransform: 'none',
                                                    fontSize: '0.875rem', borderRadius: '10px', px: 2,
                                                    '&:hover': {
                                                        color: '#fff',
                                                        bgcolor: 'rgba(255,255,255,0.07)',
                                                    },
                                                }}
                                            >
                                                Log in
                                            </Button>
                                        </motion.div>
                                        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                                            <Button
                                                variant="contained"
                                                onClick={() => navigate('/signup')}
                                                sx={{
                                                    background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
                                                    color: '#0a0f1e', borderRadius: '10px',
                                                    px: 2.75, fontWeight: 800,
                                                    textTransform: 'none', fontSize: '0.875rem',
                                                    boxShadow: `0 4px 18px ${AMBER_GLOW}`,
                                                    transition: 'filter 0.2s, box-shadow 0.2s',
                                                    '&:hover': {
                                                        background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
                                                        filter: 'brightness(1.13)',
                                                        boxShadow: `0 6px 24px rgba(245,158,11,0.45)`,
                                                    },
                                                }}
                                            >
                                                Get Started
                                            </Button>
                                        </motion.div>
                                    </>
                                )}
                            </Box>

                            {/* Hamburger */}
                            <motion.div whileTap={{ scale: 0.92 }}>
                                <IconButton
                                    onClick={() => setMobileOpen(true)}
                                    sx={{
                                        display: { xs: 'flex', md: 'none' },
                                        color: '#f8fafc',
                                        border: '1px solid rgba(148,163,184,0.2)',
                                        borderRadius: '10px', width: 40, height: 40,
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', borderColor: `${AMBER}40` },
                                    }}
                                >
                                    <MenuIcon size={20} />
                                </IconButton>
                            </motion.div>
                        </Stack>
                    </Toolbar>
                </Container>
            </AppBar>

            {/* ── Mobile Drawer ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <Drawer
                        anchor="right"
                        open={mobileOpen}
                        onClose={() => setMobileOpen(false)}
                        PaperProps={{
                            sx: {
                                width: 'min(100%, 300px)',
                                background: 'linear-gradient(160deg, #04060f 0%, #080e22 100%)',
                                borderLeft: '1px solid rgba(148,163,184,0.1)',
                                p: 0,
                            },
                        }}
                    >
                        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            {/* Drawer header */}
                            <Box
                                sx={{
                                    p: 2.5, pb: 2,
                                    borderBottom: '1px solid rgba(148,163,184,0.1)',
                                    background: 'rgba(245,158,11,0.04)',
                                }}
                            >
                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" spacing={1.25} alignItems="center">
                                        <Box
                                            sx={{
                                                width: 36, height: 36, borderRadius: '10px',
                                                background: `linear-gradient(135deg, ${AMBER}, ${AMBER_DARK})`,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: `0 4px 16px ${AMBER_GLOW}`,
                                            }}
                                        >
                                            <Globe color="#fff" size={18} strokeWidth={2.3} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontWeight: 800, color: '#f8fafc', fontFamily: '"Outfit",sans-serif', fontSize: '1rem', lineHeight: 1.1 }}>
                                                Plan A
                                            </Typography>
                                            <Typography sx={{ fontSize: '0.6rem', fontWeight: 700, color: AMBER, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                                                Hosting
                                            </Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton
                                        onClick={() => setMobileOpen(false)}
                                        sx={{ color: '#94a3b8', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.15)', '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' } }}
                                    >
                                        <X size={18} />
                                    </IconButton>
                                </Stack>
                            </Box>

                            {/* Nav links */}
                            <Box sx={{ p: 2, flex: 1 }}>
                                <Stack spacing={0.5}>
                                    {navLinks.map((link, i) => {
                                        const Icon = link.icon;
                                        return (
                                            <motion.div
                                                key={link.label}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.06, duration: 0.3 }}
                                            >
                                                <Button
                                                    fullWidth
                                                    onClick={() => goToSection(link.sectionId)}
                                                    startIcon={<Icon size={18} />}
                                                    endIcon={<ChevronRight size={15} />}
                                                    sx={{
                                                        justifyContent: 'flex-start', color: '#e2e8f0',
                                                        textTransform: 'none', fontWeight: 600,
                                                        py: 1.4, px: 2, borderRadius: '10px',
                                                        '& .MuiButton-endIcon': { ml: 'auto' },
                                                        '&:hover': {
                                                            bgcolor: `${AMBER}12`,
                                                            color: AMBER,
                                                            '& svg': { color: AMBER },
                                                        },
                                                    }}
                                                >
                                                    {link.label}
                                                </Button>
                                            </motion.div>
                                        );
                                    })}
                                </Stack>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(148,163,184,0.1)', mx: 2 }} />

                            {/* Bottom CTA */}
                            <Box sx={{ p: 2.5 }}>
                                <Stack spacing={1.25}>
                                    <Button
                                        fullWidth
                                        onClick={() => { setMobileOpen(false); goToSection('search'); }}
                                        sx={{
                                            background: `linear-gradient(135deg, ${AMBER} 0%, ${AMBER_DARK} 100%)`,
                                            color: '#0a0f1e', borderRadius: '10px', py: 1.3,
                                            fontWeight: 800, textTransform: 'none',
                                            boxShadow: `0 4px 20px ${AMBER_GLOW}`,
                                            '&:hover': { filter: 'brightness(1.08)' },
                                        }}
                                    >
                                        Search Domains
                                    </Button>
                                    {!isAuthenticated && (
                                        <Button
                                            fullWidth
                                            onClick={() => { setMobileOpen(false); navigate('/login'); }}
                                            sx={{
                                                border: '1px solid rgba(148,163,184,0.22)',
                                                color: '#e2e8f0', borderRadius: '10px', py: 1.3,
                                                fontWeight: 700, textTransform: 'none',
                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.06)', borderColor: `${AMBER}40` },
                                            }}
                                        >
                                            Log in
                                        </Button>
                                    )}
                                </Stack>
                            </Box>
                        </Box>
                    </Drawer>
                )}
            </AnimatePresence>

            {/* Spacer */}
            <Box
                aria-hidden
                sx={{ height: { xs: `${LANDING_HEADER_OFFSET_PX.xs}px`, md: `${LANDING_HEADER_OFFSET_PX.md}px` }, flexShrink: 0 }}
            />
        </>
    );
};

export default LandingNavbar;
