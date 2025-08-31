import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
export const CandidateManagement = () => {
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [verifying, setVerifying] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const loadCandidates = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (status)
                params.append('status', status);
            if (search)
                params.append('search', search);
            const { data } = await api.get(`/admin/candidates?${params.toString()}`);
            if (data.success) {
                setCandidates(data.data.candidates);
                setTotalPages(data.data.totalPages);
            }
        }
        catch (error) {
            console.error('Failed to load candidates:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const verifyCandidate = async (candidateId, newStatus, reason) => {
        setVerifying(candidateId);
        try {
            const { data } = await api.put(`/admin/candidates/${candidateId}/verify`, {
                status: newStatus,
                reason: reason || `Candidate ${newStatus}`
            });
            if (data.success) {
                await loadCandidates(); // Reload the list
            }
        }
        catch (error) {
            console.error('Failed to verify candidate:', error);
        }
        finally {
            setVerifying('');
        }
    };
    useEffect(() => {
        loadCandidates();
    }, [page, status, search]);
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadCandidates();
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto py-10 px-6 space-y-6", children: [_jsx("div", { className: "flex justify-between items-center", children: _jsx("h1", { className: "text-2xl font-semibold", children: "Candidate Management" }) }), _jsxs("div", { className: "flex gap-4 items-end", children: [_jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Search by name, party, or candidate ID", value: search, onChange: (e) => setSearch(e.target.value), className: "px-3 py-2 border border-border rounded-lg bg-background text-sm" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90", children: "Search" })] }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "px-3 py-2 border border-border rounded-lg bg-background text-sm", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "pending", children: "Pending" }), _jsx("option", { value: "verified", children: "Verified" }), _jsx("option", { value: "rejected", children: "Rejected" })] })] }), loading ? (_jsx("div", { className: "text-center py-8 text-slate-400", children: "Loading candidates..." })) : (_jsxs("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-muted/50", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-4 font-medium", children: "Candidate ID" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Name" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Party" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Age" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Status" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Elections" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Wallet" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Actions" })] }) }), _jsx("tbody", { children: candidates.map((candidate) => (_jsxs("tr", { className: "border-t border-border", children: [_jsx("td", { className: "p-4 font-mono text-sm", children: candidate.candidateId }), _jsx("td", { className: "p-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: candidate.name }), _jsx("div", { className: "text-xs text-muted-foreground", children: candidate.email })] }) }), _jsx("td", { className: "p-4", children: candidate.party }), _jsx("td", { className: "p-4", children: candidate.age }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${candidate.verificationStatus === 'verified'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                        : candidate.verificationStatus === 'rejected'
                                                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`, children: candidate.verificationStatus }) }), _jsx("td", { className: "p-4 text-sm", children: candidate.elections?.length || 0 }), _jsxs("td", { className: "p-4 font-mono text-xs", children: [candidate.walletAddress.slice(0, 8), "..."] }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setSelectedCandidate(candidate), className: "px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700", children: "View" }), candidate.verificationStatus === 'pending' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => verifyCandidate(candidate.candidateId, 'verified'), disabled: verifying === candidate.candidateId, className: "px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50", children: verifying === candidate.candidateId ? 'Processing...' : 'Verify' }), _jsx("button", { onClick: () => verifyCandidate(candidate.candidateId, 'rejected'), disabled: verifying === candidate.candidateId, className: "px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50", children: "Reject" })] }))] }) })] }, candidate._id))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "p-4 border-t border-border flex justify-center gap-2", children: [_jsx("button", { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: "px-3 py-1 border border-border rounded disabled:opacity-50", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 text-sm text-muted-foreground", children: ["Page ", page, " of ", totalPages] }), _jsx("button", { onClick: () => setPage(Math.min(totalPages, page + 1)), disabled: page === totalPages, className: "px-3 py-1 border border-border rounded disabled:opacity-50", children: "Next" })] }))] })), selectedCandidate && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Candidate Details" }), _jsx("button", { onClick: () => setSelectedCandidate(null), className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Name" }), _jsx("p", { children: selectedCandidate.name })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Party" }), _jsx("p", { children: selectedCandidate.party })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Age" }), _jsx("p", { children: selectedCandidate.age })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Gender" }), _jsx("p", { children: selectedCandidate.gender })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Email" }), _jsx("p", { children: selectedCandidate.email })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Phone" }), _jsx("p", { children: selectedCandidate.phone })] })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Wallet Address" }), _jsx("p", { className: "font-mono text-sm", children: selectedCandidate.walletAddress })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Manifesto" }), _jsx("p", { className: "text-sm bg-muted/50 p-3 rounded", children: selectedCandidate.manifesto })] }), selectedCandidate.elections && selectedCandidate.elections.length > 0 && (_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Elections Participated" }), _jsx("div", { className: "space-y-2 mt-2", children: selectedCandidate.elections.map((election, index) => (_jsxs("div", { className: "bg-muted/50 p-3 rounded text-sm", children: [_jsx("div", { className: "font-medium", children: election.electionId?.title }), _jsxs("div", { className: "text-muted-foreground", children: ["Votes: ", election.votesReceived] })] }, index))) })] }))] })] }) }) }))] }));
};
