import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
export const CandidateAnalytics = () => {
    const user = useAuthStore(s => s.user);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedElection, setSelectedElection] = useState(null);
    const loadAnalytics = async () => {
        if (!user?.walletAddress)
            return;
        setLoading(true);
        try {
            const { data } = await api.get(`/candidate/profile/${user.walletAddress}`);
            if (data.success && data.data.candidate.elections) {
                const elections = data.data.candidate.elections;
                // Calculate analytics
                const totalElections = elections.length;
                const totalVotes = elections.reduce((sum, e) => sum + e.votesReceived, 0);
                // For each election, get additional details
                const enhancedElections = await Promise.all(elections.map(async (election) => {
                    try {
                        const electionDetail = await api.get(`/election/${election.electionId.contractAddress}`);
                        if (electionDetail.data.success) {
                            const candidateCount = electionDetail.data.data.election.candidates?.length || 1;
                            const totalVotesCast = electionDetail.data.data.election.totalVotesCast || 0;
                            return {
                                ...election,
                                totalCandidates: candidateCount,
                                votePercentage: totalVotesCast > 0 ? (election.votesReceived / totalVotesCast * 100) : 0
                            };
                        }
                        return election;
                    }
                    catch (error) {
                        return election;
                    }
                }));
                const bestPerformance = enhancedElections.reduce((best, current) => {
                    if (!best || current.votesReceived > best.votesReceived) {
                        return current;
                    }
                    return best;
                }, null);
                setAnalytics({
                    totalElections,
                    totalVotes,
                    averagePosition: 0, // Would need ranking data from backend
                    bestPerformance,
                    recentPerformance: enhancedElections.slice(-5).reverse()
                });
            }
        }
        catch (error) {
            console.error('Failed to load analytics:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadAnalytics();
    }, [user]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'results_announced': return 'text-gray-600';
            case 'voting_active': return 'text-green-600';
            case 'registration_open': return 'text-blue-600';
            default: return 'text-yellow-600';
        }
    };
    if (loading)
        return _jsx("div", { className: "p-8 text-center text-slate-400", children: "Loading analytics..." });
    if (!analytics)
        return _jsx("div", { className: "p-8 text-center text-red-400", children: "Failed to load analytics" });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: analytics.totalElections }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Elections Participated" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: analytics.totalVotes }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Votes Received" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: analytics.totalElections > 0 ? Math.round(analytics.totalVotes / analytics.totalElections) : 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Average Votes per Election" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [analytics.bestPerformance?.votePercentage?.toFixed(1) || 0, "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Best Vote Share" })] })] }), analytics.bestPerformance && (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "\uD83C\uDFC6 Best Performance" }), _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: analytics.bestPerformance.electionId.title }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [analytics.bestPerformance.electionId.electionType, " Election"] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Contract: ", analytics.bestPerformance.electionId.contractAddress.slice(0, 10), "..."] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-2xl font-bold", children: analytics.bestPerformance.votesReceived }), _jsx("div", { className: "text-sm text-muted-foreground", children: "votes" }), analytics.bestPerformance.votePercentage && (_jsxs("div", { className: "text-xs text-green-600 font-medium", children: [analytics.bestPerformance.votePercentage.toFixed(1), "% share"] }))] })] })] })), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Recent Elections" }), _jsx("div", { className: "space-y-4", children: analytics.recentPerformance.map((election, index) => (_jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: election.electionId.title }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType, " \u2022", _jsx("span", { className: getStatusColor(election.electionId.status), children: election.electionId.status.replace('_', ' ') })] }), _jsxs("div", { className: "flex gap-4 mt-2 text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Total Votes: ", election.electionId.totalVotesCast] }), _jsxs("span", { children: ["Turnout: ", election.electionId.totalRegisteredVoters > 0
                                                                    ? `${((election.electionId.totalVotesCast / election.electionId.totalRegisteredVoters) * 100).toFixed(1)}%`
                                                                    : 'N/A'] }), election.totalCandidates && (_jsxs("span", { children: ["Candidates: ", election.totalCandidates] }))] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-lg font-semibold", children: election.votesReceived }), _jsx("div", { className: "text-xs text-muted-foreground", children: "votes received" }), election.votePercentage !== undefined && (_jsxs("div", { className: "text-xs text-blue-600 font-medium", children: [election.votePercentage.toFixed(1), "% share"] })), _jsx("button", { onClick: () => setSelectedElection(election), className: "mt-2 text-xs text-primary hover:underline", children: "View Details" })] })] }), election.votePercentage !== undefined && (_jsx("div", { className: "mt-3", children: _jsx("div", { className: "w-full bg-muted rounded-full h-2", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all duration-300", style: { width: `${election.votePercentage}%` } }) }) }))] }, election.electionId._id))) })] }), analytics.totalElections === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCCA" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Election Data" }), _jsx("p", { className: "text-muted-foreground", children: "You haven't participated in any elections yet. Register for available elections to start building your political profile." })] })), selectedElection && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Election Performance Details" }), _jsx("button", { onClick: () => setSelectedElection(null), className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-lg", children: selectedElection.electionId.title }), _jsxs("p", { className: "text-muted-foreground capitalize", children: [selectedElection.electionId.electionType, " Election \u2022 ", selectedElection.electionId.status.replace('_', ' ')] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: selectedElection.votesReceived }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Your Votes" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: selectedElection.electionId.totalVotesCast }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Votes Cast" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold", children: [selectedElection.votePercentage?.toFixed(1) || 0, "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Vote Share" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: selectedElection.totalCandidates || 'N/A' }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Candidates" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Contract Address" }), _jsx("code", { className: "text-xs bg-muted/50 p-2 rounded block font-mono", children: selectedElection.electionId.contractAddress })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Election Statistics" }), _jsxs("div", { className: "text-sm space-y-1", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Registered Voters:" }), _jsx("span", { children: selectedElection.electionId.totalRegisteredVoters })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Voter Turnout:" }), _jsx("span", { children: selectedElection.electionId.totalRegisteredVoters > 0
                                                                    ? `${((selectedElection.electionId.totalVotesCast / selectedElection.electionId.totalRegisteredVoters) * 100).toFixed(1)}%`
                                                                    : 'N/A' })] })] })] })] })] }) }) }))] }));
};
