import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
export const VoterLoginPage = () => {
    const setUser = useAuthStore(s => s.setUser);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [walletAddress, setWalletAddress] = useState('');
    const login = async () => {
        setLoading(true);
        try {
            if (!window.ethereum)
                throw new Error('MetaMask not found');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            const address = accounts[0];
            setWalletAddress(address);
            const message = `Login as voter at ${new Date().toISOString()}`;
            const signer = await provider.getSigner();
            const signature = await signer.signMessage(message);
            const { data } = await api.post('/voter/login', { walletAddress: address, message, signature });
            if (data.success) {
                setUser({ role: 'voter', token: data.data.token, walletAddress: data.data.voter.walletAddress, name: data.data.voter.name });
                toast.success('Logged in');
                navigate('/voter/dashboard');
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-32 left-16 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-16 right-16 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" }), _jsx("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500" }), _jsx("div", { className: "relative z-10 flex items-center justify-center min-h-screen p-6", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx("span", { className: "text-white text-3xl", children: "\uD83D\uDDF3\uFE0F" }) }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: _jsx("span", { className: "bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent", children: "Voter Access" }) }), _jsx("p", { className: "text-slate-400 text-lg", children: "Connect your wallet to participate in elections" })] }), _jsxs("div", { className: "backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300", children: _jsx("span", { className: "text-white text-2xl", children: "\uD83E\uDD8A" }) }), _jsx("h3", { className: "text-xl font-semibold text-white mb-2", children: "Connect MetaMask Wallet" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Your wallet signature serves as your secure login credential" })] }), _jsxs("button", { onClick: login, disabled: loading, className: "w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group", children: [_jsx("span", { className: "relative z-10", children: loading ? (_jsxs("div", { className: "flex items-center justify-center space-x-3", children: [_jsx("div", { className: "w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" }), _jsx("span", { children: "Connecting to wallet..." })] })) : (_jsxs("div", { className: "flex items-center justify-center space-x-3", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDD17" }), _jsx("span", { children: "Connect Wallet & Sign Message" })] })) }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" })] }), walletAddress && (_jsx("div", { className: "mt-4 p-4 bg-slate-900/50 border border-slate-600/50 rounded-xl", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "w-3 h-3 bg-emerald-400 rounded-full animate-pulse" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-slate-400 mb-1", children: "Connected Wallet" }), _jsx("p", { className: "text-sm font-mono text-emerald-400 break-all", children: walletAddress })] })] }) })), _jsx("div", { className: "bg-slate-900/30 border border-slate-700/30 rounded-xl p-4", children: _jsxs("div", { className: "flex items-start space-x-3", children: [_jsx("div", { className: "w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0", children: _jsx("span", { className: "text-blue-400 text-sm", children: "\u2139\uFE0F" }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-slate-300 font-medium mb-1", children: "Secure Authentication" }), _jsx("p", { className: "text-xs text-slate-400 leading-relaxed", children: "We use cryptographic signatures to verify your identity. No passwords required - just your wallet signature." })] })] }) })] }), _jsx("div", { className: "mt-8 pt-6 border-t border-slate-700/50", children: _jsxs("p", { className: "text-center text-slate-400", children: ["New to voting?", ' ', _jsx(Link, { to: "/voter/register", className: "text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300 font-medium", children: "Register as Voter" })] }) })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("div", { className: "inline-flex items-center space-x-2 text-sm text-slate-500 bg-slate-800/30 px-4 py-2 rounded-lg border border-slate-700/30", children: [_jsx("span", { children: "\uD83E\uDD8A" }), _jsx("span", { children: "Requires MetaMask browser extension" })] }) })] }) })] }));
};
