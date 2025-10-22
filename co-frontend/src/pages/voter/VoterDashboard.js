import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, registerVoterForElection } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { VoterAnalytics } from './VoterAnalytics';
import { ElectionResults } from '../../components/ElectionResults';
export const VoterDashboard = () => {
    const user = useAuthStore(s => s.user);
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [voterElections, setVoterElections] = useState([]);
    const [availableElections, setAvailableElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [registering, setRegistering] = useState('');
    const [voting, setVoting] = useState('');
    const [selectedElection, setSelectedElection] = useState(null);
    const [privateKey, setPrivateKey] = useState('');
    const [selectedResultsContractAddress, setSelectedResultsContractAddress] = useState('');
    const loadProfile = async () => {
        if (!user?.walletAddress)
            return;
        try {
            const { data } = await api.get(`/voter/profile/${user.walletAddress}`);
            if (data.success) {
                setProfile(data.data.voter);
            }
        }
        catch (error) {
            console.error('Failed to load profile:', error);
        }
    };
    const loadVoterElections = async () => {
        if (!user?.walletAddress)
            return;
        try {
            console.log('Loading voter elections for wallet:', user.walletAddress);
            const { data } = await api.get(`/voter/${user.walletAddress}/elections`);
            console.log('Raw voter elections response:', data);
            if (data.success) {
                console.log('Loaded voter elections:', data.data.elections);
                // Filter out any elections with malformed data
                const validElections = data.data.elections.filter((election) => election && election.electionId && election.electionId._id);
                console.log('Valid voter elections after filtering:', validElections);
                setVoterElections(validElections);
            }
        }
        catch (error) {
            console.error('Failed to load voter elections:', error);
        }
    };
    const loadAvailableElections = async () => {
        try {
            // Query backend for elections with registration open
            const { data } = await api.get('/election', { params: { status: 'registration_open', limit: 50 } });
            if (data.success) {
                const registeredElectionIds = voterElections.map(e => e.electionId._id);
                const available = (data.data.elections || []).filter((election) => !registeredElectionIds.includes(election._id));
                setAvailableElections(available);
            }
        }
        catch (error) {
            console.error('Failed to load available elections:', error);
        }
    };
    const registerForElection = async (contractAddress) => {
        if (!privateKey.trim()) {
            alert('Please enter your wallet private key');
            return;
        }
        setRegistering(contractAddress);
        try {
            const result = await registerVoterForElection({
                contractAddress,
                walletAddress: user?.walletAddress || '',
                privateKey: privateKey.trim()
            });
            if (result.success) {
                alert('Successfully registered for election!');
                setPrivateKey('');
                await loadVoterElections();
                await loadAvailableElections();
            }
            else {
                alert(result.message || 'Failed to register for election');
            }
        }
        catch (error) {
            alert(error.response?.data?.message || 'Failed to register for election');
        }
        finally {
            setRegistering('');
        }
    };
    const castVote = async (candidateId, contractAddress) => {
        if (!privateKey.trim()) {
            alert('Please enter your wallet private key');
            return;
        }
        setVoting(contractAddress);
        try {
            const { data } = await api.post('/voter/vote', {
                contractAddress,
                candidateId,
                privateKey: privateKey.trim()
            });
            if (data.success) {
                alert('Vote cast successfully!');
                setPrivateKey('');
                setSelectedElection(null);
                await loadVoterElections();
            }
        }
        catch (error) {
            alert(error.response?.data?.message || 'Failed to cast vote');
        }
        finally {
            setVoting('');
        }
    };
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await loadProfile();
            await loadVoterElections();
            setLoading(false);
        };
        loadData();
    }, [user]);
    useEffect(() => {
        // Load available elections regardless of how many the voter is already in
        loadAvailableElections();
    }, [voterElections]);
    const renderDashboard = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-semibold text-blue-600", children: profile?.verificationStatus === 'verified' ? '✓' : profile?.verificationStatus === 'rejected' ? '✗' : '⏳' }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Verification Status" }), _jsx("div", { className: "text-xs mt-1 capitalize", children: profile?.verificationStatus })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-semibold text-green-600", children: voterElections.length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Elections Registered" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-semibold text-purple-600", children: voterElections.filter(e => e.hasVoted).length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Votes Cast" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-semibold text-orange-600", children: availableElections.length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Available Elections" })] })] }), profile?.verificationStatus === 'pending' && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-yellow-800", children: "Verification Pending" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Your voter registration is under review. You'll be notified once verified." })] })), profile?.verificationStatus === 'rejected' && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-red-800", children: "Verification Rejected" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: "Your voter registration was rejected. Please contact support for more information." })] })), profile?.verificationStatus === 'verified' && (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Quick Actions" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("button", { onClick: () => setCurrentView('vote'), className: "p-4 bg-primary/10 border border-primary/20 rounded-lg text-left hover:bg-primary/20 transition-colors", children: [_jsx("div", { className: "font-medium", children: "Cast Your Vote" }), _jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "Vote in active elections" })] }), _jsxs("button", { onClick: () => setCurrentView('register'), className: "p-4 bg-green-50 border border-green-200 rounded-lg text-left hover:bg-green-100 transition-colors", children: [_jsx("div", { className: "font-medium", children: "Register for Elections" }), _jsx("div", { className: "text-sm text-muted-foreground mt-1", children: "Join upcoming elections" })] })] })] })), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Recent Activity" }), voterElections.length > 0 ? (voterElections.filter(election => election?.electionId?._id).slice(0, 3).map((election) => (_jsxs("div", { className: "flex justify-between items-center py-3 border-b border-border last:border-b-0", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: election.electionId.title || 'Untitled Election' }), _jsxs("div", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType || 'Unknown Type', " \u2022 ", election.electionId.status?.replace('_', ' ') || 'Unknown Status'] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-sm font-medium ${election.hasVoted ? 'text-green-600' : 'text-yellow-600'}`, children: election.hasVoted ? 'Voted' : 'Registered' }), election.votedAt && (_jsx("div", { className: "text-xs text-muted-foreground", children: new Date(election.votedAt).toLocaleDateString() }))] })] }, election.electionId._id)))) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No election activity yet" }))] })] }));
    const renderProfile = () => (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Voter Profile" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Name" }), _jsx("div", { className: "mt-1 text-sm", children: profile?.name })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Age" }), _jsx("div", { className: "mt-1 text-sm", children: profile?.age })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Gender" }), _jsx("div", { className: "mt-1 text-sm", children: profile?.gender })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Email" }), _jsx("div", { className: "mt-1 text-sm", children: profile?.email })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Voter ID" }), _jsx("div", { className: "mt-1 text-sm font-mono bg-muted/50 p-2 rounded", children: profile?.voterId })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Wallet Address" }), _jsx("div", { className: "mt-1 text-xs font-mono bg-muted/50 p-2 rounded break-all", children: profile?.walletAddress })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Verification Status" }), _jsx("div", { className: "mt-1", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-medium rounded-full ${profile?.verificationStatus === 'verified'
                                                    ? 'bg-green-100 text-green-800'
                                                    : profile?.verificationStatus === 'rejected'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'}`, children: profile?.verificationStatus }) })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Member Since" }), _jsx("div", { className: "mt-1 text-sm", children: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A' })] })] })] })] }) }));
    const renderElections = () => (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "My Elections" }), voterElections.length > 0 ? (_jsx("div", { className: "space-y-4", children: voterElections.filter(election => election?.electionId?._id).map((election) => (_jsx("div", { className: "border border-border rounded-lg p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: election.electionId.title || 'Untitled Election' }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType || 'Unknown Type', " Election"] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: ["Status: ", election.electionId.status?.replace('_', ' ') || 'Unknown Status'] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Contract: ", election.electionId.contractAddress?.slice(0, 10) || 'Unknown', "..."] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: `text-sm font-medium ${election.hasVoted ? 'text-green-600' : 'text-blue-600'}`, children: election.hasVoted ? 'Voted' : 'Registered' }), election.votedAt && (_jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["Voted: ", new Date(election.votedAt).toLocaleDateString()] })), _jsx("button", { onClick: () => {
                                                if (election.electionId.contractAddress) {
                                                    navigate(`/elections/${election.electionId.contractAddress}`);
                                                }
                                            }, className: "mt-2 text-xs text-primary hover:underline", children: "View Details" })] })] }) }, election.electionId._id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDDF3\uFE0F" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Elections Yet" }), _jsx("p", { className: "text-muted-foreground", children: "You haven't registered for any elections yet." }), _jsx("button", { onClick: () => setCurrentView('register'), className: "mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90", children: "Register for Elections" })] }))] }) }));
    const renderVoting = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Cast Your Vote" }), _jsx("div", { className: "space-y-4", children: voterElections
                            .filter(e => e.electionId && e.electionId.status && ['voting_active', 'registration_open'].includes(e.electionId.status) && !e.hasVoted)
                            .map((election) => (_jsxs("div", { className: "border border-border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: election.electionId.title || 'Untitled Election' }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType || 'Unknown Type', " Election"] })] }), _jsx("span", { className: `text-xs px-2 py-1 rounded-full ${election.electionId.status === 'voting_active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'}`, children: election.electionId.status === 'voting_active' ? 'Voting Active' : 'Registered' })] }), _jsx("button", { onClick: () => {
                                        // Create an Election object for the modal
                                        setSelectedElection({
                                            _id: election.electionId._id,
                                            title: election.electionId.title || 'Untitled Election',
                                            description: '',
                                            electionType: election.electionId.electionType || 'general',
                                            contractAddress: election.electionId.contractAddress,
                                            status: election.electionId.status || 'voting_active',
                                            candidates: [],
                                            totalRegisteredVoters: 0,
                                            totalVotesCast: 0,
                                            maxCandidates: 0
                                        });
                                    }, disabled: election.electionId.status !== 'voting_active', className: `w-full py-2 rounded-lg transition-colors ${election.electionId.status === 'voting_active'
                                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                        : 'bg-muted text-muted-foreground cursor-not-allowed'}`, children: election.electionId.status === 'voting_active'
                                        ? 'Vote in this Election'
                                        : 'Voting Not Started' })] }, election.electionId._id))) }), voterElections.filter(e => e.electionId && e.electionId.status && ['voting_active', 'registration_open'].includes(e.electionId.status) && !e.hasVoted).length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\u2705" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Active Voting" }), _jsx("p", { className: "text-muted-foreground mb-4", children: voterElections.length === 0
                                    ? "You haven't registered for any elections yet."
                                    : voterElections.every(e => e.hasVoted)
                                        ? "You have voted in all your registered elections. Thank you for participating!"
                                        : "No elections are currently accepting votes." }), voterElections.length === 0 && (_jsx("button", { onClick: () => setCurrentView('register'), className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90", children: "Register for Elections" }))] }))] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "\uD83D\uDCCA View Election Results" }), _jsx("div", { className: "space-y-4", children: voterElections
                            .filter(e => e.electionId && e.electionId.status === 'results_announced')
                            .map((election) => (_jsxs("div", { className: "border border-border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: election.electionId.title || 'Untitled Election' }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType || 'Unknown Type', " Election"] }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: election.hasVoted ? '✅ You voted in this election' : '⚠️ You did not vote in this election' })] }), _jsx("span", { className: "text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800", children: "Results Announced" })] }), _jsx("button", { onClick: () => {
                                        setSelectedResultsContractAddress(election.electionId.contractAddress);
                                        setCurrentView('results');
                                    }, className: "w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "View Results" })] }, election.electionId._id))) }), voterElections.filter(e => e.electionId && e.electionId.status === 'results_announced').length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCCA" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Results Available" }), _jsx("p", { className: "text-muted-foreground", children: "Results will appear here when elections you participated in have been completed and results announced." })] }))] }), selectedElection && (_jsx(VotingModal, { election: selectedElection, onClose: () => setSelectedElection(null), onVote: castVote, voting: voting, privateKey: privateKey, setPrivateKey: setPrivateKey }))] }));
    const renderRegistration = () => (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-semibold text-lg mb-4", children: "Register for Elections" }), availableElections.length > 0 ? (_jsx("div", { className: "space-y-4", children: availableElections.map((election) => (_jsx("div", { className: "border border-border rounded-lg p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: election.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: election.description }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize mt-1", children: [election.electionType, " Election"] }), _jsxs("div", { className: "text-xs text-muted-foreground mt-2", children: [_jsxs("span", { children: ["Candidates: ", election.candidates?.length || 0] }), _jsx("span", { className: "mx-2", children: "\u2022" }), _jsxs("span", { children: ["Max: ", election.maxCandidates] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: "bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full", children: "Registration Open" }), _jsxs("div", { className: "mt-3", children: [_jsx("input", { type: "password", placeholder: "Private Key", value: privateKey, onChange: (e) => setPrivateKey(e.target.value), className: "text-xs p-2 border rounded w-full mb-2" }), _jsx("button", { onClick: () => registerForElection(election.contractAddress), disabled: registering === election.contractAddress || !privateKey.trim(), className: "w-full text-xs bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 disabled:opacity-50", children: registering === election.contractAddress ? 'Registering...' : 'Register' })] })] })] }) }, election._id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDCDD" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Available Elections" }), _jsx("p", { className: "text-muted-foreground", children: "There are no elections open for registration at the moment." })] }))] }) }));
    const renderCurrentView = () => {
        switch (currentView) {
            case 'profile':
                return renderProfile();
            case 'elections':
                return renderElections();
            case 'vote':
                return renderVoting();
            case 'register':
                return renderRegistration();
            case 'analytics':
                return _jsx(VoterAnalytics, {});
            case 'results':
                return selectedResultsContractAddress ? (_jsx(ElectionResults, { contractAddress: selectedResultsContractAddress, onClose: () => {
                        setCurrentView('dashboard');
                        setSelectedResultsContractAddress('');
                    } })) : (_jsxs("div", { className: "text-center p-8", children: [_jsx("p", { className: "text-muted-foreground", children: "No election selected for results viewing." }), _jsx("button", { onClick: () => setCurrentView('dashboard'), className: "mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg", children: "Back to Dashboard" })] }));
            default:
                return renderDashboard();
        }
    };
    if (loading)
        return _jsx("div", { className: "p-8 text-sm text-slate-400", children: "Loading..." });
    if (!profile)
        return _jsx("div", { className: "p-8 text-sm text-red-400", children: "Failed to load profile" });
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "border-b border-border bg-card", children: _jsxs("div", { className: "container mx-auto px-6", children: [_jsxs("div", { className: "flex items-center justify-between py-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-xl font-semibold", children: "Voter Dashboard" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Welcome back, ", profile.name] })] }), _jsx("div", { className: "flex items-center gap-4", children: _jsx("span", { className: `text-xs px-2 py-1 rounded-full ${profile.verificationStatus === 'verified'
                                            ? 'bg-green-100 text-green-800'
                                            : profile.verificationStatus === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'}`, children: profile.verificationStatus }) })] }), _jsxs("nav", { className: "flex space-x-8", children: [_jsx("button", { onClick: () => setCurrentView('dashboard'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'dashboard'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Dashboard" }), _jsx("button", { onClick: () => setCurrentView('profile'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'profile'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Profile" }), _jsxs("button", { onClick: () => setCurrentView('elections'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'elections'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: ["My Elections (", voterElections.length, ")"] }), _jsx("button", { onClick: () => setCurrentView('analytics'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'analytics'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Analytics" }), profile.verificationStatus === 'verified' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => setCurrentView('vote'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'vote'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Vote" }), _jsx("button", { onClick: () => setCurrentView('register'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'register'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Register for Elections" }), _jsx("button", { onClick: () => setCurrentView('results'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'results'
                                                ? 'border-primary text-primary'
                                                : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Results" })] }))] })] }) }), _jsx("div", { className: "container mx-auto px-6 py-8", children: renderCurrentView() })] }));
};
// Voting Modal Component
const VotingModal = ({ election, onClose, onVote, voting, privateKey, setPrivateKey }) => {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const loadCandidates = async () => {
            try {
                const { data } = await api.get(`/election/${election.contractAddress}`);
                if (data.success) {
                    setCandidates(data.data.election.candidates || []);
                }
            }
            catch (error) {
                console.error('Failed to load candidates:', error);
            }
            finally {
                setLoading(false);
            }
        };
        loadCandidates();
    }, [election.contractAddress]);
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold", children: election.title }), _jsx("p", { className: "text-muted-foreground", children: "Select a candidate to vote for" })] }), _jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), loading ? (_jsx("div", { className: "text-center py-8", children: "Loading candidates..." })) : (_jsxs("div", { className: "space-y-4", children: [candidates.map((candidate) => (_jsx("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedCandidate === candidate.onChainId
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border hover:border-primary/50'}`, onClick: () => setSelectedCandidate(candidate.onChainId), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: candidate.candidateId?.name || 'Unknown' }), _jsx("p", { className: "text-sm text-muted-foreground", children: candidate.candidateId?.party || 'Independent' })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", checked: selectedCandidate === candidate.onChainId, onChange: () => setSelectedCandidate(candidate.onChainId), className: "mr-2" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: ["ID: ", candidate.onChainId] })] })] }) }, candidate.onChainId))), _jsxs("div", { className: "mt-6 space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Private Key (required for blockchain transaction)" }), _jsx("input", { type: "password", value: privateKey, onChange: (e) => setPrivateKey(e.target.value), placeholder: "Enter your wallet private key", className: "w-full p-3 border border-border rounded-lg" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: onClose, className: "flex-1 py-3 border border-border rounded-lg hover:bg-muted", children: "Cancel" }), _jsx("button", { onClick: () => {
                                                    if (selectedCandidate !== null) {
                                                        onVote(selectedCandidate, election.contractAddress);
                                                    }
                                                }, disabled: selectedCandidate === null || !privateKey.trim() || voting === election.contractAddress, className: "flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50", children: voting === election.contractAddress ? 'Casting Vote...' : 'Cast Vote' })] })] })] }))] }) }) }));
};
