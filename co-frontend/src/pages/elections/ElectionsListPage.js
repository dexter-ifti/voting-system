import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';
export const ElectionsListPage = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const user = useAuthStore(s => s.user);
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/election', { params: { search } });
            if (data.success)
                setElections(data.data.elections);
        }
        catch (e) {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    return (_jsxs("div", { className: "max-w-5xl mx-auto py-10 px-6", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Elections" }), _jsx("input", { placeholder: "Search", value: search, onChange: e => setSearch(e.target.value), onKeyDown: e => e.key === 'Enter' && load(), className: "text-sm" }), _jsx("button", { onClick: load, className: "text-sm bg-slate-700 px-3 py-1.5 rounded", children: "Reload" })] }), loading && _jsx("p", { className: "text-sm text-slate-400", children: "Loading..." }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: elections.map(el => (_jsxs("div", { className: "p-5 rounded-lg bg-card border border-border flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "font-semibold text-lg", children: el.title }), _jsx("span", { className: `text-[10px] px-2 py-0.5 rounded uppercase tracking-wide ${el.status === 'registration_open' ? 'bg-green-100 text-green-800' :
                                        el.status === 'voting_active' ? 'bg-blue-100 text-blue-800' :
                                            el.status === 'results_announced' ? 'bg-gray-100 text-gray-800' :
                                                'bg-yellow-100 text-yellow-800'}`, children: el.status.replace('_', ' ') })] }), _jsx("p", { className: "text-sm line-clamp-3 text-slate-400", children: el.description }), _jsxs("div", { className: "flex text-[10px] gap-3 text-slate-500 mb-3", children: [_jsxs("span", { children: ["Type: ", el.electionType] }), _jsxs("span", { children: ["Created ", formatDistanceToNow(new Date(el.createdAt)), " ago"] }), el.candidates && el.maxCandidates && (_jsxs("span", { children: ["Candidates: ", el.candidates.length, "/", el.maxCandidates] }))] }), _jsxs("div", { className: "flex gap-2 mt-auto", children: [_jsx(Link, { to: `/elections/${el.contractAddress}`, className: "flex-1 text-center px-3 py-2 text-sm bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors", children: "View Details" }), user && el.status === 'registration_open' && (_jsx(Link, { to: `/elections/${el.contractAddress}/register`, className: "flex-1 text-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors", children: "Register" }))] })] }, el.contractAddress))) })] }));
};
