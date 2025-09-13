import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
export const VoterRegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', age: 18, gender: 'NotSpecified', walletAddress: '', email: '', phone: '' });
    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.post('/voter/register', form);
            if (data.success) {
                toast.success('Registered, pending verification');
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-md mx-auto py-16 px-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-6", children: "Voter Registration" }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Name" }), _jsx("input", { value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), required: true, className: "w-full" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Age" }), _jsx("input", { type: "number", value: form.age, onChange: e => setForm(f => ({ ...f, age: parseInt(e.target.value) || 18 })), required: true, className: "w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Gender" }), _jsxs("select", { value: form.gender, onChange: e => setForm(f => ({ ...f, gender: e.target.value })), className: "w-full", children: [_jsx("option", { children: "NotSpecified" }), _jsx("option", { children: "Male" }), _jsx("option", { children: "Female" }), _jsx("option", { children: "Other" })] })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Wallet Address" }), _jsx("input", { value: form.walletAddress, onChange: e => setForm(f => ({ ...f, walletAddress: e.target.value })), required: true, className: "w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Email" }), _jsx("input", { type: "email", value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })), className: "w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Phone" }), _jsx("input", { value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })), className: "w-full" })] }), _jsx("button", { disabled: loading, className: "w-full bg-primary/80 hover:bg-primary py-2 rounded font-medium text-sm disabled:opacity-50", children: loading ? 'Registering...' : 'Register' })] }), _jsxs("p", { className: "text-xs text-slate-400 mt-4", children: ["Have an account? ", _jsx(Link, { to: "/voter/login", className: "text-primary", children: "Login" })] })] }));
};
