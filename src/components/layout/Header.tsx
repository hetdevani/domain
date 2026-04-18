import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Avatar,
    Menu,
    MenuItem,
    Box,
    Tooltip,
    Divider,
    ListItemIcon,
    Badge,
} from '@mui/material';
import {
    LogOut,
    User,
    Settings,
    Bell,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import { BRAND } from '../../theme';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
    '/dashboard':    { title: 'Dashboard',       subtitle: 'Operations overview'        },
    '/monitors':     { title: 'Monitors',         subtitle: 'Track uptime & performance' },
    '/incidents':    { title: 'Incidents',         subtitle: 'Active & resolved events'  },
    '/status-pages': { title: 'Status Pages',      subtitle: 'Public status portals'     },
    '/users':        { title: 'User Management',   subtitle: 'Admin users'               },
    '/customers':    { title: 'Customers',          subtitle: 'Customer accounts'         },
    '/plans':        { title: 'Plans',              subtitle: 'Subscription plans'        },
    '/masters':      { title: 'Masters',            subtitle: 'Master configuration'      },
    '/settings':     { title: 'Settings',           subtitle: 'Account & security'        },
    '/reports':      { title: 'Reports',            subtitle: 'Analytics & reports'       },
};

interface HeaderProps {
    onMenuClick: () => void;
    sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const location = useLocation();
    const navigate  = useNavigate();

    const pageMeta =
        Object.entries(PAGE_META).find(([path]) => location.pathname.startsWith(path))?.[1] ||
        { title: 'Plan A', subtitle: '' };

    const handleMenuOpen  = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const handleLogout    = () => { handleMenuClose(); logout(); };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

    /* shared icon-button style */
    const iconBtnSx = {
        color:        BRAND.textSecondary,
        width:        36, height: 36,
        borderRadius: '9px',
        border:       `1px solid ${BRAND.borderLight}`,
        bgcolor:      '#ffffff',
        transition:   'all 0.15s ease',
        '&:hover': {
            color:       BRAND.amberDk,
            borderColor: BRAND.amberBorder,
            bgcolor:     BRAND.amberBg,
        },
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: '#ffffff',
                color:           BRAND.textPrimary,
                zIndex:          1200,
                height:          64,
                justifyContent:  'center',
                borderBottom:    `1px solid ${BRAND.borderLight}`,
                boxShadow:       '0 1px 4px rgba(0,0,0,0.06)',
            }}
        >
            <Toolbar sx={{ px: { xs: 2, sm: 3 }, gap: 2, minHeight: '64px !important' }}>

                {/* Sidebar toggle */}
                <IconButton onClick={onMenuClick} size="small" sx={iconBtnSx}>
                    {sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}
                </IconButton>

                {/* Page title */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontWeight:    800, fontSize: '1.0625rem',
                            color:         BRAND.textPrimary, lineHeight: 1.2,
                            letterSpacing: '-0.015em',
                            fontFamily:    '"Outfit","DM Sans",sans-serif',
                        }}
                    >
                        {pageMeta.title}
                    </Typography>
                    {pageMeta.subtitle && (
                        <Typography sx={{ fontSize: '0.72rem', color: BRAND.textMuted, fontWeight: 500, lineHeight: 1, mt: 0.2 }}>
                            {pageMeta.subtitle}
                        </Typography>
                    )}
                </Box>

                {/* Right actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>

                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton size="small" sx={iconBtnSx}>
                            <Badge badgeContent={0} color="error">
                                <Bell size={17} />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Separator */}
                    <Box sx={{ width: '1px', height: 24, bgcolor: BRAND.borderLight, mx: 0.5 }} />

                    {/* Profile pill */}
                    <Box
                        onClick={handleMenuOpen}
                        sx={{
                            display:      'flex', alignItems: 'center', gap: 1,
                            cursor:       'pointer', py: 0.75, px: 1.25,
                            borderRadius: '10px',
                            border:       `1px solid ${BRAND.borderLight}`,
                            bgcolor:      '#ffffff',
                            transition:   'all 0.15s ease',
                            '&:hover': {
                                bgcolor:     BRAND.amberBg,
                                borderColor: BRAND.amberBorder,
                            },
                        }}
                    >
                        <Avatar
                            src={user?.image}
                            sx={{
                                width:      27, height: 27,
                                fontSize:   '0.7rem', fontWeight: 800,
                                background: `linear-gradient(135deg, ${BRAND.amber}, ${BRAND.amberDk})`,
                                color:      '#0a0f1e',
                            }}
                        >
                            {initials}
                        </Avatar>
                        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: BRAND.textPrimary, lineHeight: 1, fontFamily: '"Outfit","DM Sans",sans-serif' }}>
                                {user?.name?.split(' ')[0]}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Dropdown */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            sx: {
                                mt: 1, width: 228,
                                borderRadius:    '14px',
                                backgroundColor: '#ffffff',
                                border:          `1px solid ${BRAND.borderLight}`,
                                boxShadow:       '0 10px 40px rgba(0,0,0,0.12)',
                                py: 0.75,
                            },
                        } as any}
                    >
                        {/* User info */}
                        <Box sx={{ px: 2, py: 1.25, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: BRAND.textPrimary, fontFamily: '"Outfit","DM Sans",sans-serif' }}>
                                {user?.name}
                            </Typography>
                            <Typography sx={{ fontSize: '0.75rem', color: BRAND.textMuted, mt: 0.125 }}>
                                {Number(user?.type) === 1 ? 'Master Admin' : Number(user?.type) === 2 ? 'Administrator' : 'Customer'}
                            </Typography>
                        </Box>

                        <Divider />

                        <MenuItem onClick={handleMenuClose} sx={{ borderRadius: '8px', mx: 0.75, py: 1 }}>
                            <ListItemIcon sx={{ color: BRAND.textSecondary }}><User size={16} /></ListItemIcon>
                            My Profile
                        </MenuItem>

                        <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }} sx={{ borderRadius: '8px', mx: 0.75, py: 1 }}>
                            <ListItemIcon sx={{ color: BRAND.textSecondary }}><Settings size={16} /></ListItemIcon>
                            Settings
                        </MenuItem>

                        <Divider sx={{ my: 0.5 }} />

                        <MenuItem
                            onClick={handleLogout}
                            sx={{
                                borderRadius: '8px', mx: 0.75, py: 1,
                                color:        BRAND.danger,
                                '&:hover':    { bgcolor: BRAND.dangerBg },
                                '& .MuiListItemIcon-root': { color: BRAND.danger },
                            }}
                        >
                            <ListItemIcon><LogOut size={16} /></ListItemIcon>
                            Sign Out
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
