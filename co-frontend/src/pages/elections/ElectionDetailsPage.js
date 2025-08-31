import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ethers } from 'ethers';
import { toast } from 'sonner';
export const ElectionDetailsPage = () => {
    const { contractAddress } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore(s => s.user);
    const [voteLoading, setVoteLoading] = useState(false);
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get(`/election/${contractAddress}`);
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
    useEffect(() => { load(); }, [contractAddress]);
    const castVote = async (candidateId) => {
        if (!user || user.role !== 'voter')
            return toast.error('Login as voter');
        setVoteLoading(true);
        try {
            if (!window.ethereum)
                throw new Error('MetaMask not found');
            const provider = new ethers.BrowserProvider(window.ethereum);
            const accounts = await provider.send('eth_requestAccounts', []);
            const address = accounts[0];
            if (address.toLowerCase() !== user.walletAddress?.toLowerCase()) {
                return toast.error('Connected wallet mismatch');
            }
            // For simplicity, request private key (NOT recommended in prod). Better flow: backend uses signature to authorize server-side key mgmt.
            const pk = prompt('Enter private key to sign vote (demo only, never share real key):');
            if (!pk)
                return;
            const { data: voteRes } = await api.post('/voter/vote', { contractAddress, candidateId, privateKey: pk });
            if (voteRes.success) {
                toast.success('Vote cast');
                load();
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || err.message || 'Vote failed');
        }
        finally {
            setVoteLoading(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "p-8 text-sm text-slate-400", children: "Loading..." });
    if (!data)
        return _jsx("div", { className: "p-8 text-sm text-red-400", children: "Election not found" });
    const election = data.election;
    const candidates = data.blockchain.candidates || [];
    return (_jsxs("div", { className: "max-w-4xl mx-auto py-10 px-6 space-y-6", children: [_jsx("div", { className: "flex items-start justify-between gap-6", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-semibold mb-2", children: election.title }), _jsx("p", { className: "text-slate-400 text-sm max-w-2xl", children: election.description }), _jsxs("div", { className: "flex gap-3 mt-3 text-[10px] text-slate-500", children: [_jsxs("span", { children: ["Status: ", election.status] }), _jsxs("span", { children: ["Type: ", election.electionType] }), _jsxs("span", { children: ["Registered: ", election.totalRegisteredVoters] }), _jsxs("span", { children: ["Votes: ", election.totalVotesCast] })] })] }) }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold mb-3", children: "Candidates" }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: candidates.map(c => (_jsxs("div", { className: "p-4 rounded-lg bg-card border border-border flex flex-col gap-2", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium", children: c.name }), _jsxs("span", { className: "text-[10px] px-2 py-0.5 rounded bg-slate-700 uppercase tracking-wide", children: ["ID ", c.candidateId] })] }), _jsx("p", { className: "text-xs text-slate-400", children: c.party }), _jsx("p", { className: "text-xs text-slate-500 line-clamp-3", children: c.manifesto }), _jsxs("p", { className: "text-xs text-slate-400", children: ["Votes: ", c.votes] }), user?.role === 'voter' && (_jsx("button", { disabled: voteLoading, onClick: () => castVote(c.candidateId), className: "text-xs mt-1 bg-primary/80 hover:bg-primary px-3 py-1.5 rounded disabled:opacity-50", children: "Vote" }))] }, c.candidateId))) })] })] }));
};
