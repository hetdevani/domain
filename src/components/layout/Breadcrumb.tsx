import React from 'react';
import { Box, Typography } from '@mui/material';
import { ChevronRight, Home } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter(x => x);

    if (pathnames.length === 0) return null;

    return (
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <RouterLink
                to="/dashboard"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                        color: '#94a3b8',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        transition: 'color 0.15s ease',
                        '&:hover': { color: '#0A3D62' },
                    }}
                >
                    <Home size={13} />
                    <Typography sx={{ fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}>
                        Home
                    </Typography>
                </Box>
            </RouterLink>

            {pathnames.map((value, index) => {
                const last = index === pathnames.length - 1;
                const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                if (value === 'dashboard') return null;

                return (
                    <React.Fragment key={to}>
                        <ChevronRight size={13} color="#cbd5e1" />
                        {last ? (
                            <Typography
                                sx={{
                                    fontSize: '0.8125rem',
                                    fontWeight: 700,
                                    color: '#0f172a',
                                }}
                            >
                                {label}
                            </Typography>
                        ) : (
                            <RouterLink to={to} style={{ textDecoration: 'none' }}>
                                <Typography
                                    sx={{
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        color: '#94a3b8',
                                        transition: 'color 0.15s ease',
                                        '&:hover': { color: '#0A3D62' },
                                    }}
                                >
                                    {label}
                                </Typography>
                            </RouterLink>
                        )}
                    </React.Fragment>
                );
            })}
        </Box>
    );
};

export default Breadcrumb;
