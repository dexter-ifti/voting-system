import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ThemeProvider, CssBaseline } from '@mui/material';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import theme from './theme/theme';
import { VoterDashboard } from './pages/voter/VoterDashboard';
const createEmotionCache = () => {
    return createCache({
        key: "mui",
        prepend: true,
    });
};
const emotionCache = createEmotionCache();
function App() {
    return (_jsx(CacheProvider, { value: emotionCache, children: _jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsx(VoterDashboard, {})] }) }));
}
export default App;
