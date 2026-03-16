import { createTheme, alpha } from '@mui/material/styles';

const primaryColor = '#0A3D62';
const accentColor = '#2ECC71';
const borderColor = '#E2E8F0';
const textColor = '#0f172a';
const mutedText = '#64748B';

export const theme = createTheme({
    palette: {
        primary: {
            main: primaryColor,
            light: alpha(primaryColor, 0.1),
            dark: '#072e4a',
            contrastText: '#ffffff',
        },
        secondary: {
            main: '#ffffff',
            contrastText: textColor,
        },
        success: {
            main: accentColor,
            light: alpha(accentColor, 0.1),
            dark: '#27ae60',
            contrastText: '#ffffff',
        },
        background: {
            default: '#f7f7f7',
            paper: '#ffffff',
        },
        text: {
            primary: textColor,
            secondary: '#475569',
        },
        divider: borderColor,
    },
    typography: {
        fontFamily: ['"DM Sans"', 'sans-serif'].join(','),
        h1: {
            fontFamily: '"Outfit", "DM Sans", sans-serif',
            fontSize: '2.25rem',
            fontWeight: 800,
            letterSpacing: '-0.025em',
            color: textColor,
        },
        h2: {
            fontFamily: '"Outfit", "DM Sans", sans-serif',
            fontSize: '1.875rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            color: textColor,
        },
        h3: {
            fontFamily: '"Outfit", "DM Sans", sans-serif',
            fontSize: '1.5rem',
            fontWeight: 700,
            letterSpacing: '-0.015em',
            color: textColor,
        },
        h4: {
            fontFamily: '"Outfit", "DM Sans", sans-serif',
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: textColor,
        },
        h5: {
            fontFamily: '"Outfit", "DM Sans", sans-serif',
            fontSize: '1.125rem',
            fontWeight: 700,
            color: textColor,
        },
        h6: {
            fontFamily: '"Outfit", "DM Sans", sans-serif',
            fontSize: '1rem',
            fontWeight: 700,
            color: textColor,
        },
        subtitle1: { fontSize: '1rem', fontWeight: 500, color: '#475569' },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500, color: mutedText },
        body1: { fontSize: '0.9375rem', lineHeight: 1.6, color: textColor },
        body2: { fontSize: '0.875rem', lineHeight: 1.6, color: '#475569' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
        caption: { fontSize: '0.75rem', fontWeight: 500, color: mutedText },
    },
    shape: { borderRadius: 2 },
    shadows: [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.05)',
        '0px 1px 3px rgba(0,0,0,0.08), 0px 1px 2px rgba(0,0,0,0.04)',
        '0px 4px 8px -2px rgba(0,0,0,0.08), 0px 2px 4px -2px rgba(0,0,0,0.04)',
        '0px 8px 16px -4px rgba(0,0,0,0.08), 0px 4px 6px -4px rgba(0,0,0,0.04)',
        ...Array(20).fill(
            '0px 20px 40px -8px rgba(10,61,98,0.14), 0px 8px 16px -6px rgba(0,0,0,0.06)'
        ),
    ] as any,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '9px 22px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:active': { transform: 'scale(0.97)' },
                },
                containedPrimary: {
                    background: `linear-gradient(135deg, #2ecc71, #2ecc71)`,
                    boxShadow: `0 2px 8px ${alpha(primaryColor, 0.28)}`,
                    '&:hover': {
                        background: `linear-gradient(135deg, #27ae60, #2ecc71)`,
                        boxShadow: `0 4px 14px ${alpha(primaryColor, 0.35)}`,
                        transform: 'translateY(-1px)',
                    },
                },
                outlinedPrimary: {
                    borderColor: alpha(primaryColor, 0.35),
                    '&:hover': {
                        borderColor: primaryColor,
                        backgroundColor: alpha(primaryColor, 0.04),
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${borderColor}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)',
                    backgroundImage: 'none',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    '&:hover': {
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                    },
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${borderColor}`,
                    padding: '14px 20px',
                    fontSize: '0.875rem',
                },
                head: {
                    backgroundColor: '#F8FAFC',
                    color: '#374151',
                    fontWeight: 700,
                    fontSize: '0.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: `2px solid ${borderColor}`,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: '#0a3d62',
                    border: 'none',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
                InputLabelProps: { shrink: true },
            },
            styleOverrides: {
                root: {
                    // Label sits statically above the input — no floating
                    '& .MuiInputLabel-root': {
                        position: 'static',
                        transform: 'none',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#374151',
                        marginBottom: '5px',
                        display: 'block',
                        pointerEvents: 'none',
                        '&.Mui-focused': { color: primaryColor },
                        '&.Mui-error': { color: '#ef4444' },
                    },
                    // Remove the notch gap in the fieldset border
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: '#ffffff',
                        fontSize: '0.875rem',
                        '& legend': { display: 'none' },
                        '& fieldset': {
                            top: 0,
                            borderColor: borderColor,
                        },
                        '&:hover fieldset': { borderColor: alpha(primaryColor, 0.4) },
                        '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                            borderWidth: '1.5px',
                        },
                        '&.Mui-error fieldset': { borderColor: '#ef4444' },
                    },
                },
            },
        },
        MuiInputLabel: {
            defaultProps: { shrink: true },
            styleOverrides: {
                root: {
                    position: 'static',
                    transform: 'none',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '5px',
                    display: 'block',
                    '&.MuiInputLabel-shrink': {
                        transform: 'none',
                    },
                    '&.Mui-focused': { color: primaryColor },
                    '&.Mui-error': { color: '#ef4444' },
                },
            },
        },
        MuiSelect: {
            defaultProps: { notched: false },
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    backgroundColor: '#ffffff',
                    fontSize: '0.875rem',
                    '& legend': { display: 'none' },
                    '& fieldset': { top: 0, borderColor: borderColor },
                },
            },
        },
        MuiFormControl: {
            defaultProps: { size: 'small' },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& legend': { display: 'none' },
                    '& fieldset': { top: 0 },
                },
                notchedOutline: {
                    top: 0,
                    '& legend': { display: 'none' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 26,
                },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    padding: '6px 10px',
                },
                arrow: {
                    color: '#0f172a',
                },
            },
        },
        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontSize: '0.875rem',
                },
            },
        },
    },
});
