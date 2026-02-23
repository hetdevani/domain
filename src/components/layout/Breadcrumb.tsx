import React from 'react';
import { Breadcrumbs, Typography, Link, Box } from '@mui/material';
import { ChevronRight, Home } from 'lucide-react';
import { Link as RouterLink, useLocation } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    return (
        <Box sx={{ mb: 3 }}>
            <Breadcrumbs
                separator={<ChevronRight size={14} />}
                aria-label="breadcrumb"
            >
                <Link
                    component={RouterLink}
                    underline="hover"
                    color="inherit"
                    to="/dashboard"
                    sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.875rem' }}
                >
                    <Home size={16} />
                    Dashboard
                </Link>
                {pathnames.map((value, index) => {
                    const last = index === pathnames.length - 1;
                    const to = `/${pathnames.slice(0, index + 1).join('/')}`;
                    const label = value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');

                    return last || value === 'dashboard' ? (
                        <Typography
                            key={to}
                            color="text.primary"
                            sx={{ fontWeight: 600, fontSize: '0.875rem' }}
                        >
                            {label}
                        </Typography>
                    ) : (
                        <Link
                            key={to}
                            component={RouterLink}
                            underline="hover"
                            color="inherit"
                            to={to}
                            sx={{ fontSize: '0.875rem' }}
                        >
                            {label}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
};

export default Breadcrumb;
