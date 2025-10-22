import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
export const AdminLoginPage = () => {
    const setUser = useAuthStore(s => s.setUser);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: '', password: '' });
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/admin/login', form);
            if (data.success) {
                setUser({ role: data.data.admin.role, token: data.data.token, email: data.data.admin.email, name: data.data.admin.name, permissions: data.data.admin.permissions });
                toast.success('Logged in');
                navigate('/admin/dashboard');
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-full blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" }), _jsx("div", { className: "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500" }), _jsx("div", { className: "relative z-10 flex items-center justify-center min-h-screen p-6", children: _jsxs("div", { className: "w-full max-w-md", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: _jsx("span", { className: "bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent", children: "Admin Portal" }) }), _jsx("p", { className: "text-slate-400 text-lg", children: "Secure access to system administration" })] }), _jsxs("div", { className: "backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500", children: [_jsxs("form", { onSubmit: submit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300", children: "Email Address" }), _jsx("input", { type: "email", value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })), required: true, className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50", placeholder: "admin@votingsystem.com" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300", children: "Password" }), _jsx("input", { type: "password", value: form.password, onChange: e => setForm(f => ({ ...f, password: e.target.value })), required: true, className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50", placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" })] }), _jsxs("button", { disabled: loading, className: "w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group", children: [_jsx("span", { className: "relative z-10", children: loading ? (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }), _jsx("span", { children: "Signing In..." })] })) : ('Sign In to Portal') }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" })] })] }), _jsx("div", { className: "mt-6 pt-6 border-t border-slate-700/50", children: _jsxs("p", { className: "text-center text-slate-400", children: ["Don't have admin access?", ' ', _jsx(Link, { to: "/admin/register", className: "text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text hover:from-blue-400 hover:to-cyan-400 transition-all duration-300 font-medium", children: "Request Registration" })] }) })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("p", { className: "text-sm text-slate-500", children: "\uD83D\uDD12 This portal uses end-to-end encryption and secure authentication" }) })] }) })] }));
};
