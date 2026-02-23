import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Divider,
    useMediaQuery,
    useTheme
} from '@mui/material';
import {
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Activity,
    AlertCircle,
    CreditCard,
    Database,
    type LucideProps,
    Shield
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MODULES } from '../../types';


interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

interface MenuItem {
    title: string;
    path: string;
    icon: React.ReactElement<LucideProps>;
    module?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
    const { user, hasPermission, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const drawerWidth = 280;
    const miniDrawerWidth = 80;
    const headerHeight = 72;

    const menuItems: MenuItem[] = [
        { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard />, module: MODULES.DASH_BOARD },
        { title: 'User', path: '/users', icon: <Shield />, module: MODULES.USER },
        { title: 'Customer', path: '/customers', icon: <Users />, module: MODULES.USER },
        { title: 'Monitors', path: '/monitors', icon: <Activity />, module: MODULES.MONITOR },
        { title: 'Incidents', path: '/incidents', icon: <AlertCircle />, module: MODULES.INCIDENT },
        { title: 'Plans', path: '/plans', icon: <CreditCard />, module: MODULES.PLAN },
        { title: 'Masters', path: '/masters', icon: <Database />, module: MODULES.MASTER },
        { title: 'Settings', path: '/settings', icon: <Settings />, module: MODULES.SETTING },
    ];

    const filteredItems = menuItems.filter(item => {
        // Hide permissions (User/Customer), Plans, and Masters for Customers (type === 3)
        if (user && user.type === 3) {
            if (['User', 'Customer', 'Plans', 'Masters'].includes(item.title)) {
                return false;
            }
        }
        return !item.module || hasPermission(item.module, 'list');
    });

    const drawerContent = (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#0A3D62', // Deep Tech Blue
            color: '#ffffff'
        }}>
            <Box sx={{
                px: open ? 2.5 : 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: open ? 'flex-start' : 'center',
                minHeight: headerHeight,
                transition: 'all 0.3s ease',
            }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        height: 48,
                        gap: open ? 1.5 : 0
                    }}
                    onClick={() => navigate('/dashboard')}
                >
                    <img
                        src={open ? "/logo-white.png" : "/icon.png"}
                        alt="Logo"
                        style={{
                            height: open ? 48 : 42,
                            width: 'auto',
                            objectFit: 'contain',
                            transition: 'all 0.3s ease'
                        }}
                    />
                </Box>
            </Box>

            <Divider sx={{ mx: 2, mb: 1, borderColor: 'rgba(255,255,255,0.1)' }} />

            <List sx={{
                px: open ? 2 : 1.5,
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                py: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                '&::-webkit-scrollbar': {
                    width: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                },
            }}>
                {filteredItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <ListItem key={item.path} disablePadding sx={{ display: 'block' }}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) onClose();
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    py: 1.25,
                                    px: open ? 2 : 0,
                                    justifyContent: open ? 'initial' : 'center',
                                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                                    color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                                    position: 'relative',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        color: '#ffffff',
                                        '& .MuiListItemIcon-root': {
                                            color: '#ffffff',
                                            transform: open ? 'translateX(4px)' : 'scale(1.1)',
                                        }
                                    },
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: open ? 2 : 0,
                                        justifyContent: 'center',
                                        color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                                        transition: 'all 0.3s ease',
                                    }}
                                >
                                    {React.cloneElement(item.icon as React.ReactElement<LucideProps>, {
                                        size: 22,
                                        strokeWidth: isActive ? 2.5 : 2
                                    })}
                                </ListItemIcon>
                                {open && (
                                    <ListItemText
                                        primary={item.title}
                                        primaryTypographyProps={{
                                            fontWeight: isActive ? 700 : 500,
                                            fontSize: '0.875rem',
                                            whiteSpace: 'nowrap',
                                            letterSpacing: '0.01em',
                                            color: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                                        }}
                                    />
                                )}
                                {!open && isActive && (
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            left: 0,
                                            width: 4,
                                            height: 20,
                                            backgroundColor: '#2ECC71', // Uptime Green
                                            borderRadius: '0 4px 4px 0'
                                        }}
                                    />
                                )}
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

            <Box sx={{ p: 1.5, mt: 'auto' }}>
                <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.1)' }} />
                <ListItemButton
                    onClick={() => logout()}
                    sx={{
                        borderRadius: '10px',
                        py: 1.5,
                        px: open ? 2 : 1.5,
                        justifyContent: open ? 'initial' : 'center',
                        color: '#ffffff',
                        '&:hover': {
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: '#ff4d4d',
                            '& .MuiListItemIcon-root': {
                                color: '#ff4d4d',
                            }
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 2 : 0,
                            justifyContent: 'center',
                            color: 'inherit',
                            transition: 'all 0.3s ease',
                        }}
                    >
                        <LogOut size={22} />
                    </ListItemIcon>
                    {open && (
                        <ListItemText
                            primary="Sign Out"
                            primaryTypographyProps={{
                                fontWeight: 700,
                                fontSize: '0.9rem',
                                letterSpacing: '0.02em',
                                color: '#ffffff' // Explicitly set to white
                            }}
                        />
                    )}
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Drawer
            variant={isMobile ? 'temporary' : 'permanent'}
            anchor="left"
            open={isMobile ? open : true}
            onClose={onClose}
            sx={{
                width: open ? drawerWidth : miniDrawerWidth,
                flexShrink: 0,
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
                zIndex: theme.zIndex.drawer + 2,
                '& .MuiDrawer-paper': {
                    width: open ? drawerWidth : miniDrawerWidth,
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: open ? theme.transitions.duration.enteringScreen : theme.transitions.duration.leavingScreen,
                    }),
                    overflowX: 'hidden',
                    borderRight: '1px solid rgba(255,255,255,0.05)',
                    backgroundColor: '#0A3D62',
                    boxShadow: 'none',
                    zIndex: theme.zIndex.drawer + 2,
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default Sidebar;
