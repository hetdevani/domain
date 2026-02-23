import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const PageLoader: React.FC = () => {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                zIndex: 9999,
            }}
        >
            <LinearProgress
                sx={{
                    height: 3,
                    backgroundColor: 'rgba(10, 61, 98, 0.1)',
                    '& .MuiLinearProgress-bar': {
                        backgroundColor: '#0A3D62'
                    }
                }}
            />
            <Box
                sx={{
                    height: 'calc(100vh - 72px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'background.default',
                }}
            >
                <img
                    src="/logo.png"
                    alt="Loading..."
                    style={{
                        height: 50,
                        marginBottom: 20,
                        animation: 'pulse 1.5s infinite ease-in-out'
                    }}
                />
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500, letterSpacing: '0.05em' }}
                >
                    LOADING...
                </Typography>
                <style>
                    {`
                        @keyframes pulse {
                            0% { transform: scale(0.95); opacity: 0.7; }
                            50% { transform: scale(1.05); opacity: 1; }
                            100% { transform: scale(0.95); opacity: 0.7; }
                        }
                    `}
                </style>
            </Box>
        </Box>
    );
};

export default PageLoader;
