import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';
export const ElectionCandidatesView = () => {
    const { contractAddress } = useParams();
    const [election, setElection] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const loadElectionData = async () => {
        if (!contractAddress)
            return;
        setLoading(true);
        try {
            const [electionRes, candidatesRes] = await Promise.all([
                api.get(`/election/${contractAddress}`),
                api.get(`/candidate/election/${contractAddress}`)
            ]);
            if (electionRes.data.success) {
                setElection(electionRes.data.data.election);
            }
            if (candidatesRes.data.success) {
                setCandidates(candidatesRes.data.data.candidates);
            }
        }
        catch (error) {
            console.error('Failed to load election data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadElectionData();
    }, [contractAddress]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'created': return 'bg-blue-100 text-blue-800';
            case 'registration_open': return 'bg-purple-100 text-purple-800';
            case 'voting_active': return 'bg-green-100 text-green-800';
            case 'results_announced': return 'bg-gray-100 text-gray-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    const totalVotes = candidates.reduce((sum, c) => sum + parseInt(c.votes || '0'), 0);
    if (loading)
        return _jsx("div", { className: "p-8 text-center text-slate-400", children: "Loading election details..." });
    if (!election)
        return _jsx("div", { className: "p-8 text-center text-red-400", children: "Election not found" });
    return (_jsxs("div", { className: "max-w-7xl mx-auto py-10 px-6 space-y-8", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold", children: election.title }), _jsx("p", { className: "text-muted-foreground mt-1", children: election.description })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(election.status)}`, children: election.status.replace('_', ' ') })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: candidates.length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Candidates" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: election.totalRegisteredVoters }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Registered Voters" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: election.totalVotesCast }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Votes Cast" })] }), _jsxs("div", { children: [_jsx("div", { className: "text-lg font-semibold", children: election.totalRegisteredVoters > 0
                                            ? `${((election.totalVotesCast / election.totalRegisteredVoters) * 100).toFixed(1)}%`
                                            : '0%' }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Turnout" })] })] }), _jsxs("div", { className: "mt-4 text-xs text-muted-foreground", children: [_jsx("span", { className: "font-mono", children: election.contractAddress }), election.deployedBy && (_jsxs("span", { className: "ml-4", children: ["Deployed by: ", election.deployedBy.name] }))] })] }), _jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Candidates" }), candidates.length > 0 ? (_jsx("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: candidates
                            .sort((a, b) => parseInt(b.votes) - parseInt(a.votes))
                            .map((candidate, index) => {
                            const votePercentage = totalVotes > 0 ? (parseInt(candidate.votes) / totalVotes * 100) : 0;
                            return (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsxs("div", { className: "flex items-start justify-between mb-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "font-semibold text-lg", children: candidate.name }), _jsx("p", { className: "text-muted-foreground", children: candidate.party })] }), index < 3 && (_jsx("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        'bg-orange-100 text-orange-800'}`, children: index + 1 }))] }), _jsxs("div", { className: "mb-4", children: [_jsxs("div", { className: "flex justify-between items-center mb-2", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Votes" }), _jsx("span", { className: "font-semibold", children: candidate.votes })] }), _jsx("div", { className: "w-full bg-muted rounded-full h-2", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all duration-300", style: { width: `${votePercentage}%` } }) }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: [votePercentage.toFixed(1), "% of total votes"] })] }), _jsx("div", { className: "mb-4", children: _jsx("p", { className: "text-sm text-muted-foreground line-clamp-3", children: candidate.manifesto }) }), candidate.socialMedia && (_jsxs("div", { className: "flex gap-2 mb-4", children: [candidate.socialMedia.twitter && (_jsx("a", { href: candidate.socialMedia.twitter, target: "_blank", rel: "noopener noreferrer", className: "text-blue-500 hover:text-blue-600 text-sm", children: "Twitter" })), candidate.socialMedia.facebook && (_jsx("a", { href: candidate.socialMedia.facebook, target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:text-blue-700 text-sm", children: "Facebook" })), candidate.socialMedia.instagram && (_jsx("a", { href: candidate.socialMedia.instagram, target: "_blank", rel: "noopener noreferrer", className: "text-pink-500 hover:text-pink-600 text-sm", children: "Instagram" }))] })), _jsx("button", { onClick: () => setSelectedCandidate(candidate), className: "w-full px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm transition-colors", children: "View Details" }), _jsxs("div", { className: "mt-2 text-xs text-muted-foreground", children: ["Wallet: ", candidate.candidateAddress.slice(0, 8), "..."] })] }, candidate.candidateId));
                        }) })) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No candidates registered for this election yet." }))] }), (election.votingStartTime || election.votingEndTime) && (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold mb-4", children: "Election Timeline" }), _jsxs("div", { className: "space-y-2 text-sm", children: [election.votingStartTime && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Voting Start:" }), _jsx("span", { children: new Date(election.votingStartTime).toLocaleString() })] })), election.votingEndTime && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-muted-foreground", children: "Voting End:" }), _jsx("span", { children: new Date(election.votingEndTime).toLocaleString() })] }))] })] })), selectedCandidate && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold", children: selectedCandidate.name }), _jsx("p", { className: "text-muted-foreground", children: selectedCandidate.party })] }), _jsx("button", { onClick: () => setSelectedCandidate(null), className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Votes Received" }), _jsx("div", { className: "text-2xl font-bold", children: selectedCandidate.votes }), _jsx("div", { className: "text-sm text-muted-foreground", children: totalVotes > 0 ? `${((parseInt(selectedCandidate.votes) / totalVotes) * 100).toFixed(1)}% of total votes` : 'No votes yet' })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Manifesto" }), _jsx("div", { className: "bg-muted/50 p-4 rounded-lg", children: _jsx("p", { className: "text-sm whitespace-pre-wrap", children: selectedCandidate.manifesto }) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Wallet Address" }), _jsx("code", { className: "text-xs bg-muted/50 p-2 rounded block", children: selectedCandidate.candidateAddress })] }), selectedCandidate.registeredAt && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Registration Date" }), _jsx("p", { className: "text-sm", children: new Date(selectedCandidate.registeredAt).toLocaleString() })] }))] })] }) }) }))] }));
};
