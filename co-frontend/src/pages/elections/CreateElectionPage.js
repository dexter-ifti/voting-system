import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
export const CreateElectionPage = () => {
    const user = useAuthStore(s => s.user);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', electionType: 'presidential', adminPrivateKey: '' });
    const submit = async (e) => {
        e.preventDefault();
        if (!user || !user.role.includes('admin'))
            return toast.error('Unauthorized');
        setLoading(true);
        try {
            const { data } = await api.post('/election/create', form);
            if (data.success) {
                toast.success('Election created');
                navigate(`/elections/${data.data.contractAddress}`);
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Creation failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "max-w-xl mx-auto py-12 px-6", children: [_jsx("h1", { className: "text-2xl font-semibold mb-6", children: "Create Election" }), _jsxs("form", { onSubmit: submit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Title" }), _jsx("input", { value: form.title, onChange: e => setForm(f => ({ ...f, title: e.target.value })), required: true, className: "w-full" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Description" }), _jsx("textarea", { value: form.description, onChange: e => setForm(f => ({ ...f, description: e.target.value })), required: true, className: "w-full h-32" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Election Type" }), _jsxs("select", { value: form.electionType, onChange: e => setForm(f => ({ ...f, electionType: e.target.value })), className: "w-full", children: [_jsx("option", { value: "presidential", children: "Presidential" }), _jsx("option", { value: "parliamentary", children: "Parliamentary" }), _jsx("option", { value: "local", children: "Local" }), _jsx("option", { value: "referendum", children: "Referendum" }), _jsx("option", { value: "student", children: "Student" }), _jsx("option", { value: "corporate", children: "Corporate" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Admin Private Key (deployment)" }), _jsx("input", { value: form.adminPrivateKey, onChange: e => setForm(f => ({ ...f, adminPrivateKey: e.target.value })), required: true, className: "w-full" })] }), _jsx("button", { disabled: loading, className: "w-full bg-primary/80 hover:bg-primary py-2 rounded font-medium text-sm disabled:opacity-50", children: loading ? 'Deploying...' : 'Create & Deploy' })] })] }));
};
