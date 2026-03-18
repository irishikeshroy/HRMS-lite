import { createTheme } from '@mui/material/styles';

// Minimal MUI theme — used only for Dialog, Snackbar, and form components.
// The rest of the UI is styled with Tailwind CSS.
export const muiTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#4cae82',
            light: '#6fc49e',
            dark: '#3a8d68',
        },
        secondary: {
            main: '#ef4444',
        },
        success: {
            main: '#4cae82',
        },
        warning: {
            main: '#f59e0b',
        },
        error: {
            main: '#ef4444',
        },
        background: {
            default: '#f6f7f7',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '8px 24px',
                },
                contained: {
                    boxShadow: '0 4px 14px rgba(76, 174, 130, 0.25)',
                },
            },
        },
    },
});
