import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, updateElectionStatus } from '../../lib/api';
import { CreateElectionForm } from './CreateElectionForm';
export const ElectionManagement = () => {
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const [addVoterForm, setAddVoterForm] = useState({ walletAddress: '', privateKey: '', loading: false });
    const [addCandidateForm, setAddCandidateForm] = useState({ walletAddress: '', privateKey: '', loading: false });
    const [timingForm, setTimingForm] = useState({ startInMinutes: 10, durationMinutes: 60, privateKey: '', loading: false, title: '', description: '' });
    const [statusChangeForm, setStatusChangeForm] = useState({ show: false, newStatus: '', loading: false });
    const fetchElections = async () => {
        const params = new URLSearchParams();
        if (status)
            params.append('status', status);
        if (electionType)
            params.append('electionType', electionType);
        if (search)
            params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', '10');
        const { data } = await api.get(`/election?${params}`);
        return data;
    };
    const loadElections = async () => {
        setLoading(true);
        setError(null);
        console.log('Loading elections...');
        try {
            const response = await fetchElections();
            console.log('Elections response:', response);
            if (response.success) {
                setElections(response.data.elections || []);
                setTotalPages(response.data.totalPages || 1);
                console.log('Elections loaded:', response.data.elections?.length || 0, 'elections');
            }
            else {
                console.error('Failed to fetch elections:', response.message);
                setError(response.message || 'Failed to load elections');
            }
        }
        catch (error) {
            console.error('Error loading elections:', error);
            setError(error?.response?.data?.message || error.message || 'Failed to load elections');
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
    const handleStatusChange = async () => {
        if (!selectedElection || !statusChangeForm.newStatus)
            return;
        alert(`Attempting to change status of election ${selectedElection.contractAddress} from ${selectedElection.status} to ${statusChangeForm.newStatus}`);
        setStatusChangeForm(prev => ({ ...prev, loading: true }));
        try {
            const response = await updateElectionStatus({
                contractAddress: selectedElection.contractAddress,
                status: statusChangeForm.newStatus
            });
            console.log('Status update response:', response);
            if (response.success) {
                setStatusChangeForm({ show: false, newStatus: '', loading: false });
                await loadElections();
                alert(`Election status successfully changed to ${statusChangeForm.newStatus}!`);
            }
            else {
                alert(`Failed: ${response.message || 'Unknown error'}`);
            }
        }
        catch (error) {
            console.error('Failed to update status:', error);
            alert(`Error: ${error?.response?.data?.message || error.message || 'Failed to update election status'}`);
        }
        finally {
            setStatusChangeForm(prev => ({ ...prev, loading: false }));
        }
    };
    const handleOpenRegistration = async () => {
        if (!selectedElection || !timingForm.privateKey)
            return;
        setTimingForm(prev => ({ ...prev, loading: true }));
        try {
            const payload = {
                startTimeFromNow: Math.max(60, Math.floor((timingForm.startInMinutes || 0) * 60)),
                durationInSeconds: Math.max(60, Math.floor((timingForm.durationMinutes || 0) * 60)),
                adminPrivateKey: timingForm.privateKey.trim()
            };
            if (timingForm.title.trim())
                payload.title = timingForm.title.trim();
            if (timingForm.description.trim())
                payload.description = timingForm.description.trim();
            const { data } = await api.put(`/election/${selectedElection.contractAddress}/timing`, payload);
            if (data.success) {
                alert('Registration opened and timing set successfully');
                setTimingForm({ startInMinutes: 10, durationMinutes: 60, privateKey: '', loading: false, title: '', description: '' });
                await loadElections();
                if (selectedElection)
                    await loadAnalytics(selectedElection.contractAddress);
            }
        }
        catch (error) {
            alert(error?.response?.data?.message || 'Failed to open registration');
            setTimingForm(prev => ({ ...prev, loading: false }));
        }
    };
    const handleAddVoterToElection = async () => {
        if (!selectedElection || !addVoterForm.walletAddress || !addVoterForm.privateKey)
            return;
        setAddVoterForm(prev => ({ ...prev, loading: true }));
        try {
            const { data } = await api.post('/voter/register-election', {
                contractAddress: selectedElection.contractAddress,
                walletAddress: addVoterForm.walletAddress.trim(),
                privateKey: addVoterForm.privateKey.trim()
            });
            if (data.success) {
                alert('Voter added to election successfully');
                setAddVoterForm({ walletAddress: '', privateKey: '', loading: false });
                await loadElections();
                if (selectedElection)
                    await loadAnalytics(selectedElection.contractAddress);
            }
        }
        catch (error) {
            alert(error?.response?.data?.message || 'Failed to add voter to election');
            setAddVoterForm(prev => ({ ...prev, loading: false }));
        }
    };
    const handleAddCandidateToElection = async () => {
        if (!selectedElection || !addCandidateForm.walletAddress || !addCandidateForm.privateKey)
            return;
        setAddCandidateForm(prev => ({ ...prev, loading: true }));
        try {
            const { data } = await api.post('/candidate/register-election', {
                contractAddress: selectedElection.contractAddress,
                walletAddress: addCandidateForm.walletAddress.trim(),
                privateKey: addCandidateForm.privateKey.trim()
            });
            if (data.success) {
                alert('Candidate added to election successfully');
                setAddCandidateForm({ walletAddress: '', privateKey: '', loading: false });
                await loadElections();
                if (selectedElection)
                    await loadAnalytics(selectedElection.contractAddress);
            }
        }
        catch (error) {
            alert(error?.response?.data?.message || 'Failed to add candidate to election');
            setAddCandidateForm(prev => ({ ...prev, loading: false }));
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
    return (_jsxs("div", { className: "max-w-7xl mx-auto py-10 px-6 space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Election Management" }), _jsx("button", { onClick: () => setShowCreateForm(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Create New Election" })] }), _jsxs("div", { className: "flex gap-4 items-end flex-wrap", children: [_jsxs("form", { onSubmit: handleSearch, className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Search by title or description", value: search, onChange: (e) => setSearch(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm" }), _jsx("button", { type: "submit", className: "px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700", children: "Search" })] }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", children: [_jsx("option", { value: "", children: "All Status" }), _jsx("option", { value: "created", children: "Created" }), _jsx("option", { value: "registration_open", children: "Registration Open" }), _jsx("option", { value: "voting_active", children: "Voting Active" }), _jsx("option", { value: "results_announced", children: "Results Announced" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] }), _jsxs("select", { value: electionType, onChange: (e) => setElectionType(e.target.value), className: "px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", children: [_jsx("option", { value: "", children: "All Types" }), _jsx("option", { value: "presidential", children: "Presidential" }), _jsx("option", { value: "parliamentary", children: "Parliamentary" }), _jsx("option", { value: "local", children: "Local" }), _jsx("option", { value: "referendum", children: "Referendum" }), _jsx("option", { value: "student", children: "Student" }), _jsx("option", { value: "corporate", children: "Corporate" })] })] }), loading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2" }), _jsx("div", { className: "text-gray-600", children: "Loading elections..." })] })) : error ? (_jsxs("div", { className: "text-center py-8", children: [_jsxs("div", { className: "text-red-600 mb-4", children: ["\u274C ", error] }), _jsx("button", { onClick: loadElections, className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Try Again" })] })) : elections.length === 0 ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-gray-500 mb-4", children: "No elections found" }), _jsx("button", { onClick: () => setShowCreateForm(true), className: "px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700", children: "Create First Election" })] })) : (_jsxs("div", { className: "bg-green-500 border border-gray-300 rounded-lg overflow-hidden shadow-sm", children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-red-500", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-4 font-medium", children: "Title" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Type" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Status" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Candidates" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Voters" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Turnout" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Created By" }), _jsx("th", { className: "text-left p-4 font-medium", children: "Actions" })] }) }), _jsx("tbody", { children: elections.map((election) => (_jsxs("tr", { className: "border-t border-gray-200 hover:bg-gray-50", children: [_jsx("td", { className: "p-4", children: _jsxs("div", { children: [_jsx("div", { className: "font-medium", children: election.title }), _jsxs("div", { className: "text-xs text-gray-500 font-mono", children: [election.contractAddress.slice(0, 10), "..."] })] }) }), _jsx("td", { className: "p-4 capitalize", children: election.electionType }), _jsx("td", { className: "p-4", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`, children: election.status.replace('_', ' ') }) }), _jsx("td", { className: "p-4", children: election.candidates?.length || 0 }), _jsxs("td", { className: "p-4", children: [election.totalVotesCast, "/", election.totalRegisteredVoters] }), _jsx("td", { className: "p-4", children: election.turnoutPercentage ? `${election.turnoutPercentage.toFixed(1)}%` : 'N/A' }), _jsx("td", { className: "p-4 text-sm", children: election.deployedBy?.name }), _jsx("td", { className: "p-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                loadAnalytics(election.contractAddress);
                                                            }, className: "px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700", children: "View" }), (election.status === 'voting_active' || election.status === 'registration_open') && (_jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                setEmergencyStopForm({ show: true, reason: '', privateKey: '' });
                                                            }, className: "px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700", children: "Stop" })), election.status === 'voting_active' && (_jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                setStatusChangeForm({ show: true, newStatus: 'voting_ended', loading: false });
                                                            }, className: "px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700", title: "End voting period", children: "End Voting" })), election.status === 'voting_ended' && (_jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                setAnnounceResultsForm({ show: true, privateKey: '' });
                                                            }, className: "px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700", children: "Results" })), _jsx("button", { onClick: () => {
                                                                setSelectedElection(election);
                                                                setStatusChangeForm({ show: true, newStatus: '', loading: false });
                                                            }, className: "px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700", title: "Change Election Status", children: "Status" })] }) })] }, election._id))) })] }) }), totalPages > 1 && (_jsxs("div", { className: "p-4 border-t border-gray-200 flex justify-center gap-2", children: [_jsx("button", { onClick: () => setPage(Math.max(1, page - 1)), disabled: page === 1, className: "px-3 py-1 border border-gray-300 rounded disabled:opacity-50 bg-white hover:bg-gray-50", children: "Previous" }), _jsxs("span", { className: "px-3 py-1 text-sm text-gray-600", children: ["Page ", page, " of ", totalPages] }), _jsx("button", { onClick: () => setPage(Math.min(totalPages, page + 1)), disabled: page === totalPages, className: "px-3 py-1 border border-gray-300 rounded disabled:opacity-50 bg-white hover:bg-gray-50", children: "Next" })] }))] })), selectedElection && !emergencyStopForm.show && !announceResultsForm.show && !statusChangeForm.show && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-green-500 border border-gray-300 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-xl", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Election Analytics" }), _jsx("button", { onClick: () => {
                                            setSelectedElection(null);
                                            setAnalytics(null);
                                        }, className: "text-gray-500 hover:text-gray-700", children: "\u2715" })] }), loadingAnalytics ? (_jsx("div", { className: "text-center py-8 text-slate-400", children: "Loading analytics..." })) : analytics ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Title" }), _jsx("p", { children: analytics.election.title })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Status" }), _jsx("p", { className: "capitalize", children: analytics.election.status.replace('_', ' ') })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Total Registered" }), _jsx("p", { children: analytics.election.totalRegistered })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-gray-600", children: "Total Voted" }), _jsx("p", { children: analytics.election.totalVoted })] })] }), analytics.voteDistribution && analytics.voteDistribution.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "Vote Distribution" }), _jsx("div", { className: "space-y-2", children: analytics.voteDistribution.map((candidate, index) => (_jsxs("div", { className: "bg-gray-100 p-3 rounded", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("span", { className: "font-medium", children: candidate.name }), _jsxs("span", { className: "text-gray-600 ml-2", children: ["(", candidate.party, ")"] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "font-medium", children: [candidate.votes, " votes"] }), _jsxs("div", { className: "text-sm text-gray-600", children: [candidate.percentage.toFixed(1), "%"] })] })] }), _jsx("div", { className: "mt-2 bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-blue-600 h-2 rounded-full transition-all", style: { width: `${candidate.percentage}%` } }) })] }, index))) })] })), analytics.timeline && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "Timeline" }), _jsxs("div", { className: "space-y-2 text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Created:" }), _jsx("span", { children: new Date(analytics.timeline.created).toLocaleString() })] }), analytics.timeline.votingStart && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Voting Start:" }), _jsx("span", { children: new Date(analytics.timeline.votingStart).toLocaleString() })] })), analytics.timeline.votingEnd && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Voting End:" }), _jsx("span", { children: new Date(analytics.timeline.votingEnd).toLocaleString() })] })), analytics.timeline.resultsAnnounced && (_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { children: "Results Announced:" }), _jsx("span", { children: new Date(analytics.timeline.resultsAnnounced).toLocaleString() })] }))] })] }))] })) : (_jsx("div", { className: "text-center py-8 text-slate-400", children: "No analytics available" })), _jsxs("div", { className: "mt-6 grid md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "p-4 border border-gray-300 rounded-lg", children: [_jsx("h3", { className: "font-medium mb-3", children: "Add Eligible Voter" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Voter Wallet Address" }), _jsx("input", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", placeholder: "0x...", value: addVoterForm.walletAddress, onChange: (e) => setAddVoterForm(prev => ({ ...prev, walletAddress: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Admin/Authorized Private Key" }), _jsx("input", { type: "password", className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", placeholder: "Enter private key", value: addVoterForm.privateKey, onChange: (e) => setAddVoterForm(prev => ({ ...prev, privateKey: e.target.value })) })] }), _jsx("button", { onClick: handleAddVoterToElection, disabled: addVoterForm.loading || !addVoterForm.walletAddress || !addVoterForm.privateKey, className: "w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm", children: addVoterForm.loading ? 'Adding...' : 'Add Voter to Election' }), _jsx("p", { className: "text-[10px] text-gray-600", children: "Voter must be registered and verified first." })] })] }), _jsxs("div", { className: "p-4 border border-gray-300 rounded-lg", children: [_jsx("h3", { className: "font-medium mb-3", children: "Add Candidate" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Candidate Wallet Address" }), _jsx("input", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", placeholder: "0x...", value: addCandidateForm.walletAddress, onChange: (e) => setAddCandidateForm(prev => ({ ...prev, walletAddress: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Admin/Authorized Private Key" }), _jsx("input", { type: "password", className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", placeholder: "Enter private key", value: addCandidateForm.privateKey, onChange: (e) => setAddCandidateForm(prev => ({ ...prev, privateKey: e.target.value })) })] }), _jsx("button", { onClick: handleAddCandidateToElection, disabled: addCandidateForm.loading || !addCandidateForm.walletAddress || !addCandidateForm.privateKey, className: "w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm", children: addCandidateForm.loading ? 'Adding...' : 'Add Candidate to Election' }), _jsxs("p", { className: "text-[10px] text-gray-600", children: ["Candidate must be registered and verified first. Max ", selectedElection?.candidates ? selectedElection?.candidates.length : 0, "/", selectedElection?.maxCandidates ?? 'N/A', " allowed."] })] })] })] }), _jsxs("div", { className: "mt-6 p-4 border border-gray-300 rounded-lg", children: [_jsx("h3", { className: "font-medium mb-3", children: "Open Registration / Set Timing" }), _jsxs("div", { className: "grid md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Title (optional)" }), _jsx("input", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", placeholder: "Update election title", value: timingForm.title, onChange: (e) => setTimingForm(prev => ({ ...prev, title: e.target.value })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Description (optional)" }), _jsx("textarea", { className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", rows: 2, placeholder: "Update election description", value: timingForm.description, onChange: (e) => setTimingForm(prev => ({ ...prev, description: e.target.value })) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "grid grid-cols-2 gap-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Start In (minutes)" }), _jsx("input", { type: "number", min: 1, className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", value: timingForm.startInMinutes, onChange: (e) => setTimingForm(prev => ({ ...prev, startInMinutes: Number(e.target.value) })) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Duration (minutes)" }), _jsx("input", { type: "number", min: 1, className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", value: timingForm.durationMinutes, onChange: (e) => setTimingForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) })) })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-xs mb-1", children: "Admin Private Key" }), _jsx("input", { type: "password", className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm", placeholder: "Enter your private key", value: timingForm.privateKey, onChange: (e) => setTimingForm(prev => ({ ...prev, privateKey: e.target.value })) })] }), _jsx("button", { onClick: handleOpenRegistration, disabled: timingForm.loading || !timingForm.privateKey, className: "w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm", children: timingForm.loading ? 'Updating...' : 'Open Registration & Set Timing' }), _jsx("p", { className: "text-[10px] text-gray-600", children: "This sets start/end on-chain and updates status to registration_open." })] })] })] })] }) }) })), emergencyStopForm.show && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white border border-gray-300 rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Emergency Stop Election" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Reason" }), _jsx("textarea", { value: emergencyStopForm.reason, onChange: (e) => setEmergencyStopForm(prev => ({ ...prev, reason: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white", rows: 3, placeholder: "Reason for emergency stop..." })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Admin Private Key" }), _jsx("input", { type: "password", value: emergencyStopForm.privateKey, onChange: (e) => setEmergencyStopForm(prev => ({ ...prev, privateKey: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white", placeholder: "Enter your private key..." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleEmergencyStop, disabled: processing || !emergencyStopForm.privateKey, className: "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50", children: processing ? 'Processing...' : 'Emergency Stop' }), _jsx("button", { onClick: () => setEmergencyStopForm({ show: false, reason: '', privateKey: '' }), className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200", children: "Cancel" })] })] })] }) }) })), announceResultsForm.show && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white border border-gray-300 rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Announce Results" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Admin Private Key" }), _jsx("input", { type: "password", value: announceResultsForm.privateKey, onChange: (e) => setAnnounceResultsForm(prev => ({ ...prev, privateKey: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white", placeholder: "Enter your private key..." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleAnnounceResults, disabled: processing || !announceResultsForm.privateKey, className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50", children: processing ? 'Processing...' : 'Announce Results' }), _jsx("button", { onClick: () => setAnnounceResultsForm({ show: false, privateKey: '' }), className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200", children: "Cancel" })] })] })] }) }) })), statusChangeForm.show && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-white border border-gray-300 rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Change Election Status" }), _jsxs("p", { className: "text-sm text-gray-600 mb-4", children: ["Current Status: ", _jsx("span", { className: "font-medium capitalize", children: selectedElection?.status.replace('_', ' ') })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "New Status" }), _jsxs("select", { value: statusChangeForm.newStatus, onChange: (e) => setStatusChangeForm(prev => ({ ...prev, newStatus: e.target.value })), className: "w-full px-3 py-2 border border-gray-300 rounded-lg bg-white", children: [_jsx("option", { value: "", children: "Select new status..." }), _jsx("option", { value: "created", children: "Created" }), _jsx("option", { value: "registration_open", children: "Registration Open" }), _jsx("option", { value: "registration_closed", children: "Registration Closed" }), _jsx("option", { value: "voting_active", children: "Voting Active" }), _jsx("option", { value: "voting_ended", children: "Voting Ended" }), _jsx("option", { value: "results_announced", children: "Results Announced" }), _jsx("option", { value: "cancelled", children: "Cancelled" })] })] }), _jsx("div", { className: "p-3 bg-yellow-50 border border-yellow-200 rounded-lg", children: _jsxs("p", { className: "text-xs text-yellow-800", children: [_jsx("strong", { children: "Warning:" }), " Changing election status directly bypasses blockchain validation. Use with caution and ensure the new status reflects the actual election state."] }) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleStatusChange, disabled: statusChangeForm.loading || !statusChangeForm.newStatus, className: "flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50", children: statusChangeForm.loading ? 'Updating...' : 'Update Status' }), _jsx("button", { onClick: () => setStatusChangeForm({ show: false, newStatus: '', loading: false }), className: "flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200", children: "Cancel" })] })] })] }) }) })), showCreateForm && (_jsx(CreateElectionForm, { onClose: () => setShowCreateForm(false), onSuccess: () => {
                    setShowCreateForm(false);
                    loadElections();
                } }))] }));
};
