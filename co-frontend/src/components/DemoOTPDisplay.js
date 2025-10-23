import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export const DemoOTPDisplay = ({ otpData, onClose }) => {
    const [copied, setCopied] = useState(false);
    if (!otpData)
        return null;
    const copyOTP = () => {
        navigator.clipboard.writeText(otpData.otp);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const maskEmail = (email) => {
        const [username, domain] = email.split('@');
        if (username.length <= 2)
            return email;
        const masked = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${masked}@${domain}`;
    };
    return (_jsx("div", { className: "fixed top-20 right-4 z-[60] max-w-sm animate-pulse", children: _jsxs("div", { className: "bg-gradient-to-br from-emerald-500/95 to-cyan-500/95 backdrop-blur-xl border border-emerald-400/60 rounded-xl p-4 shadow-2xl shadow-emerald-500/40 ring-2 ring-emerald-400/30 transform transition-all duration-300 hover:scale-105", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("span", { className: "text-white text-lg", children: "\uD83D\uDCF1" }), _jsx("span", { className: "text-white font-semibold text-sm", children: "Demo OTP" })] }), _jsx("button", { onClick: onClose, className: "text-white/70 hover:text-white transition-colors p-1", children: "\u2715" })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-white/80 text-xs mb-1", children: "\uD83D\uDCF1 Demo OTP sent to:" }), _jsx("div", { className: "text-white font-mono text-xs bg-black/20 rounded px-2 py-1", children: maskEmail(otpData.email) })] }), _jsxs("div", { className: "bg-black/30 rounded-lg p-4 text-center border border-white/20", children: [_jsx("div", { className: "text-emerald-200 text-xs mb-2 font-semibold", children: "\uD83D\uDD11 YOUR OTP CODE:" }), _jsx("div", { className: "text-white font-mono text-3xl font-bold tracking-widest bg-white/10 rounded-lg py-2 px-4 border border-white/20", children: otpData.otp })] }), _jsxs("button", { onClick: copyOTP, className: "w-full bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2", children: [_jsx("span", { children: copied ? '✓' : '📋' }), _jsx("span", { children: copied ? 'Copied!' : 'Copy OTP' })] }), _jsx("div", { className: "text-white/60 text-xs text-center", children: "\u26A0\uFE0F Demo Mode: OTP visible for testing" })] })] }) }));
};
