import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
export const ElectionsListPage = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
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
    return (_jsxs("div", { className: "max-w-5xl mx-auto py-10 px-6", children: [_jsxs("div", { className: "flex items-center gap-4 mb-6", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Elections" }), _jsx("input", { placeholder: "Search", value: search, onChange: e => setSearch(e.target.value), onKeyDown: e => e.key === 'Enter' && load(), className: "text-sm" }), _jsx("button", { onClick: load, className: "text-sm bg-slate-700 px-3 py-1.5 rounded", children: "Reload" })] }), loading && _jsx("p", { className: "text-sm text-slate-400", children: "Loading..." }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: elections.map(el => (_jsxs(Link, { to: `/elections/${el.contractAddress}`, className: "p-5 rounded-lg bg-card border border-border flex flex-col gap-2 hover:border-primary/60", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h2", { className: "font-semibold text-lg", children: el.title }), _jsx("span", { className: "text-[10px] px-2 py-0.5 rounded bg-slate-700 uppercase tracking-wide", children: el.status })] }), _jsx("p", { className: "text-sm line-clamp-3 text-slate-400", children: el.description }), _jsxs("div", { className: "flex text-[10px] gap-3 text-slate-500", children: [_jsxs("span", { children: ["Type: ", el.electionType] }), _jsxs("span", { children: ["Created ", formatDistanceToNow(new Date(el.createdAt)), " ago"] })] })] }, el.contractAddress))) })] }));
};
