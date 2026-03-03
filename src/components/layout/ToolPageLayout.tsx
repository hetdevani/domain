import React from 'react';
import { Box, Typography } from '@mui/material';
import LandingNavbar from './LandingNavbar';

interface ToolPageLayoutProps {
    children: React.ReactNode;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({ children }) => {
    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', color: '#1e293b', overflowX: 'hidden' }}>
            {/* Ambient BG */}
            <Box sx={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                opacity: 0.06,
                backgroundImage: 'radial-gradient(circle at 20% 20%, #2ECC71 0%, transparent 50%), radial-gradient(circle at 80% 80%, #3498DB 0%, transparent 50%)',
                zIndex: 0, pointerEvents: 'none',
            }} />
            <LandingNavbar />
            <Box sx={{ pt: '64px', position: 'relative', zIndex: 1 }}>
                {children}
            </Box>
            <Box sx={{ py: 6, px: 1, textAlign: 'center', borderTop: '1px solid #e2e8f0', position: 'relative', zIndex: 1 }}>
                <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                    © {new Date().getFullYear()} Lease Packet Tools.
                </Typography>
            </Box>
        </Box>
    );
};

export default ToolPageLayout;
