import { createTheme } from '@mui/material/styles';
const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#3B82F6',
            light: '#60A5FA',
            dark: '#1D4ED8',
            contrastText: '#FFFFFF'
        },
        secondary: {
            main: '#8B5CF6',
            light: '#A78BFA',
            dark: '#7C3AED',
            contrastText: '#FFFFFF'
        },
        background: {
            default: '#0F172A',
            paper: '#1E293B'
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#CBD5E1',
            disabled: '#64748B'
        },
        error: {
            main: '#EF4444',
            light: '#F87171',
            dark: '#DC2626'
        },
        warning: {
            main: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706'
        },
        info: {
            main: '#06B6D4',
            light: '#22D3EE',
            dark: '#0891B2'
        },
        success: {
            main: '#10B981',
            light: '#34D399',
            dark: '#059669'
        },
        grey: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A'
        },
        divider: '#334155'
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        fontSize: 14,
        fontWeightLight: 300,
        fontWeightRegular: 400,
        fontWeightMedium: 500,
        fontWeightBold: 700
    },
    shape: {
        borderRadius: 8
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC'
                }
            }
        }
    }
});
export default theme;
