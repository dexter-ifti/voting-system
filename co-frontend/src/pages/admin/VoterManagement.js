import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
export const VoterManagement = () => {
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [verifying, setVerifying] = useState('');
    const loadVoters = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (status)
                params.append('status', status);
            if (search)
                params.append('search', search);
            const { data } = await api.get(`/admin/voters?${params.toString()}`);
            if (data.success) {
                setVoters(data.data.voters);
                setTotalPages(data.data.totalPages);
            }
        }
        catch (error) {
            console.error('Failed to load voters:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const verifyVoter = async (voterId, newStatus, reason) => {
        setVerifying(voterId);
        try {
            const { data } = await api.put(`/admin/voters/${voterId}/verify`, {
                status: newStatus,
                reason: reason || `Voter ${newStatus}`
            });
            if (data.success) {
                await loadVoters(); // Reload the list
            }
        }
        catch (error) {
            console.error('Failed to verify voter:', error);
        }
        finally {
            setVerifying('');
        }
    };
    useEffect(() => {
        loadVoters();
    }, [page, status, search]);
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadVoters();
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto py-10 px-6 space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h1", { className: "text-2xl font-semibold", children: "Voter Management" }) }), _jsxs("div", { className: "flex gap-4 items-end", children: [_jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Search by name, email, or voter ID", value: search, onChange: (e) => setSearch(e.target.value), className: "px-3 py-2 border border-border rounded-lg bg-background text-sm" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90", children: "Search" })] }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "px-3 py-2 border border-border rounded-lg bg-background text-sm", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "verified", children: "Verified" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), loading ? (_jsx("div", { className: "text-center py-8 text-slate-400", children: "Loading voters..." })) : (_jsxs("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-muted/50", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-4 font-medium", children: "Voter ID" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Name" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Email" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Age" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Gender" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Status" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Wallet" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Actions" })] }) }), _jsx("tbody", { children: voters.map((voter) => (_jsxs("tr", { className: "border-t border-border", children: [_jsx("td", { className: "p-4 font-mono text-sm", children: voter.voterId }), _jsx("td", { className: "p-4", children: voter.name }), _jsx("td", { className: "p-4 text-sm text-muted-foreground", children: voter.email || 'N/A' }), _jsx("td", { className: "p-4", children: voter.age }), _jsx("td", { className: "p-4", children: voter.gender }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${voter.verificationStatus === 'verified'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : voter.verificationStatus === 'rejected'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`, children: voter.verificationStatus }) }), _jsxs("td", { className: "p-4 font-mono text-xs", children: [voter.walletAddress.slice(0, 8), "..."] }), _jsx("td", { className: "p-4", children: voter.verificationStatus === 'pending' && (_jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => verifyVoter(voter.voterId, 'verified'), disabled: verifying === voter.voterId, className: "px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50", children: verifying === voter.voterId ? 'Processing...' : 'Verify' }), _jsx("button", { onClick: () => verifyVoter(voter.voterId, 'rejected'), disabled: verifying === voter.voterId, className: "px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50", children: "Reject" })] })) })] }, voter._id))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "p-4 border-t border-border flex justify-center gap-2", children: [_jsx("button", { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: "px-3 py-1 border border-border rounded disabled:opacity-50", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 text-sm text-muted-foreground", children: ["Page ", page, " of ", totalPages] }), _jsx("button", { onClick: () => setPage(Math.min(totalPages, page + 1)), disabled: page === totalPages, className: "px-3 py-1 border border-border rounded disabled:opacity-50", children: "Next" })] }))] }))] }));
};
