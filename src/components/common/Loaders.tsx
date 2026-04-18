import React from 'react';
import { Box, Backdrop, Typography } from '@mui/material';
import { BRAND } from '../../theme';

/* ═══════════════════════════════════════════════════════
   1.  ButtonLoader  — slim spinner inside buttons
   ═══════════════════════════════════════════════════════ */
export const ButtonLoader: React.FC = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box
            sx={{
                width: 16, height: 16,
                border: `2px solid rgba(10,15,30,0.25)`,
                borderTopColor: '#0a0f1e',
                borderRadius: '50%',
                animation: 'btnSpin 0.7s linear infinite',
                '@keyframes btnSpin': { to: { transform: 'rotate(360deg)' } },
            }}
        />
        <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Please wait…</span>
    </Box>
);

/* ═══════════════════════════════════════════════════════
   2.  SmallLoader  — inline spinner
   ═══════════════════════════════════════════════════════ */
export const SmallLoader: React.FC<{ size?: number; color?: string }> = ({
    size = 20,
    color = BRAND.amber,
}) => (
    <Box
        sx={{
            width: size, height: size,
            border: `2px solid ${color}30`,
            borderTopColor: color,
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
        }}
    />
);

/* ═══════════════════════════════════════════════════════
   3.  PulseLoader  — three amber dots, staggered pulse
   ═══════════════════════════════════════════════════════ */
export const PulseLoader: React.FC = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        {[0, 0.15, 0.3].map((delay, i) => (
            <Box
                key={i}
                sx={{
                    width: 8, height: 8,
                    borderRadius: '50%',
                    bgcolor: BRAND.amber,
                    animation: `pulse 1.2s ease-in-out ${delay}s infinite`,
                    '@keyframes pulse': {
                        '0%, 100%': { transform: 'scale(0.6)', opacity: 0.4 },
                        '50%':      { transform: 'scale(1)',   opacity: 1   },
                    },
                }}
            />
        ))}
    </Box>
);

/* ═══════════════════════════════════════════════════════
   4.  PageLoader  — full-height content loader
       Used inside <Suspense> fallback for lazy routes
   ═══════════════════════════════════════════════════════ */
export const PageLoader: React.FC = () => (
    <Box
        sx={{
            display:        'flex',
            flexDirection:  'column',
            alignItems:     'center',
            justifyContent: 'center',
            height:         '60vh',
            width:          '100%',
            gap:            2.5,
        }}
    >
        {/* Amber ring spinner */}
        <Box sx={{ position: 'relative', width: 56, height: 56 }}>
            {/* Track ring */}
            <Box
                sx={{
                    position: 'absolute', inset: 0,
                    border:       `3px solid ${BRAND.amberBg}`,
                    borderRadius: '50%',
                }}
            />
            {/* Spinning arc */}
            <Box
                sx={{
                    position:    'absolute', inset: 0,
                    border:      `3px solid transparent`,
                    borderTopColor:   BRAND.amber,
                    borderRightColor: BRAND.amberLt,
                    borderRadius: '50%',
                    animation: 'ringRotate 0.8s cubic-bezier(0.4,0,0.2,1) infinite',
                    '@keyframes ringRotate': { to: { transform: 'rotate(360deg)' } },
                }}
            />
            {/* Inner amber dot */}
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%', left: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: 12, height: 12,
                    borderRadius: '50%',
                    background: `linear-gradient(135deg, ${BRAND.amberLt}, ${BRAND.amber})`,
                    animation: 'dotPulse 0.8s ease-in-out infinite alternate',
                    '@keyframes dotPulse': {
                        from: { transform: 'translate(-50%,-50%) scale(0.7)', opacity: 0.6 },
                        to:   { transform: 'translate(-50%,-50%) scale(1)',   opacity: 1   },
                    },
                }}
            />
        </Box>

        <PulseLoader />

        <Typography
            sx={{
                fontSize:      '0.75rem',
                fontWeight:    700,
                color:         BRAND.textMuted,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
            }}
        >
            Loading…
        </Typography>
    </Box>
);

