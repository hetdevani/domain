import React, { useState, useEffect, Suspense } from 'react';
import { Box, useTheme, useMediaQuery, Button, Typography, alpha } from '@mui/material';
import { ShieldAlert, LogOut } from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import PageLoader from '../common/PageLoader';
import { useAuth } from '../../contexts/AuthContext';


const Layout: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const saved = localStorage.getItem('sidebarOpen');
        return saved !== null ? JSON.parse(saved) : true;
    });

    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    }, [isMobile]);

    useEffect(() => {
        if (!isMobile) {
            localStorage.setItem('sidebarOpen', JSON.stringify(sidebarOpen));
        }
    }, [sidebarOpen, isMobile]);


    const { isImpersonated, user, stopImpersonating } = useAuth();

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };


    return (
        <Box
            sx={{
                display:    'flex',
                minHeight:  '100vh',
                background: '#f4f6fc',
            }}
        >
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: sidebarOpen
                            ? theme.transitions.duration.enteringScreen
                            : theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                {isImpersonated && (
                    <Box
                        sx={{
                            width: '100%',
                            bgcolor: '#f97316',
                            color: 'white',
                            py: 0.75,
                            px: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2,
                            position: 'sticky',
                            top: 0,
                            zIndex: 2000,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                    >
                        <ShieldAlert size={18} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            You are currently impersonating <strong>{user?.name || 'Customer'}</strong>
                        </Typography>
                        <Button
                            size="small"
                            variant="contained"
                            color="inherit"
                            onClick={stopImpersonating}
                            startIcon={<LogOut size={14} />}
                            sx={{
                                py: 0.25,
                                px: 1.5,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: '#f97316',
                                bgcolor: 'white',
                                '&:hover': {
                                    bgcolor: alpha('#fff', 0.9),
                                }
                            }}
                        >
                            Stop Impersonation
                        </Button>
                    </Box>
                )}
                <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />


                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, md: 4 },
                        maxWidth: '1600px',
                        mx: 'auto',
                        width: '100%',
                        overflowX: 'hidden'
                    }}
                >
                    <Suspense fallback={<PageLoader />}>
                        <Outlet />
                    </Suspense>
                </Box>
            </Box>
        </Box>
    );
};

export default Layout;
