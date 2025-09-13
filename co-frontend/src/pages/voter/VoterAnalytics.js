import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
export const VoterAnalytics = () => {
    const user = useAuthStore(s => s.user);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedElection, setSelectedElection] = useState(null);
    const loadAnalytics = async () => {
        if (!user?.walletAddress)
            return;
        setLoading(true);
        try {
            const { data } = await api.get(`/voter/${user.walletAddress}/elections`);
            if (data.success && data.data.elections) {
                const elections = data.data.elections;
                // Calculate analytics
                const totalElectionsRegistered = elections.length;
                const totalVotesCast = elections.filter((e) => e.hasVoted).length;
                const participationRate = totalElectionsRegistered > 0
                    ? (totalVotesCast / totalElectionsRegistered) * 100
                    : 0;
                // Enhance elections with additional data
                const enhancedElections = await Promise.all(elections.map(async (election) => {
                    try {
                        if (!election.electionId.contractAddress) {
                            return election;
                        }
                        const electionDetail = await api.get(`/election/${election.electionId.contractAddress}`);
                        if (electionDetail.data.success) {
                            const electionData = electionDetail.data.data.election;
                            return {
                                ...election,
                                electionId: {
                                    ...election.electionId,
                                    totalVotesCast: electionData.totalVotesCast || 0,
                                    totalRegisteredVoters: electionData.totalRegisteredVoters || 0
                                },
                                participationRate: electionData.totalRegisteredVoters > 0
                                    ? (electionData.totalVotesCast / electionData.totalRegisteredVoters) * 100
                                    : 0
                            };
                        }
                        return election;
                    }
                    catch (error) {
                        return election;
                    }
                }));
                // Calculate election type distribution
                const electionTypes = enhancedElections.reduce((acc, election) => {
                    const type = election.electionId.electionType || 'unknown';
                    acc[type] = (acc[type] || 0) + 1;
                    return acc;
                }, {});
                setAnalytics({
                    totalElectionsRegistered,
                    totalVotesCast,
                    participationRate,
                    votingHistory: enhancedElections,
                    recentActivity: enhancedElections.slice(-5).reverse(),
                    electionTypes
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
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'results_announced': return 'bg-gray-100 text-gray-800';
            case 'voting_active': return 'bg-green-100 text-green-800';
            case 'registration_open': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    if (loading)
        return _jsx("div", { className: "p-8 text-center text-slate-400", children: "Loading analytics..." });
    if (!analytics)
        return _jsx("div", { className: "p-8 text-center text-red-400", children: "Failed to load analytics" });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: analytics.totalElectionsRegistered }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Elections Registered" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: analytics.totalVotesCast }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Votes Cast" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsxs("div", { className: "text-2xl font-bold text-purple-600", children: [analytics.participationRate.toFixed(1), "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Participation Rate" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-orange-600", children: Object.keys(analytics.electionTypes).length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Election Types" })] })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Voting Participation" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsxs("span", { children: ["Voted: ", analytics.totalVotesCast] }), _jsxs("span", { children: ["Registered: ", analytics.totalElectionsRegistered] })] }), _jsx("div", { className: "w-full bg-muted rounded-full h-4", children: _jsx("div", { className: "bg-primary h-4 rounded-full transition-all duration-300", style: { width: `${analytics.participationRate}%` } }) }), _jsxs("div", { className: "text-center text-sm text-muted-foreground", children: ["You have voted in ", analytics.participationRate.toFixed(1), "% of elections you registered for"] })] })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Election Types Participated" }), _jsx("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: Object.entries(analytics.electionTypes).map(([type, count]) => (_jsxs("div", { className: "text-center p-4 bg-muted/50 rounded-lg", children: [_jsx("div", { className: "text-xl font-bold", children: count }), _jsx("div", { className: "text-sm text-muted-foreground capitalize", children: type.replace('_', ' ') })] }, type))) })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Recent Voting Activity" }), _jsx("div", { className: "space-y-4", children: analytics.recentActivity.map((election, index) => (_jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: election.electionId.title || 'Untitled Election' }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType || 'Unknown', " \u2022", _jsx("span", { className: getStatusColor(election.electionId.status), children: (election.electionId.status || 'unknown').replace('_', ' ') })] }), _jsxs("div", { className: "flex gap-4 mt-2 text-xs text-muted-foreground", children: [_jsxs("span", { children: ["Total Votes: ", election.electionId.totalVotesCast || 0] }), _jsxs("span", { children: ["Registered Voters: ", election.electionId.totalRegisteredVoters || 0] }), election.participationRate && (_jsxs("span", { children: ["Turnout: ", election.participationRate.toFixed(1), "%"] }))] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `inline-flex px-2 py-1 text-xs font-medium rounded-full ${election.hasVoted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`, children: election.hasVoted ? 'Voted' : 'Registered' }), election.votedAt && (_jsx("div", { className: "text-xs text-muted-foreground mt-1", children: new Date(election.votedAt).toLocaleDateString() })), _jsx("button", { onClick: () => setSelectedElection(election), className: "mt-2 text-xs text-primary hover:underline", children: "View Details" })] })] }), election.participationRate && (_jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex justify-between text-xs text-muted-foreground mb-1", children: [_jsx("span", { children: "Election Turnout" }), _jsxs("span", { children: [election.participationRate.toFixed(1), "%"] })] }), _jsx("div", { className: "w-full bg-muted rounded-full h-2", children: _jsx("div", { className: "bg-blue-500 h-2 rounded-full transition-all duration-300", style: { width: `${election.participationRate}%` } }) })] }))] }, election.electionId._id))) })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Complete Voting History" }), _jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: analytics.votingHistory.map((election, index) => (_jsxs("div", { className: "flex justify-between items-center py-2 border-b border-border last:border-b-0", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "text-sm font-medium", children: election.electionId.title || 'Untitled Election' }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [election.electionId.electionType || 'Unknown', " \u2022 ", (election.electionId.contractAddress || '').slice(0, 10), "..."] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(election.electionId.status)}`, children: (election.electionId.status || 'unknown').replace('_', ' ') }), _jsx("div", { className: `text-xs font-medium mt-1 ${election.hasVoted ? 'text-green-600' : 'text-yellow-600'}`, children: election.hasVoted ? 'Voted' : 'Registered Only' })] })] }, election.electionId._id))) })] }), analytics.totalElectionsRegistered === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCCA" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Voting Data" }), _jsx("p", { className: "text-muted-foreground", children: "You haven't registered for any elections yet. Start participating to see your voting analytics." })] })), selectedElection && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Election Details" }), _jsx("button", { onClick: () => setSelectedElection(null), className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-lg", children: selectedElection.electionId.title || 'Untitled Election' }), _jsxs("p", { className: "text-muted-foreground capitalize", children: [selectedElection.electionId.electionType || 'Unknown', " Election \u2022 ", (selectedElection.electionId.status || 'unknown').replace('_', ' ')] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: selectedElection.electionId.totalVotesCast || 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Votes Cast" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-bold", children: selectedElection.electionId.totalRegisteredVoters || 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Registered Voters" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsxs("div", { className: "text-2xl font-bold", children: [selectedElection.participationRate?.toFixed(1) || 0, "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Turnout Rate" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: `text-2xl font-bold ${selectedElection.hasVoted ? 'text-green-600' : 'text-yellow-600'}`, children: selectedElection.hasVoted ? 'Yes' : 'No' }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Your Vote" })] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Contract Address" }), _jsx("code", { className: "text-xs bg-muted/50 p-2 rounded block font-mono", children: selectedElection.electionId.contractAddress || 'N/A' })] }), selectedElection.votedAt && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-2", children: "Voting Details" }), _jsx("div", { className: "text-sm space-y-1", children: _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Voted On:" }), _jsx("span", { children: new Date(selectedElection.votedAt).toLocaleString() })] }) })] }))] })] }) }) }))] }));
};
