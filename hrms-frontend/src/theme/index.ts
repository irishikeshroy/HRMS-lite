import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
    interface Theme {
        custom: {
            surface: string;
            surface2: string;
            codeBg: string;
        };
    }
    interface ThemeOptions {
        custom?: {
            surface?: string;
            surface2?: string;
            codeBg?: string;
        };
    }
}

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#0a0a0f',
            paper: '#111118',
        },
        primary: {
            main: '#6c63ff',
            light: '#9e99fb',
            dark: '#4c42d3',
        },
        secondary: {
            main: '#ff6584',
        },
        success: {
            main: '#43e97b',
        },
        warning: {
            main: '#f7971e',
        },
        text: {
            primary: '#e8e8f0',
            secondary: '#7a7a9a',
        },
        divider: '#252530',
    },
    custom: {
        surface: '#111118',
        surface2: '#18181f',
        codeBg: '#0d0d14',
    },
    typography: {
        fontFamily: '"DM Sans", "Helvetica", "Arial", sans-serif',
        h1: { fontFamily: '"Syne", sans-serif', fontWeight: 800 },
        h2: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        h3: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        h4: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        h5: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        h6: { fontFamily: '"Syne", sans-serif', fontWeight: 700 },
        button: {
            textTransform: 'none',
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    padding: '8px 24px',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    border: '1px solid #252530',
                    backgroundImage: 'none',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                elevation1: {
                    boxShadow: 'none',
                },
            },
        },
    },
});
