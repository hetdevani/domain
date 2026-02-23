import React from 'react';
import { Box, CircularProgress, Backdrop, LinearProgress, Typography, alpha } from '@mui/material';

// 1. Small Loader (for inline use)
export const SmallLoader: React.FC<{ size?: number; color?: string }> = ({ size = 20, color }) => (
    <CircularProgress size={size} sx={{ color: color || 'primary.main' }} />
);

// 2. Button Loader (to be used inside buttons)
export const ButtonLoader: React.FC = () => (
    <CircularProgress size={20} color="inherit" />
);

// 3. Page Loader (Full screen centered for content loading)
export const PageLoader: React.FC = () => (
    <Box
        sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh',
            width: '100%',
            gap: 2
        }}
    >
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
            <CircularProgress
                variant="determinate"
                value={100}
                size={60}
                thickness={4}
                sx={{
                    color: (theme) => alpha(theme.palette.primary.main, 0.1),
                    position: 'absolute',
                    left: 0,
                }}
            />
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: 1 }}>
            LOADING DATA...
        </Typography>
    </Box>
);

// 4. Global Backdrop Loader
export const GlobalLoader: React.FC<{ open: boolean }> = ({ open }) => (
    <Backdrop
        sx={{
            color: '#fff',
            zIndex: (theme) => theme.zIndex.drawer + 999,
            backdropFilter: 'blur(4px)',
            backgroundColor: 'rgba(15, 23, 42, 0.5)'
        }}
        open={open}
    >
        <Box sx={{ textAlign: 'center' }}>
            <CircularProgress color="primary" size={50} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                Please wait...
            </Typography>
        </Box>
    </Backdrop>
);

// 5. Top Linear Progress (Global loading bar)
export const TopProgress: React.FC<{ loading: boolean }> = ({ loading }) => (
    <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999 }}>
        {loading && <LinearProgress color="primary" sx={{ height: 3 }} />}
    </Box>
);
