import React, { useState, useEffect, Suspense } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';
import PageLoader from '../common/PageLoader';

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


    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                background: '#f7f7f7',
                backgroundImage:
                    'radial-gradient(rgba(10,61,98,0.045) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
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
