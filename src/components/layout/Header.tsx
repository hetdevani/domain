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
    ListItemIcon
} from '@mui/material';
import {
    LogOut,
    User,
    Settings,
    Bell,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useTheme, alpha } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';


interface HeaderProps {
    onMenuClick: () => void;
    sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, sidebarOpen }) => {
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const theme = useTheme();

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: '#0A3D62', // Deep Tech Blue
                color: '#ffffff',
                zIndex: theme.zIndex.drawer + 1,
                height: 72,
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
        >
            <Toolbar sx={{ px: { xs: 2, sm: 4 } }}>
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={onMenuClick}
                    sx={{
                        mr: 2,
                        width: 40,
                        height: 40,
                        backgroundColor: alpha('#ffffff', 0.1),
                        borderRadius: '10px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            backgroundColor: alpha('#ffffff', 0.2),
                            transform: 'scale(1.05)'
                        }
                    }}
                >
                    {sidebarOpen ? <ChevronLeft size={22} /> : <ChevronRight size={22} />}
                </IconButton>

                <Box sx={{
                    flexGrow: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    opacity: sidebarOpen ? 0 : 1,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    visibility: sidebarOpen ? 'hidden' : 'visible',
                    transform: sidebarOpen ? 'translateX(-20px)' : 'translateX(0)'
                }}>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>

                    <Box
                        sx={{
                            ml: 1,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            p: '4px 4px 4px 12px',
                            borderRadius: '12px',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha('#ffffff', 0.1),
                            }
                        }}
                        onClick={handleMenuOpen}
                    >
                        <Box sx={{ mr: 1.5, textAlign: 'right', display: { xs: 'none', lg: 'block' } }}>
                            <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 700, color: '#ffffff' }}>
                                {user?.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                                {user?.type === 1 ? 'Master Admin' : 'Administrator'}
                            </Typography>
                        </Box>
                        <Avatar
                            src={user?.image}
                            alt={user?.name}
                            sx={{
                                width: 40,
                                height: 40,
                                border: '2px solid',
                                borderColor: 'rgba(255,255,255,0.2)',
                                backgroundColor: alpha('#ffffff', 0.2),
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                color: '#ffffff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                        >
                            {user?.name?.charAt(0)}
                        </Avatar>
                    </Box>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            sx: {
                                mt: 1.5,
                                width: 220,
                                borderRadius: 3,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                                border: '1px solid rgba(0,0,0,0.05)'
                            }
                        }}
                    >
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon><User size={18} /></ListItemIcon>
                            My Profile
                        </MenuItem>
                        <MenuItem onClick={handleMenuClose}>
                            <ListItemIcon><Settings size={18} /></ListItemIcon>
                            Settings
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                            <ListItemIcon><LogOut size={18} color="#ef4444" /></ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                    <Divider />
                    <Tooltip title="Notifications">
                        <IconButton
                            sx={{
                                color: '#ffffff',
                                backgroundColor: alpha('#ffffff', 0.05),
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: alpha('#ffffff', 0.15),
                                    transform: 'translateY(-2px)'
                                }
                            }}
                        >
                            <Bell size={20} />
                        </IconButton>
                    </Tooltip>

                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
