import { createTheme, alpha } from '@mui/material/styles';

// Final Color Palette for LeasePacket.tool
const primaryColor = '#0A3D62'; // Deep Tech Blue
const secondaryColor = '#FFFFFF'; // Clean White
const accentColor = '#2ECC71'; // Uptime Green
const softGray = '#F2F2F2'; // Background Gray
const borderColor = '#BFC5D2'; // Border/Divider Gray
const textColor = '#2D3436'; // Text Gray

export const theme = createTheme({
    palette: {
        primary: {
            main: primaryColor,
            light: alpha(primaryColor, 0.1),
            dark: '#072e4a',
            contrastText: '#ffffff',
        },
        secondary: {
            main: secondaryColor,
            contrastText: textColor,
        },
        success: {
            main: accentColor,
            light: alpha(accentColor, 0.1),
            dark: '#27ae60',
            contrastText: '#ffffff',
        },
        background: {
            default: softGray,
            paper: secondaryColor,
        },
        text: {
            primary: textColor,
            secondary: '#636e72',
        },
        divider: borderColor,
    },
    typography: {
        fontFamily: [
            '"DM Sans"',
            'sans-serif',
        ].join(','),
        h1: { fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: textColor },
        h2: { fontSize: '1.875rem', fontWeight: 800, letterSpacing: '-0.02em', color: textColor },
        h3: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.01em', color: textColor },
        h4: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em', color: textColor },
        h5: { fontSize: '1.125rem', fontWeight: 600, color: textColor },
        h6: { fontSize: '1rem', fontWeight: 600, color: textColor },
        subtitle1: { fontSize: '1rem', fontWeight: 500, color: '#475569' },
        subtitle2: { fontSize: '0.875rem', fontWeight: 500, color: '#64748B' },
        body1: { fontSize: '1rem', lineHeight: 1.5, color: textColor },
        body2: { fontSize: '0.875rem', lineHeight: 1.57, color: '#475569' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
        caption: { fontSize: '0.75rem', fontWeight: 500, color: '#64748B' },
    },
    shape: {
        borderRadius: 2,
    },
    shadows: [
        'none',
        '0px 1px 2px rgba(0, 0, 0, 0.05)',
        '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)',
        '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
        '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
        ...Array(20).fill('0px 25px 50px -12px rgba(10, 61, 98, 0.15)'),
    ] as any,
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                    padding: '10px 24px',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:active': { transform: 'scale(0.98)' },
                },
                containedPrimary: {
                    backgroundColor: primaryColor,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    '&:hover': {
                        backgroundColor: '#072e4a',
                        boxShadow: '0 4px 6px -1px rgba(10, 61, 98, 0.2), 0 2px 4px -1px rgba(10, 61, 98, 0.1)',
                    },
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    border: `1px solid ${borderColor}`,
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: `1px solid ${borderColor}`,
                    padding: '16px 24px',
                },
                head: {
                    backgroundColor: softGray,
                    color: textColor,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: secondaryColor,
                    borderRight: `1px solid ${borderColor}`,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
                size: 'small',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 10,
                        backgroundColor: secondaryColor,
                        '& fieldset': {
                            borderColor: borderColor,
                        },
                        '&:hover fieldset': {
                            borderColor: alpha(primaryColor, 0.5),
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: primaryColor,
                        },
                    },
                },
            },
        },
    },
});
