import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
export const AdminDashboard = () => {
    const user = useAuthStore(s => s.user);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/dashboard');
            if (data.success)
                setData(data.data);
        }
        catch (e) {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    if (loading)
        return _jsx("div", { className: "p-8 text-sm text-slate-400", children: "Loading..." });
    if (!data)
        return _jsx("div", { className: "p-8 text-sm text-red-400", children: "Failed to load" });
    return (_jsxs("div", { className: "max-w-5xl mx-auto py-10 px-6 space-y-8", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Admin Dashboard" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsxs("div", { className: "p-4 rounded-lg bg-card border border-border", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Total Elections" }), _jsx("p", { className: "text-2xl font-semibold", children: data.stats.totalElections })] }), _jsxs("div", { className: "p-4 rounded-lg bg-card border border-border", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Active Elections" }), _jsx("p", { className: "text-2xl font-semibold", children: data.stats.activeElections })] }), _jsxs("div", { className: "p-4 rounded-lg bg-card border border-border", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Verified Voters" }), _jsx("p", { className: "text-2xl font-semibold", children: data.stats.totalVoters })] }), _jsxs("div", { className: "p-4 rounded-lg bg-card border border-border", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Verified Candidates" }), _jsx("p", { className: "text-2xl font-semibold", children: data.stats.totalCandidates })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold mb-3", children: "Recent Elections" }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: data.recentElections.map(el => (_jsxs("div", { className: "p-4 rounded-lg bg-card border border-border", children: [_jsx("h3", { className: "font-medium", children: el.title }), _jsx("p", { className: "text-xs text-slate-500 line-clamp-3", children: el.description }), _jsxs("p", { className: "text-[10px] mt-2 text-slate-400", children: ["Candidates: ", el.candidates.length] })] }, el.contractAddress))) })] })] }));
};
