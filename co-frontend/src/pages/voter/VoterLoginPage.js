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
    return (_jsxs("div", { className: "max-w-md mx-auto py-16 px-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-6", children: "Voter Login (Wallet)" }), _jsx("button", { onClick: login, disabled: loading, className: "w-full bg-primary/80 hover:bg-primary py-2 rounded font-medium text-sm disabled:opacity-50", children: loading ? 'Connecting...' : 'Connect Wallet & Sign' }), _jsxs("p", { className: "text-xs text-slate-400 mt-4", children: ["Need an account? ", _jsx(Link, { to: "/voter/register", className: "text-primary", children: "Register" })] }), walletAddress && _jsxs("p", { className: "text-xs text-slate-500 mt-4", children: ["Detected: ", walletAddress] })] }));
};
