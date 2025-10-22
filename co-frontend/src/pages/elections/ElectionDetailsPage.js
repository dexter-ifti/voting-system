import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { VotingInterface } from '../../components/VotingInterface';
import { toast } from 'sonner';
export const ElectionDetailsPage = () => {
    const { contractAddress } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore(s => s.user);
    const [showVoting, setShowVoting] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/election/${contractAddress}`);
            if (data.success)
                setData(data.data);
        }
        catch (e) {
            console.error('Failed to load election:', e);
            console.error('Contract address:', contractAddress);
            console.error('Error response:', e.response?.data);
            // Don't ignore the error, let the user know what happened
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, [contractAddress]);
    const handleVoteSuccess = () => {
        toast.success('Vote cast successfully!');
        setShowVoting(false);
        load(); // Reload data to show updated vote counts
    };
    if (loading)
        return _jsx("div", { className: "p-8 text-sm text-slate-400", children: "Loading..." });
    if (!data)
        return (_jsxs("div", { className: "p-8 text-sm text-red-400", children: [_jsx("div", { children: "Election not found" }), _jsxs("div", { className: "text-xs text-slate-500 mt-2", children: ["Contract Address: ", contractAddress] }), _jsx("div", { className: "text-xs text-slate-500", children: "Check the browser console for more details." })] }));
    const election = data.election;
    const candidates = data.blockchain.candidates || [];
    return (_jsxs("div", { className: "max-w-4xl mx-auto py-10 px-6 space-y-6", children: [_jsxs("div", { className: "flex items-start justify-between gap-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-semibold mb-2", children: election.title }), _jsx("p", { className: "text-slate-400 text-sm max-w-2xl", children: election.description }), _jsxs("div", { className: "flex gap-3 mt-3 text-[10px] text-slate-500", children: [_jsxs("span", { children: ["Status: ", election.status] }), _jsxs("span", { children: ["Type: ", election.electionType] }), _jsxs("span", { children: ["Registered: ", election.totalRegisteredVoters] }), _jsxs("span", { children: ["Votes: ", election.totalVotesCast] })] })] }), _jsxs("div", { className: "flex gap-2", children: [user && election.status === 'registration_open' && (_jsx(Link, { to: `/elections/${contractAddress}/register`, className: "px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm", children: "Register for Election" })), election.status === 'voting_active' && user?.role === 'voter' && (_jsx("button", { className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm", onClick: () => setShowVoting(true), children: "Cast Your Vote" }))] })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold mb-3", children: "Candidates" }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: candidates.map(c => (_jsxs("div", { className: "p-4 rounded-lg bg-card border border-border flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium", children: c.name }), _jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded bg-slate-700 uppercase tracking-wide", children: ["ID ", c.candidateId] })] }), _jsx("p", { className: "text-xs text-slate-400", children: c.party }), _jsx("p", { className: "text-xs text-slate-500 line-clamp-3", children: c.manifesto }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Votes: ", c.votes] })] }, c.candidateId))) })] }), showVoting && user?.role === 'voter' && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Cast Your Vote" }), _jsx("button", { onClick: () => setShowVoting(false), className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), _jsx(VotingInterface, { contractAddress: contractAddress || '', candidates: candidates, userWalletAddress: user.walletAddress || '', onVoteSuccess: handleVoteSuccess })] }) }) }))] }));
};
