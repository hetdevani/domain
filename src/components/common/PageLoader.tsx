import React from 'react';
import { Box, Typography } from '@mui/material';
import { BRAND } from '../../theme';

/**
 * Full-screen route-level loader shown while lazy chunks are loading.
 * Displayed as the <Suspense> fallback in Layout.tsx.
 */
const PageLoader: React.FC = () => (
    <Box
        sx={{
            position:   'fixed',
            inset:      0,
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor:    'background.default',
            zIndex:     9999,
            gap:        2.5,
        }}
    >
        {/* ── Animated amber top-bar ── */}
        <Box
            sx={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: 3,
                background: `linear-gradient(90deg, ${BRAND.amber}, ${BRAND.amberLt}, ${BRAND.amber})`,
                backgroundSize: '200% 100%',
                animation: 'topBar 1.4s linear infinite',
                '@keyframes topBar': {
                    from: { backgroundPosition: '200% 0' },
                    to:   { backgroundPosition: '-200% 0' },
                },
            }}
        />

        {/* ── Brand icon ── */}
        <Box
            sx={{
                width: 64, height: 64,
                borderRadius: '18px',
                background: `linear-gradient(135deg, ${BRAND.amberLt}, ${BRAND.amber}, ${BRAND.amberDk})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 12px 32px ${BRAND.amberGlow}`,
                animation: 'breathe 2s ease-in-out infinite',
                '@keyframes breathe': {
                    '0%, 100%': { transform: 'scale(0.94)', boxShadow: `0 8px 20px ${BRAND.amberGlow}` },
                    '50%':      { transform: 'scale(1.04)', boxShadow: `0 16px 40px rgba(245,158,11,0.38)` },
                },
            }}
        >
            {/* Globe SVG inline — no external image dependency */}
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0a0f1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2"  y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
        </Box>

        {/* ── Ring spinner ── */}
        <Box sx={{ position: 'relative', width: 40, height: 40 }}>
            <Box sx={{ position: 'absolute', inset: 0, border: `3px solid ${BRAND.amberBg}`, borderRadius: '50%' }} />
            <Box
                sx={{
                    position: 'absolute', inset: 0,
                    border:          `3px solid transparent`,
                    borderTopColor:  BRAND.amber,
                    borderRightColor: BRAND.amberLt,
                    borderRadius:    '50%',
                    animation: 'ring 0.75s cubic-bezier(0.4,0,0.2,1) infinite',
                    '@keyframes ring': { to: { transform: 'rotate(360deg)' } },
                }}
            />
        </Box>

        {/* ── Brand name ── */}
        <Box sx={{ textAlign: 'center' }}>
            <Typography
                sx={{
                    fontFamily:    '"Outfit","DM Sans",sans-serif',
                    fontWeight:    800,
                    fontSize:      '1.05rem',
                    color:         BRAND.textPrimary,
                    letterSpacing: '-0.01em',
                    lineHeight:    1.2,
                }}
            >
                Plan A Hosting
            </Typography>
            <Typography
                sx={{
                    fontSize:      '0.7rem',
                    fontWeight:    700,
                    color:         BRAND.amber,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    mt:            0.25,
                }}
            >
                Loading…
            </Typography>
        </Box>
    </Box>
);

export default PageLoader;
