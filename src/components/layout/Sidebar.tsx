import React from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    useMediaQuery,
    useTheme,
    Avatar,
    Typography,
    Tooltip,
    alpha,
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
    Globe,
    type LucideProps,
    Shield,
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

interface MenuGroup {
    label: string | null;
    items: MenuItem[];
}

const GREEN = '#2ECC71';
const SIDEBAR_BG = '#0a3d62';

const menuGroups: MenuGroup[] = [
    {
        label: null,
        items: [
            { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard />, module: MODULES.DASH_BOARD },
        ],
    },
    {
        label: 'Monitoring',
        items: [
            { title: 'Monitors', path: '/monitors', icon: <Activity />, module: MODULES.MONITOR },
            { title: 'Incidents', path: '/incidents', icon: <AlertCircle />, module: MODULES.INCIDENT },
            { title: 'Status Pages', path: '/status-pages', icon: <Globe />, module: MODULES.STATUS_PAGE },
        ],
    },
    {
        label: 'Management',
        items: [
            { title: 'User', path: '/users', icon: <Shield />, module: MODULES.USER },
            { title: 'Customer', path: '/customers', icon: <Users />, module: MODULES.USER },
            { title: 'Plans', path: '/plans', icon: <CreditCard />, module: MODULES.PLAN },
            { title: 'Masters', path: '/masters', icon: <Database />, module: MODULES.MASTER },
        ],
    },
    {
        label: 'Account',
        items: [
            { title: 'Settings', path: '/settings', icon: <Settings />, module: MODULES.SETTING },
        ],
    },
];

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
    const { user, hasPermission, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const drawerWidth = 256;
    const miniDrawerWidth = 72;
    const headerHeight = 64;

    const filteredGroups = menuGroups
        .map(group => ({
            ...group,
            items: group.items.filter(item => {
                if (user && user.type === 3) {
                    if (['User', 'Customer', 'Plans', 'Masters'].includes(item.title)) return false;
                }
                if (user && (user.type === 1 || user.type === 2 || user.type === 3)) {
                    if (item.title === 'Status Pages') return true;
                }
                return !item.module || hasPermission(item.module, 'list');
            }),
        }))
        .filter(group => group.items.length > 0);

    const NavItem: React.FC<{ item: MenuItem }> = ({ item }) => {
        const isActive = location.pathname.startsWith(item.path);

        const button = (
            <ListItemButton
                onClick={() => {
                    navigate(item.path);
                    if (isMobile) onClose();
                }}
                sx={{
                    borderRadius: '10px',
                    py: 1.1,
                    px: open ? 1.5 : 0,
                    justifyContent: open ? 'initial' : 'center',
                    position: 'relative',
                    backgroundColor: isActive ? 'rgba(46,204,113,0.09)' : 'transparent',
                    color: isActive ? '#ffffff' : 'rgba(229, 240, 255, 0.85)',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                        backgroundColor: isActive
                            ? 'rgba(46,204,113,0.12)'
                            : 'rgba(255,255,255,0.05)',
                        color: '#ffffff',
                        '& .nav-icon': { color: isActive ? GREEN : '#cbd5e1' },
                    },
                    '&::before': isActive
                        ? {
                              content: '""',
                              position: 'absolute',
                              left: -8,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              width: 3,
                              height: '55%',
                              bgcolor: GREEN,
                              borderRadius: '0 3px 3px 0',
                              boxShadow: `0 0 10px ${GREEN}88`,
                          }
                        : {},
                }}
            >
                <ListItemIcon
                    className="nav-icon"
                    sx={{
                        minWidth: 0,
                        mr: open ? 1.75 : 0,
                        justifyContent: 'center',
                        color: isActive ? GREEN : 'rgba(188, 206, 231, 0.9)',
                        transition: 'color 0.15s ease',
                    }}
                >
                    {React.cloneElement(item.icon as React.ReactElement<LucideProps>, {
                        size: 18,
                        strokeWidth: isActive ? 2.5 : 2,
                    })}
                </ListItemIcon>
                {open && (
                    <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                            fontWeight: isActive ? 700 : 500,
                            fontSize: '0.855rem',
                            letterSpacing: '0.01em',
                            color: isActive ? '#ffffff' : 'rgba(229, 240, 255, 0.85)',
                        }}
                    />
                )}
            </ListItemButton>
        );

        if (!open) {
            return (
                <ListItem disablePadding sx={{ display: 'block', px: 1, mb: 0.25 }}>
                    <Tooltip title={item.title} placement="right" arrow>
                        {button}
                    </Tooltip>
                </ListItem>
            );
        }
        return (
            <ListItem disablePadding sx={{ display: 'block', px: 1, mb: 0.25 }}>
                {button}
            </ListItem>
        );
    };

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                background: SIDEBAR_BG,
                color: '#ffffff',
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    px: open ? 2.5 : 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: open ? 'flex-start' : 'center',
                    minHeight: headerHeight,
                    flexShrink: 0,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    transition: 'all 0.3s ease',
                }}
            >
                <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                    onClick={() => navigate('/dashboard')}
                >
                    <img
                        src={open ? '/logo-white.png' : '/icon.png'}
                        alt="Logo"
                        style={{
                            height: open ? 42 : 34,
                            width: 'auto',
                            objectFit: 'contain',
                            transition: 'all 0.3s ease',
                        }}
                    />
                </Box>
            </Box>

            {/* Navigation groups */}
            <Box
                sx={{
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    py: 2,
                    '&::-webkit-scrollbar': { width: '3px' },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        borderRadius: '10px',
                    },
                }}
            >
                {filteredGroups.map((group, gi) => (
                    <Box key={gi} sx={{ mb: 0.5 }}>
                        {open && group.label && (
                            <Typography
                                sx={{
                                    px: 2.5,
                                    py: 0.75,
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    letterSpacing: '0.14em',
                                    textTransform: 'uppercase',
                                    color: 'rgba(255,255,255,0.45)',
                                    fontFamily: '"DM Sans", monospace',
                                    userSelect: 'none',
                                    mt: gi > 0 ? 1.5 : 0,
                                }}
                            >
                                {group.label}
                            </Typography>
                        )}
                        {!open && gi > 0 && (
                            <Box
                                sx={{
                                    width: 24,
                                    height: '1px',
                                    bgcolor: 'rgba(255,255,255,0.07)',
                                    mx: 'auto',
                                    my: 1.5,
                                }}
                            />
                        )}
                        <List disablePadding>
                            {group.items.map(item => (
                                <NavItem key={item.path} item={item} />
                            ))}
                        </List>
                    </Box>
                ))}
            </Box>

            {/* User + Logout */}
            <Box
                sx={{
                    flexShrink: 0,
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    p: 1.5,
                    pb: 2,
                }}
            >
                {open && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.25,
                            px: 1.25,
                            py: 1.25,
                            mb: 0.75,
                            borderRadius: '10px',
                            bgcolor: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.05)',
                        }}
                    >
                        <Avatar
                            src={user?.image}
                            sx={{
                                width: 32,
                                height: 32,
                                fontSize: '0.75rem',
                                fontWeight: 800,
                                bgcolor: alpha(GREEN, 0.18),
                                color: GREEN,
                                border: `1.5px solid ${alpha(GREEN, 0.3)}`,
                                flexShrink: 0,
                            }}
                        >
                            {user?.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography
                                sx={{
                                    fontWeight: 700,
                                    fontSize: '0.8125rem',
                                    color: '#e2e8f0',
                                    lineHeight: 1.25,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {user?.name}
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: '0.688rem',
                                    color: 'rgba(100,116,139,0.85)',
                                    fontWeight: 500,
                                }}
                            >
                                {user?.type === 1
                                    ? 'Master Admin'
                                    : user?.type === 2
                                    ? 'Admin'
                                    : 'Customer'}
                            </Typography>
                        </Box>
                    </Box>
                )}

                <Tooltip title={open ? '' : 'Sign Out'} placement="right">
                    <ListItemButton
                        onClick={() => logout()}
                        sx={{
                            borderRadius: '10px',
                            py: 1.1,
                            px: open ? 1.5 : 0,
                            justifyContent: open ? 'initial' : 'center',
                            color: 'rgba(100,116,139,0.75)',
                            transition: 'all 0.15s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(239,68,68,0.1)',
                                color: '#f87171',
                                '& .logout-icon': { color: '#f87171' },
                            },
                        }}
                    >
                        <ListItemIcon
                            className="logout-icon"
                            sx={{
                                minWidth: 0,
                                mr: open ? 1.75 : 0,
                                justifyContent: 'center',
                                color: 'inherit',
                                transition: 'color 0.15s ease',
                            }}
                        >
                            <LogOut size={18} />
                        </ListItemIcon>
                        {open && (
                            <ListItemText
                                primary="Sign Out"
                                primaryTypographyProps={{
                                    fontWeight: 600,
                                    fontSize: '0.855rem',
                                    color: 'inherit',
                                }}
                            />
                        )}
                    </ListItemButton>
                </Tooltip>
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
                        duration: open
                            ? theme.transitions.duration.enteringScreen
                            : theme.transitions.duration.leavingScreen,
                    }),
                    overflowX: 'hidden',
                    backgroundColor: SIDEBAR_BG,
                    border: 'none',
                    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

export default Sidebar;
