import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
export const RegistrationStatus = ({ status, message, userType, electionTitle, onClose }) => {
    const getThemeColors = () => {
        return userType === 'candidate'
            ? 'from-orange-500 to-pink-600'
            : 'from-cyan-500 to-emerald-600';
    };
    const getStatusIcon = () => {
        const themeGradient = getThemeColors();
        switch (status) {
            case 'registering':
                return (_jsxs("div", { className: "relative", children: [_jsx("div", { className: `animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r ${themeGradient} p-1`, children: _jsx("div", { className: "bg-slate-900 rounded-full h-full w-full flex items-center justify-center", children: _jsx("svg", { className: "w-6 h-6 text-white animate-pulse", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z", clipRule: "evenodd" }) }) }) }), _jsx("div", { className: "absolute inset-0 animate-ping rounded-full bg-gradient-to-r from-white/20 to-white/5" })] }));
            case 'success':
                return (_jsxs("div", { className: "relative", children: [_jsx("div", { className: `rounded-full h-16 w-16 bg-gradient-to-r from-green-400 to-emerald-500 flex items-center justify-center shadow-lg animate-bounce`, children: _jsx("svg", { className: "h-8 w-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M5 13l4 4L19 7" }) }) }), _jsx("div", { className: "absolute inset-0 rounded-full bg-green-400 animate-ping opacity-25" })] }));
            case 'error':
                return (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "rounded-full h-16 w-16 bg-gradient-to-r from-red-400 to-pink-500 flex items-center justify-center shadow-lg animate-pulse", children: _jsx("svg", { className: "h-8 w-8 text-white", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 3, d: "M6 18L18 6M6 6l12 12" }) }) }), _jsx("div", { className: "absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" })] }));
            default:
                return null;
        }
    };
    const getStatusTitle = () => {
        switch (status) {
            case 'registering':
                return `Registering ${userType.charAt(0).toUpperCase() + userType.slice(1)}...`;
            case 'success':
                return 'Registration Successful! ✅';
            case 'error':
                return 'Registration Failed ❌';
            default:
                return '';
        }
    };
    const getStatusMessage = () => {
        switch (status) {
            case 'registering':
                return `Processing your ${userType} registration for "${electionTitle}". This may take a few moments as we interact with the blockchain...`;
            case 'success':
                return `You have been successfully registered as a ${userType} for "${electionTitle}". You can now participate in the election process.`;
            case 'error':
                return message || `Failed to register as ${userType} for "${electionTitle}". Please check your wallet connection and try again.`;
            default:
                return '';
        }
    };
    if (status === 'idle')
        return null;
    const themeGradient = getThemeColors();
    return (_jsxs("div", { className: "fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50", children: [_jsxs("div", { className: "absolute inset-0 overflow-hidden", children: [_jsx("div", { className: `absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r ${themeGradient} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse` }), _jsx("div", { className: `absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-l ${themeGradient} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000` })] }), _jsx("div", { className: "relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl max-w-md w-full shadow-2xl", children: _jsxs("div", { className: "p-8 text-center", children: [_jsx("div", { className: "flex justify-center mb-6", children: getStatusIcon() }), _jsx("h3", { className: `text-2xl font-bold mb-4 bg-gradient-to-r ${themeGradient} bg-clip-text text-transparent`, children: getStatusTitle() }), _jsx("p", { className: "text-slate-300 mb-8 leading-relaxed", children: getStatusMessage() }), status === 'registering' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-center space-x-2 text-slate-400", children: [_jsx("svg", { className: "w-5 h-5 animate-pulse", fill: "currentColor", viewBox: "0 0 20 20", children: _jsx("path", { fillRule: "evenodd", d: "M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z", clipRule: "evenodd" }) }), _jsx("span", { className: "text-sm", children: "Processing blockchain transaction..." })] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-xs text-slate-400", children: [_jsx("span", { children: "Progress" }), _jsx("span", { className: "animate-pulse", children: "60%" })] }), _jsx("div", { className: "h-2 bg-slate-800 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full bg-gradient-to-r ${themeGradient} rounded-full animate-pulse transition-all duration-1000`, style: { width: '60%' } }) })] })] })), (status === 'success' || status === 'error') && onClose && (_jsxs("button", { onClick: onClose, className: `group relative w-full py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg font-semibold ${status === 'success'
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-green-500/25'
                                : `bg-gradient-to-r ${themeGradient} text-white hover:shadow-lg`}`, children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-r ${status === 'success'
                                        ? 'from-green-600 to-emerald-700'
                                        : userType === 'candidate'
                                            ? 'from-orange-600 to-pink-700'
                                            : 'from-cyan-600 to-emerald-700'} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300` }), _jsx("span", { className: "relative flex items-center justify-center space-x-2", children: status === 'success' ? (_jsxs(_Fragment, { children: [_jsx("span", { children: "Continue" }), _jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 7l5 5m0 0l-5 5m5-5H6" }) })] })) : (_jsxs(_Fragment, { children: [_jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" }) }), _jsx("span", { children: "Try Again" })] })) })] }))] }) })] }));
};