/* ═══════════════════════════════════════════════════════
   5.  SkeletonCard  — shimmer placeholder for cards
   ═══════════════════════════════════════════════════════ */
export const SkeletonCard: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
    <Box
        sx={{
            p: 2.5, borderRadius: '12px',
            bgcolor: '#ffffff', border: `1px solid ${BRAND.borderLight}`,
        }}
    >
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '9px', ...shimmerSx }} />
            <Box>
                <Box sx={{ width: 120, height: 12, borderRadius: 6, mb: 0.75, ...shimmerSx }} />
                <Box sx={{ width:  80, height: 10, borderRadius: 6, ...shimmerSx }} />
            </Box>
        </Box>
        {/* Lines */}
        {Array.from({ length: lines }).map((_, i) => (
            <Box
                key={i}
                sx={{ height: 10, borderRadius: 6, mb: 1, width: i === lines - 1 ? '60%' : '100%', ...shimmerSx }}
            />
        ))}
    </Box>
);

const shimmerSx = {
    bgcolor: BRAND.bgMuted,
    position: 'relative',
    overflow: 'hidden',
    '&::after': {
        content:  '""',
        position: 'absolute',
        inset:    0,
        background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)`,
        animation: 'shimmer 1.4s infinite',
        backgroundSize: '200% 100%',
    },
    '@keyframes shimmer': {
        from: { backgroundPosition: '-200% 0' },
        to:   { backgroundPosition: '200% 0'  },
    },
} as const;

/* ═══════════════════════════════════════════════════════
   6.  GlobalLoader  — full-screen backdrop overlay
   ═══════════════════════════════════════════════════════ */
export const GlobalLoader: React.FC<{ open: boolean; message?: string }> = ({
    open,
    message = 'Please wait…',
}) => (
    <Backdrop
        open={open}
        sx={{
            zIndex:          (t) => t.zIndex.drawer + 999,
            backdropFilter:  'blur(6px)',
            backgroundColor: 'rgba(4, 6, 15, 0.55)',
        }}
    >
        <Box
            sx={{
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                gap:            2.5,
                bgcolor:        'rgba(255,255,255,0.96)',
                borderRadius:   '20px',
                px:             5,
                py:             4,
                border:         `1px solid ${BRAND.borderLight}`,
                boxShadow:      '0 24px 60px rgba(0,0,0,0.2)',
                minWidth:       200,
                textAlign:      'center',
            }}
        >
            {/* Amber ring */}
            <Box sx={{ position: 'relative', width: 52, height: 52 }}>
                <Box sx={{ position: 'absolute', inset: 0, border: `3px solid ${BRAND.amberBg}`, borderRadius: '50%' }} />
                <Box
                    sx={{
                        position: 'absolute', inset: 0,
                        border:         `3px solid transparent`,
                        borderTopColor:  BRAND.amber,
                        borderRightColor: BRAND.amberLt,
                        borderRadius:   '50%',
                        animation:      'spin 0.7s linear infinite',
                        '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%', left: '50%',
                        transform: 'translate(-50%,-50%)',
                        width: 10, height: 10,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${BRAND.amberLt}, ${BRAND.amber})`,
                    }}
                />
            </Box>

            <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: BRAND.textPrimary, fontFamily: '"Outfit",sans-serif' }}>
                {message}
            </Typography>
        </Box>
    </Backdrop>
);

/* ═══════════════════════════════════════════════════════
   7.  TopProgress  — slim amber bar at page top
   ═══════════════════════════════════════════════════════ */
export const TopProgress: React.FC<{ loading: boolean }> = ({ loading }) =>
    loading ? (
        <Box
            sx={{
                position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999,
                height: 3,
                background: `linear-gradient(90deg, ${BRAND.amber}, ${BRAND.amberLt}, ${BRAND.amber})`,
                backgroundSize: '200% 100%',
                animation: 'slide 1.4s linear infinite',
                '@keyframes slide': {
                    from: { backgroundPosition: '200% 0' },
                    to:   { backgroundPosition: '-200% 0' },
                },
            }}
        />
    ) : null;
