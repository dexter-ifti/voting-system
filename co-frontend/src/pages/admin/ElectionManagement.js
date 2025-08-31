import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { CreateElectionForm } from './CreateElectionForm';
export const ElectionManagement = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState('');
    const [electionType, setElectionType] = useState('');
    const [search, setSearch] = useState('');
    const [selectedElection, setSelectedElection] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);
    const [emergencyStopForm, setEmergencyStopForm] = useState({ show: false, reason: '', privateKey: '' });
    const [announceResultsForm, setAnnounceResultsForm] = useState({ show: false, privateKey: '' });
    const [processing, setProcessing] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const loadElections = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (status)
                params.append('status', status);
            if (electionType)
                params.append('electionType', electionType);
            if (search)
                params.append('search', search);
            const { data } = await api.get(`/election?${params.toString()}`);
            if (data.success) {
                setElections(data.data.elections);
                setTotalPages(data.data.totalPages);
            }
        }
        catch (error) {
            console.error('Failed to load elections:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadAnalytics = async (contractAddress) => {
        setLoadingAnalytics(true);
        try {
            const { data } = await api.get(`/admin/elections/${contractAddress}/analytics`);
            if (data.success) {
                setAnalytics(data.data);
            }
        }
        catch (error) {
            console.error('Failed to load analytics:', error);
        }
        finally {
            setLoadingAnalytics(false);
        }
    };
    const handleEmergencyStop = async () => {
        if (!selectedElection || !emergencyStopForm.privateKey)
            return;
        setProcessing(true);
        try {
            const { data } = await api.post(`/election/${selectedElection.contractAddress}/emergency-stop`, {
                adminPrivateKey: emergencyStopForm.privateKey,
                reason: emergencyStopForm.reason
            });
            if (data.success) {
                setEmergencyStopForm({ show: false, reason: '', privateKey: '' });
                await loadElections();
                alert('Emergency stop activated successfully');
            }
        }
        catch (error) {
            console.error('Failed to emergency stop:', error);
            alert('Failed to activate emergency stop');
        }
        finally {
            setProcessing(false);
        }
    };
    const handleAnnounceResults = async () => {
        if (!selectedElection || !announceResultsForm.privateKey)
            return;
        setProcessing(true);
        try {
            const { data } = await api.post(`/election/${selectedElection.contractAddress}/announce-results`, {
                adminPrivateKey: announceResultsForm.privateKey
            });
            if (data.success) {
                setAnnounceResultsForm({ show: false, privateKey: '' });
                await loadElections();
                alert('Results announced successfully');
            }
        }
        catch (error) {
            console.error('Failed to announce results:', error);
            alert('Failed to announce results');
        }
        finally {
            setProcessing(false);
        }
    };
    useEffect(() => {
        loadElections();
    }, [page, status, electionType, search]);
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        loadElections();
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'created': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'registration_open': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'voting_active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'results_announced': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto py-10 px-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Election Management" }), _jsx("button", { onClick: () => setShowCreateForm(true), className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90", children: "Create New Election" })] }), _jsxs("div", { className: "flex gap-4 items-end flex-wrap", children: [_jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Search by title or description", value: search, onChange: (e) => setSearch(e.target.value), className: "px-3 py-2 border border-border rounded-lg bg-background text-sm" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90", children: "Search" })] }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "px-3 py-2 border border-border rounded-lg bg-background text-sm", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "created", children: "Created" }), _jsx("option", { value: "registration_open", children: "Registration Open" }), _jsx("option", { value: "voting_active", children: "Voting Active" }), _jsx("option", { value: "results_announced", children: "Results Announced" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] }), _jsxs("select", { value: electionType, onChange: (e) => setElectionType(e.target.value), className: "px-3 py-2 border border-border rounded-lg bg-background text-sm", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "presidential", children: "Presidential" }), _jsx("option", { value: "parliamentary", children: "Parliamentary" }), _jsx("option", { value: "local", children: "Local" }), _jsx("option", { value: "referendum", children: "Referendum" }), _jsx("option", { value: "student", children: "Student" }), _jsx("option", { value: "corporate", children: "Corporate" })] })] }), loading ? (_jsx("div", { className: "text-center py-8 text-slate-400", children: "Loading elections..." })) : (_jsxs("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-muted/50", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-4 font-medium", children: "Title" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Type" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Status" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Candidates" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Voters" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Turnout" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Created By" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Actions" })] }) }), _jsx("tbody", { children: elections.map((election) => (_jsxs("tr", { className: "border-t border-border", children: [_jsx("td", { className: "p-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: election.title }), _jsxs("div", { className: "text-xs text-muted-foreground font-mono", children: [election.contractAddress.slice(0, 10), "..."] })] }) }), _jsx("td", { className: "p-4 capitalize", children: election.electionType }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`, children: election.status.replace('_', ' ') }) }), _jsx("td", { className: "p-4", children: election.candidates?.length || 0 }), _jsxs("td", { className: "p-4", children: [election.totalVotesCast, "/", election.totalRegisteredVoters] }), _jsx("td", { className: "p-4", children: election.turnoutPercentage ? `${election.turnoutPercentage.toFixed(1)}%` : 'N/A' }), _jsx("td", { className: "p-4 text-sm", children: election.deployedBy?.name }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                loadAnalytics(election.contractAddress);
                                                            }, className: "px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700", children: "View" }), (election.status === 'voting_active' || election.status === 'registration_open') && (_jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                setEmergencyStopForm({ show: true, reason: '', privateKey: '' });
                                                            }, className: "px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700", children: "Stop" })), election.status === 'voting_active' && (_jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                setAnnounceResultsForm({ show: true, privateKey: '' });
                                                            }, className: "px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700", children: "Results" }))] }) })] }, election._id))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "p-4 border-t border-border flex justify-center gap-2", children: [_jsx("button", { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: "px-3 py-1 border border-border rounded disabled:opacity-50", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 text-sm text-muted-foreground", children: ["Page ", page, " of ", totalPages] }), _jsx("button", { onClick: () => setPage(Math.min(totalPages, page + 1)), disabled: page === totalPages, className: "px-3 py-1 border border-border rounded disabled:opacity-50", children: "Next" })] }))] })), selectedElection && !emergencyStopForm.show && !announceResultsForm.show && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Election Analytics" }), _jsx("button", { onClick: () => {
                                            setSelectedElection(null);
                                            setAnalytics(null);
                                        }, className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), loadingAnalytics ? (_jsx("div", { className: "text-center py-8 text-slate-400", children: "Loading analytics..." })) : analytics ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Title" }), _jsx("p", { children: analytics.election.title })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Status" }), _jsx("p", { className: "capitalize", children: analytics.election.status.replace('_', ' ') })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Total Registered" }), _jsx("p", { children: analytics.election.totalRegistered })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Total Voted" }), _jsx("p", { children: analytics.election.totalVoted })] })] }), analytics.voteDistribution && analytics.voteDistribution.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "Vote Distribution" }), _jsx("div", { className: "space-y-2", children: analytics.voteDistribution.map((candidate, index) => (_jsxs("div", { className: "bg-muted/50 p-3 rounded", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: candidate.name }), _jsxs("span", { className: "text-muted-foreground ml-2", children: ["(", candidate.party, ")"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: [candidate.votes, " votes"] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [candidate.percentage.toFixed(1), "%"] })] })] }), _jsx("div", { className: "mt-2 bg-muted rounded-full h-2", children: _jsx("div", { className: "bg-primary h-2 rounded-full transition-all", style: { width: `${candidate.percentage}%` } }) })] }, index))) })] })), analytics.timeline && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "Timeline" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Created:" }), _jsx("span", { children: new Date(analytics.timeline.created).toLocaleString() })] }), analytics.timeline.votingStart && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Voting Start:" }), _jsx("span", { children: new Date(analytics.timeline.votingStart).toLocaleString() })] })), analytics.timeline.votingEnd && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Voting End:" }), _jsx("span", { children: new Date(analytics.timeline.votingEnd).toLocaleString() })] })), analytics.timeline.resultsAnnounced && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Results Announced:" }), _jsx("span", { children: new Date(analytics.timeline.resultsAnnounced).toLocaleString() })] }))] })] }))] })) : (_jsx("div", { className: "text-center py-8 text-slate-400", children: "No analytics available" }))] }) }) })), emergencyStopForm.show && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Emergency Stop Election" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Reason" }), _jsx("textarea", { value: emergencyStopForm.reason, onChange: (e) => setEmergencyStopForm(prev => ({ ...prev, reason: e.target.value })), className: "w-full px-3 py-2 border border-border rounded-lg bg-background", rows: 3, placeholder: "Reason for emergency stop..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Admin Private Key" }), _jsx("input", { type: "password", value: emergencyStopForm.privateKey, onChange: (e) => setEmergencyStopForm(prev => ({ ...prev, privateKey: e.target.value })), className: "w-full px-3 py-2 border border-border rounded-lg bg-background", placeholder: "Enter your private key..." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleEmergencyStop, disabled: processing || !emergencyStopForm.privateKey, className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50", children: processing ? 'Processing...' : 'Emergency Stop' }), _jsx("button", { onClick: () => setEmergencyStopForm({ show: false, reason: '', privateKey: '' }), className: "flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted", children: "Cancel" })] })] })] }) }) })), announceResultsForm.show && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Announce Results" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Admin Private Key" }), _jsx("input", { type: "password", value: announceResultsForm.privateKey, onChange: (e) => setAnnounceResultsForm(prev => ({ ...prev, privateKey: e.target.value })), className: "w-full px-3 py-2 border border-border rounded-lg bg-background", placeholder: "Enter your private key..." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleAnnounceResults, disabled: processing || !announceResultsForm.privateKey, className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50", children: processing ? 'Processing...' : 'Announce Results' }), _jsx("button", { onClick: () => setAnnounceResultsForm({ show: false, privateKey: '' }), className: "flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted", children: "Cancel" })] })] })] }) }) })), showCreateForm && (_jsx(CreateElectionForm, { onClose: () => setShowCreateForm(false), onSuccess: () => {
                    setShowCreateForm(false);
                    loadElections();
                } }))] }));
};
