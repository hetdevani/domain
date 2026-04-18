import { createTheme, alpha } from '@mui/material/styles';

/* ═══════════════════════════════════════════════════════════════════
   BRAND TOKENS — change ONE value here → updates everywhere
   ═══════════════════════════════════════════════════════════════════ */
export const BRAND = {
    /* ── Amber (primary accent) ── */
    amber:      '#f59e0b',
    amberLt:    '#fcd34d',
    amberDk:    '#d97706',
    amberGlow:  'rgba(245,158,11,0.22)',
    amberBg:    'rgba(245,158,11,0.08)',
    amberBg2:   'rgba(245,158,11,0.14)',
    amberBorder:'rgba(245,158,11,0.32)',

    /* ── Violet (secondary) ── */
    violet:     '#7c3aed',
    violetLt:   '#a78bfa',
    violetGlow: 'rgba(124,58,237,0.22)',

    /* ── Cyan (tertiary) ── */
    cyan:       '#06b6d4',
    cyanGlow:   'rgba(6,182,212,0.18)',

    /* ── Dark surfaces (sidebar, auth, landing) ── */
    bgDeep:     '#04060f',
    bgDark:     '#070c1d',
    bgCard:     '#0a1228',
    bgElevated: '#111827',

    /* ── Light surfaces (dashboard content) ── */
    bgPage:     '#f4f6fc',      // main page background
    bgPaper:    '#ffffff',      // cards, panels
    bgSection:  '#f8faff',      // subtle section tint
    bgMuted:    '#eef2f9',      // muted areas, table headers

    /* ── Borders ── */
    borderLight:'#e2e8f0',      // light-mode borders
    borderDark: 'rgba(148,163,184,0.12)',  // dark-mode borders
    borderAmber:'rgba(245,158,11,0.32)',

    /* ── Text (light mode) ── */
    textPrimary:  '#0f172a',
    textSecondary:'#475569',
    textMuted:    '#94a3b8',
    textDisabled: '#cbd5e1',

    /* ── Text (dark surfaces) ── */
    textLt:    '#f8fafc',
    textMid:   'rgba(248,250,252,0.72)',
    muted:     '#94a3b8',
    mutedDk:   '#64748b',

    /* ── Semantic ── */
    success:   '#10b981',
    successBg: 'rgba(16,185,129,0.10)',
    danger:    '#ef4444',
    dangerBg:  'rgba(239,68,68,0.09)',
    warning:   '#f97316',
    warningBg: 'rgba(249,115,22,0.09)',
    info:      '#3b82f6',
    infoBg:    'rgba(59,130,246,0.09)',
};

/* ═══════════════════════════════════════════════════════════════════
   MUI THEME  —  Light mode for dashboard content,
                 dark overrides for sidebar / auth done inline.
   ═══════════════════════════════════════════════════════════════════ */
