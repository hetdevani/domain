import React, { useState } from 'react';
import {
    AppBar, Toolbar, Box, Button, Menu, MenuItem,
    Typography, Divider
} from '@mui/material';
import {
    User, ChevronDown, Globe, MapPin, Search, Shield,
    FileText, Code2, FileSearch, Zap, Type, AlignLeft,
    ArrowRightLeft, Server, Wifi
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const TOOL_LINKS = [
    { label: 'DNS Propagation Checker', path: '/tools/dns-propagation', icon: <Globe size={15} />, color: '#2ECC71', desc: 'Check DNS propagation globally' },
    { label: 'IP Intelligence', path: '/tools/ip-intelligence', icon: <MapPin size={15} />, color: '#3498DB', desc: 'Geo-locate any IP address' },
    { label: 'DNS Lookup', path: '/tools/dns-lookup', icon: <Search size={15} />, color: '#9B59B6', desc: 'Query all DNS record types' },
    { label: 'What Is My IP', path: '/tools/what-is-my-ip', icon: <Wifi size={15} />, color: '#1ABC9C', desc: 'Detect your public IP' },
    { label: 'Meta Tag Analyzer', path: '/tools/meta-tag-analyzer', icon: <FileSearch size={15} />, color: '#F39C12', desc: 'Analyze page meta tags' },
    { label: 'HTTP Header Checker', path: '/tools/http-header-checker', icon: <Server size={15} />, color: '#E74C3C', desc: 'Inspect HTTP response headers' },
    { label: 'Robots.txt Checker', path: '/tools/robots-txt-checker', icon: <Shield size={15} />, color: '#E67E22', desc: 'Validate robots.txt rules' },
    { label: 'Sitemap Checker', path: '/tools/sitemap-checker', icon: <FileText size={15} />, color: '#8E44AD', desc: 'Validate XML sitemaps' },
    { label: 'Page Speed Metrics', path: '/tools/page-speed', icon: <Zap size={15} />, color: '#F39C12', desc: 'Measure page performance' },
    { label: 'Word Counter', path: '/tools/word-counter', icon: <Type size={15} />, color: '#2ECC71', desc: 'Count words, chars & more' },
    { label: 'Lorem Ipsum Generator', path: '/tools/lorem-ipsum', icon: <AlignLeft size={15} />, color: '#3498DB', desc: 'Generate placeholder text' },
    { label: 'HTACCESS Redirect Generator', path: '/tools/htaccess-redirect', icon: <ArrowRightLeft size={15} />, color: '#E74C3C', desc: 'Build redirect rules' },
];

const LandingNavbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [toolsAnchor, setToolsAnchor] = useState<null | HTMLElement>(null);

    const isToolsActive = location.pathname.startsWith('/tools');

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                bgcolor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
                zIndex: 10,
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', py: 1, minHeight: '64px !important' }}>
                {/* Logo */}
                <Box
                    sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}
                    onClick={() => navigate('/')}
                >
                    <img src="/logo-white.png" alt="Logo" style={{ height: 38 }} />
                </Box>

                {/* Center Nav */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 0.5 }}>
                    {/* Tools Dropdown */}
                    <Button
                        onClick={(e) => setToolsAnchor(e.currentTarget)}
                        endIcon={
                            <ChevronDown
                                size={15}
                                style={{
                                    transition: 'transform 0.2s',
                                    transform: toolsAnchor ? 'rotate(180deg)' : 'rotate(0deg)',
                                }}
                            />
                        }
                        sx={{
                            color: isToolsActive ? '#2ECC71' : 'rgba(255,255,255,0.85)',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            px: 2,
                            borderRadius: '8px',
                            borderBottom: isToolsActive ? '2px solid #2ECC71' : '2px solid transparent',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.06)',
                                color: '#fff',
                            },
                        }}
                    >
                        Tools
                    </Button>

                    <Menu
                        anchorEl={toolsAnchor}
                        open={Boolean(toolsAnchor)}
                        onClose={() => setToolsAnchor(null)}
                        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                bgcolor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '14px',
                                boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                minWidth: 280,
                                py: 1,
                                overflow: 'hidden',
                            },
                        }}
                    >
                        <Typography
                            sx={{
                                px: 2, py: 1,
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '0.7rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontWeight: 700,
                            }}
                        >
                            Developer & SEO Tools
                        </Typography>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 0.5 }} />
                        {TOOL_LINKS.map((tool) => (
                            <MenuItem
                                key={tool.path}
                                onClick={() => { setToolsAnchor(null); navigate(tool.path); }}
                                selected={location.pathname === tool.path}
                                sx={{
                                    py: 1.2,
                                    px: 2,
                                    mx: 0.5,
                                    borderRadius: '8px',
                                    gap: 1.5,
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' },
                                    '&.Mui-selected': { bgcolor: `rgba(46,204,113,0.08)` },
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 0.7,
                                        bgcolor: `${tool.color}18`,
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        color: tool.color,
                                        flexShrink: 0,
                                    }}
                                >
                                    {tool.icon}
                                </Box>
                                <Box>
                                    <Typography sx={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.2 }}>
                                        {tool.label}
                                    </Typography>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.72rem' }}>
                                        {tool.desc}
                                    </Typography>
                                </Box>
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>

                {/* Right Buttons */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    {isAuthenticated ? (
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/dashboard')}
                            startIcon={<User size={16} />}
                            sx={{
                                color: '#fff',
                                borderColor: 'rgba(255,255,255,0.25)',
                                px: 2.5,
                                borderRadius: '8px',
                                textTransform: 'none',
                                fontWeight: 600,
                                '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                            }}
                        >
                            Dashboard
                        </Button>
                    ) : (
                        <>
                            <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1.5 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/login')}
                                    sx={{
                                        color: '#fff',
                                        borderColor: 'rgba(255,255,255,0.25)',
                                        px: 2.5,
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                                    }}
                                >
                                    Log In
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/signup')}
                                    sx={{
                                        bgcolor: '#2ECC71',
                                        px: 2.5,
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        boxShadow: '0 4px 14px rgba(46,204,113,0.35)',
                                        '&:hover': { bgcolor: '#27ae60' },
                                    }}
                                >
                                    Register
                                </Button>
                            </Box>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/signup')}
                                sx={{
                                    display: { xs: 'block', sm: 'none' },
                                    bgcolor: '#2ECC71',
                                    px: 2,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    '&:hover': { bgcolor: '#27ae60' },
                                }}
                            >
                                Start
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default LandingNavbar;