export const theme = createTheme({
    palette: {
        mode: 'light',

        primary: {
            main:         BRAND.amber,
            light:        BRAND.amberLt,
            dark:         BRAND.amberDk,
            contrastText: '#0a0f1e',
        },
        secondary: {
            main:         BRAND.violet,
            light:        BRAND.violetLt,
            dark:         '#5b21b6',
            contrastText: '#ffffff',
        },
        success: {
            main:         BRAND.success,
            light:        BRAND.successBg,
            dark:         '#059669',
            contrastText: '#ffffff',
        },
        error: {
            main:         BRAND.danger,
            light:        BRAND.dangerBg,
            dark:         '#b91c1c',
            contrastText: '#ffffff',
        },
        warning: {
            main:         BRAND.warning,
            light:        BRAND.warningBg,
            contrastText: '#ffffff',
        },
        info: {
            main:         BRAND.info,
            light:        BRAND.infoBg,
            contrastText: '#ffffff',
        },
        background: {
            default: BRAND.bgPage,
            paper:   BRAND.bgPaper,
        },
        text: {
            primary:   BRAND.textPrimary,
            secondary: BRAND.textSecondary,
            disabled:  BRAND.textDisabled,
        },
        divider: BRAND.borderLight,
    },

    typography: {
        fontFamily:   ['"DM Sans"', 'sans-serif'].join(','),
        h1: { fontFamily: '"Outfit","DM Sans",sans-serif', fontSize: '2.25rem',  fontWeight: 800, letterSpacing: '-0.025em', color: BRAND.textPrimary },
        h2: { fontFamily: '"Outfit","DM Sans",sans-serif', fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em',  color: BRAND.textPrimary },
        h3: { fontFamily: '"Outfit","DM Sans",sans-serif', fontSize: '1.5rem',   fontWeight: 700, letterSpacing: '-0.015em', color: BRAND.textPrimary },
        h4: { fontFamily: '"Outfit","DM Sans",sans-serif', fontSize: '1.25rem',  fontWeight: 700, letterSpacing: '-0.01em',  color: BRAND.textPrimary },
        h5: { fontFamily: '"Outfit","DM Sans",sans-serif', fontSize: '1.125rem', fontWeight: 700, color: BRAND.textPrimary },
        h6: { fontFamily: '"Outfit","DM Sans",sans-serif', fontSize: '1rem',     fontWeight: 700, color: BRAND.textPrimary },
        subtitle1: { fontSize: '1rem',      fontWeight: 500, color: BRAND.textSecondary },
        subtitle2: { fontSize: '0.875rem',  fontWeight: 500, color: BRAND.textSecondary },
        body1:     { fontSize: '0.9375rem', lineHeight: 1.6, color: BRAND.textPrimary },
        body2:     { fontSize: '0.875rem',  lineHeight: 1.6, color: BRAND.textSecondary },
        button:    { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
        caption:   { fontSize: '0.75rem',   fontWeight: 500, color: BRAND.textMuted },
    },

    shape: { borderRadius: 2 },

    shadows: [
        'none',
        '0 1px 2px rgba(0,0,0,0.05)',
        '0 1px 4px rgba(0,0,0,0.07)',
        '0 2px 8px rgba(0,0,0,0.08)',
        '0 4px 14px rgba(0,0,0,0.08)',
        '0 8px 24px rgba(0,0,0,0.09)',
        ...Array(19).fill('0 12px 32px rgba(0,0,0,0.10)'),
    ] as any,

    components: {
        /* ── CssBaseline ─────────────────────── */
        MuiCssBaseline: {
            styleOverrides: {
                body: { backgroundColor: BRAND.bgPage, color: BRAND.textPrimary },
                '::-webkit-scrollbar':       { width: '6px', height: '6px' },
                '::-webkit-scrollbar-track': { background: BRAND.bgMuted },
                '::-webkit-scrollbar-thumb': { background: '#cbd5e1', borderRadius: '99px' },
                '::-webkit-scrollbar-thumb:hover': { background: '#94a3b8' },
            },
        },

        /* ── Button ──────────────────────────── */
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding:      '9px 22px',
                    fontSize:     '0.875rem',
                    fontWeight:   600,
                    transition:   'filter 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease',
                    '&:active':   { transform: 'scale(0.97)' },
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, ${BRAND.amberLt} 0%, ${BRAND.amber} 55%, ${BRAND.amberDk} 100%)`,
                    color:      '#0a0f1e',
                    boxShadow:  `0 4px 16px ${BRAND.amberGlow}`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${BRAND.amberLt} 0%, ${BRAND.amber} 55%, ${BRAND.amberDk} 100%)`,
                        filter:     'brightness(1.1)',
                        boxShadow:  `0 6px 22px rgba(245,158,11,0.38)`,
                    },
                    '&.Mui-disabled': {
                        background: 'rgba(245,158,11,0.2)',
                        color:      'rgba(10,15,30,0.4)',
                    },
                },
                outlinedPrimary: {
                    borderColor: BRAND.amber,
                    color:       BRAND.amber,
                    '&:hover': {
                        borderColor:     BRAND.amberDk,
                        backgroundColor: BRAND.amberBg,
                    },
                },
                textPrimary: {
                    color: BRAND.amber,
                    '&:hover': { backgroundColor: BRAND.amberBg },
                },
                containedError: {
                    '&:hover': { filter: 'brightness(1.08)' },
                },
            },
        },

        /* ── AppBar ──────────────────────────── */
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff',
                    color:           BRAND.textPrimary,
                    borderBottom:    `1px solid ${BRAND.borderLight}`,
                    boxShadow:       '0 1px 4px rgba(0,0,0,0.06)',
                },
            },
        },

        /* ── Drawer ──────────────────────────── */
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: BRAND.bgDeep,
                    backgroundImage: 'none',
                    border:          'none',
                    borderRight:     `1px solid ${BRAND.borderDark}`,
                },
            },
        },

        /* ── Paper ───────────────────────────── */
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: '#ffffff',
                    border:          `1px solid ${BRAND.borderLight}`,
                    boxShadow:       '0 1px 3px rgba(0,0,0,0.06)',
                },
                elevation0: { boxShadow: 'none' },
                elevation1: { boxShadow: '0 1px 4px rgba(0,0,0,0.07)' },
                elevation2: { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
                elevation3: { boxShadow: '0 4px 16px rgba(0,0,0,0.09)' },
            },
        },

        /* ── Card ────────────────────────────── */
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius:    16,
                    border:          `1px solid ${BRAND.borderLight}`,
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                    boxShadow:       '0 1px 4px rgba(0,0,0,0.06)',
                    transition:      'box-shadow 0.22s ease, border-color 0.22s ease, transform 0.18s ease',
                    '&:hover': {
                        boxShadow:   '0 8px 28px rgba(0,0,0,0.1)',
                        borderColor: BRAND.amberBorder,
                    },
                },
            },
        },

        /* ── TextField ───────────────────────── */
        MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small', InputLabelProps: { shrink: true } },
            styleOverrides: {
                root: {
                    '& .MuiInputLabel-root': {
                        position:      'static',
                        transform:     'none',
                        fontSize:      '0.8125rem',
                        fontWeight:    600,
                        color:         BRAND.textSecondary,
                        marginBottom:  '5px',
                        display:       'block',
                        pointerEvents: 'none',
                        '&.Mui-focused': { color: BRAND.amber },
                        '&.Mui-error':   { color: BRAND.danger },
                    },
                    '& .MuiOutlinedInput-root': {
                        borderRadius:    10,
                        backgroundColor: '#ffffff',
                        fontSize:        '0.875rem',
                        color:           BRAND.textPrimary,
                        '& legend':   { display: 'none' },
                        '& fieldset': { top: 0, borderColor: BRAND.borderLight },
                        '&:hover fieldset':   { borderColor: alpha(BRAND.amber, 0.5) },
                        '&.Mui-focused fieldset': {
                            borderColor: BRAND.amber,
                            borderWidth: '1.5px',
                        },
                        '&.Mui-error fieldset': { borderColor: BRAND.danger },
                        '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus': {
                            WebkitBoxShadow:     '0 0 0 100px #ffffff inset',
                            WebkitTextFillColor: BRAND.textPrimary,
                            transition:          'background-color 5000s ease-in-out 0s',
                        },
                    },
                    '& .MuiInputBase-input::placeholder': {
                        color: BRAND.textMuted, opacity: 1,
                    },
                    '& .MuiFormHelperText-root': {
                        color:    BRAND.danger,
                        fontSize: '0.75rem',
                        marginTop: '4px',
                    },
                },
            },
        },

        /* ── InputLabel ──────────────────────── */
        MuiInputLabel: {
            defaultProps: { shrink: true },
            styleOverrides: {
                root: {
                    position:   'static',
                    transform:  'none',
                    fontSize:   '0.8125rem',
                    fontWeight: 600,
                    color:      BRAND.textSecondary,
                    marginBottom: '5px',
                    display:    'block',
                    '&.MuiInputLabel-shrink': { transform: 'none' },
                    '&.Mui-focused': { color: BRAND.amber },
                    '&.Mui-error':   { color: BRAND.danger },
                },
            },
        },

        /* ── Select ──────────────────────────── */
        MuiSelect: {
            defaultProps: { notched: false },
            styleOverrides: {
                root: {
                    borderRadius:    10,
                    backgroundColor: '#ffffff',
                    fontSize:        '0.875rem',
                    color:           BRAND.textPrimary,
                    '& legend':   { display: 'none' },
                    '& fieldset': { top: 0, borderColor: BRAND.borderLight },
                },
                icon: { color: BRAND.textSecondary },
            },
        },

        /* ── OutlinedInput ───────────────────── */
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& legend':   { display: 'none' },
                    '& fieldset': { top: 0 },
                },
                notchedOutline: { top: 0, '& legend': { display: 'none' } },
            },
        },

        /* ── FormControl ─────────────────────── */
        MuiFormControl: {
            defaultProps: { size: 'small' },
        },

        /* ── Table ───────────────────────────── */
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${BRAND.borderLight}`,
                    padding:      '13px 18px',
                    fontSize:     '0.875rem',
                    color:        BRAND.textPrimary,
                    backgroundColor: '#ffffff',
                },
                head: {
                    backgroundColor: BRAND.bgMuted,
                    color:           BRAND.textSecondary,
                    fontWeight:      700,
                    fontSize:        '0.7rem',
                    textTransform:   'uppercase',
                    letterSpacing:   '0.06em',
                    borderBottom:    `2px solid ${BRAND.borderLight}`,
                },
            },
        },
        MuiTableContainer: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                    borderRadius:    12,
                    border:          `1px solid ${BRAND.borderLight}`,
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover td': { backgroundColor: BRAND.bgSection },
                    '&:last-child td': { borderBottom: 'none' },
                },
            },
        },

        /* ── Chip ────────────────────────────── */
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    fontWeight:   600,
                    fontSize:     '0.75rem',
                    height:       26,
                },
                colorPrimary: {
                    backgroundColor: BRAND.amberBg,
                    color:           BRAND.amberDk,
                    border:          `1px solid ${BRAND.amberBorder}`,
                },
                colorSuccess: {
                    backgroundColor: BRAND.successBg,
                    color:           BRAND.success,
                },
                colorError: {
                    backgroundColor: BRAND.dangerBg,
                    color:           BRAND.danger,
                },
                colorWarning: {
                    backgroundColor: BRAND.warningBg,
                    color:           BRAND.warning,
                },
                colorInfo: {
                    backgroundColor: BRAND.infoBg,
                    color:           BRAND.info,
                },
            },
        },

        /* ── Tooltip ─────────────────────────── */
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: BRAND.textPrimary,
                    borderRadius:    '8px',
                    fontSize:        '0.75rem',
                    fontWeight:      500,
                    padding:         '6px 10px',
                },
                arrow: { color: BRAND.textPrimary },
            },
        },

        /* ── Alert ───────────────────────────── */
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontSize:     '0.875rem',
                    border:       '1px solid transparent',
                },
                standardSuccess: {
                    backgroundColor: BRAND.successBg,
                    borderColor:     `${BRAND.success}33`,
                    color:           '#065f46',
                },
                standardError: {
                    backgroundColor: BRAND.dangerBg,
                    borderColor:     `${BRAND.danger}33`,
                    color:           '#991b1b',
                },
                standardWarning: {
                    backgroundColor: BRAND.warningBg,
                    borderColor:     `${BRAND.warning}33`,
                    color:           '#92400e',
                },
                standardInfo: {
                    backgroundColor: BRAND.infoBg,
                    borderColor:     `${BRAND.info}33`,
                    color:           '#1e40af',
                },
            },
        },

        /* ── Menu ────────────────────────────── */
        MuiMenu: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                    border:          `1px solid ${BRAND.borderLight}`,
                    borderRadius:    '14px',
                    boxShadow:       '0 10px 40px rgba(0,0,0,0.12)',
                },
            },
        },
        MuiMenuItem: {
            styleOverrides: {
                root: {
                    fontSize:   '0.875rem',
                    fontWeight: 500,
                    color:      BRAND.textPrimary,
                    borderRadius: '8px',
                    mx:           '6px',
                    '&:hover': { backgroundColor: BRAND.bgSection },
                    '&.Mui-selected': {
                        backgroundColor: BRAND.amberBg,
                        color:           BRAND.amberDk,
                        '&:hover': { backgroundColor: BRAND.amberBg2 },
                    },
                },
            },
        },

        /* ── Divider ─────────────────────────── */
        MuiDivider: {
            styleOverrides: { root: { borderColor: BRAND.borderLight } },
        },

        /* ── Dialog ──────────────────────────── */
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                    border:          `1px solid ${BRAND.borderLight}`,
                    borderRadius:    '18px',
                    boxShadow:       '0 20px 60px rgba(0,0,0,0.18)',
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontFamily:    '"Outfit","DM Sans",sans-serif',
                    fontWeight:    800,
                    fontSize:      '1.1rem',
                    color:         BRAND.textPrimary,
                    borderBottom:  `1px solid ${BRAND.borderLight}`,
                    pb:            2,
                },
            },
        },

        /* ── ListItemButton ──────────────────── */
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: '10px',
                    '&:hover': { backgroundColor: BRAND.bgSection },
                    '&.Mui-selected': {
                        backgroundColor: BRAND.amberBg,
                        '&:hover': { backgroundColor: BRAND.amberBg2 },
                    },
                },
            },
        },

        /* ── Avatar ──────────────────────────── */
        MuiAvatar: {
            styleOverrides: {
                root: {
                    background: `linear-gradient(135deg, ${BRAND.amber}, ${BRAND.amberDk})`,
                    color:      '#0a0f1e',
                    fontWeight: 800,
                },
            },
        },

        /* ── Accordion ───────────────────────── */
        MuiAccordion: {
            styleOverrides: {
                root: {
                    backgroundColor: '#ffffff',
                    backgroundImage: 'none',
                    border:          `1px solid ${BRAND.borderLight}`,
                    boxShadow:       'none',
                    '&:before':      { display: 'none' },
                    borderRadius:    '12px !important',
                    '&.Mui-expanded': { borderColor: BRAND.amberBorder },
                },
            },
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: {
                    '&.Mui-expanded': { color: BRAND.amberDk },
                },
            },
        },

        /* ── Tabs ────────────────────────────── */
        MuiTab: {
            styleOverrides: {
                root: {
                    fontWeight:    600,
                    fontSize:      '0.875rem',
                    textTransform: 'none',
                    color:         BRAND.textSecondary,
                    '&.Mui-selected': { color: BRAND.amber },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: { backgroundColor: BRAND.amber, height: 2.5 },
            },
        },

        /* ── Pagination ──────────────────────── */
        MuiPaginationItem: {
            styleOverrides: {
                root: {
                    color:        BRAND.textSecondary,
                    border:       `1px solid ${BRAND.borderLight}`,
                    borderRadius: '8px',
                    '&.Mui-selected': {
                        backgroundColor: BRAND.amberBg,
                        color:           BRAND.amberDk,
                        borderColor:     BRAND.amberBorder,
                        fontWeight:      700,
                    },
                },
            },
        },

        /* ── Switch ──────────────────────────── */
        MuiSwitch: {
            styleOverrides: {
                switchBase: {
                    '&.Mui-checked': {
                        color: BRAND.amber,
                        '& + .MuiSwitch-track': { backgroundColor: BRAND.amber, opacity: 0.5 },
                    },
                },
                track: { backgroundColor: BRAND.textMuted },
            },
        },

        /* ── Badge ───────────────────────────── */
        MuiBadge: {
            styleOverrides: {
                badge: { fontSize: '0.6rem', minWidth: 15, height: 15, padding: 0 },
            },
        },

        /* ── Breadcrumbs ─────────────────────── */
        MuiBreadcrumbs: {
            styleOverrides: {
                root:      { fontSize: '0.8125rem' },
                separator: { color: BRAND.textMuted },
            },
        },

        /* ── LinearProgress ──────────────────── */
        MuiLinearProgress: {
            styleOverrides: {
                root:           { borderRadius: 99, height: 6, backgroundColor: BRAND.bgMuted },
                barColorPrimary:{ background: `linear-gradient(90deg, ${BRAND.amber}, ${BRAND.amberDk})` },
            },
        },

        /* ── CircularProgress ────────────────── */
        MuiCircularProgress: {
            styleOverrides: {
                colorPrimary: { color: BRAND.amber },
            },
        },
    },
});
