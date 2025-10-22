import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api, registerCandidateForElection } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { CandidateAnalytics } from './CandidateAnalytics';
import { ElectionResults } from '../../components/ElectionResults';
export const CandidateDashboard = () => {
    const user = useAuthStore(s => s.user);
    const [profile, setProfile] = useState(null);
    const [availableElections, setAvailableElections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState('');
    const [currentView, setCurrentView] = useState('dashboard');
    const [registerForm, setRegisterForm] = useState({
        contractAddress: '',
        privateKey: ''
    });
    const [selectedResultsContractAddress, setSelectedResultsContractAddress] = useState('');
    const loadProfile = async () => {
        if (!user?.walletAddress)
            return;
        setLoading(true);
        try {
            const { data } = await api.get(`/candidate/profile/${user.walletAddress}`);
            if (data.success) {
                setProfile(data.data.candidate);
            }
        }
        catch (error) {
            console.error('Failed to load profile:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadAvailableElections = async () => {
        try {
            const { data } = await api.get('/election?status=registration_open');
            if (data.success) {
                // Filter out elections where candidate is already registered
                const filtered = data.data.elections.filter((election) => !election.candidates.some(c => c.candidateId === profile?._id));
                setAvailableElections(filtered);
            }
        }
        catch (error) {
            console.error('Failed to load elections:', error);
        }
    };
    const registerForElection = async (contractAddress) => {
        if (!profile || !registerForm.privateKey) {
            alert('Please enter your private key');
            return;
        }
        setRegistering(contractAddress);
        try {
            const result = await registerCandidateForElection({
                contractAddress,
                walletAddress: user?.walletAddress || '',
                privateKey: registerForm.privateKey
            });
            if (result.success) {
                alert('Successfully registered for election!');
                setRegisterForm({ contractAddress: '', privateKey: '' });
                await loadProfile();
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
    useEffect(() => {
        loadProfile();
    }, [user]);
    useEffect(() => {
        if (profile) {
            loadAvailableElections();
        }
    }, [profile]);
    const renderDashboard = () => (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-semibold text-blue-600", children: profile?.verificationStatus === 'verified' ? '✓' : profile?.verificationStatus === 'rejected' ? '✗' : '⏳' }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Verification Status" }), _jsx("div", { className: "text-xs mt-1 capitalize", children: profile?.verificationStatus })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-semibold text-green-600", children: profile?.elections?.length || 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Elections Participated" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-semibold text-purple-600", children: profile?.elections?.reduce((sum, e) => sum + e.votesReceived, 0) || 0 }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Votes Received" })] })] }), profile?.verificationStatus === 'pending' && (_jsxs("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-yellow-800", children: "Verification Pending" }), _jsx("p", { className: "text-sm text-yellow-700 mt-1", children: "Your candidate application is under review. You'll be notified once verified." })] })), profile?.verificationStatus === 'rejected' && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsx("h3", { className: "font-medium text-red-800", children: "Application Rejected" }), _jsx("p", { className: "text-sm text-red-700 mt-1", children: "Your candidate application was rejected. Please contact support for more information." })] })), profile?.elections && profile.elections.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "Your Elections" }), _jsx("div", { className: "space-y-3", children: profile.elections.slice(0, 3).map((election, index) => (_jsx("div", { className: "bg-card border border-border rounded-lg p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium", children: election.electionId.title }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType, " \u2022 ", election.electionId.status.replace('_', ' ')] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-lg font-semibold", children: election.votesReceived }), _jsx("div", { className: "text-xs text-muted-foreground", children: "votes" })] })] }) }, index))) })] })), profile?.verificationStatus === 'verified' && availableElections.length > 0 && (_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "Available Elections" }), _jsx("div", { className: "space-y-3", children: availableElections.slice(0, 2).map((election) => (_jsx("div", { className: "bg-card border border-border rounded-lg p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: "font-medium", children: election.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: election.description }), _jsxs("p", { className: "text-xs text-muted-foreground mt-1", children: [election.candidates.length, "/", election.maxCandidates, " candidates registered"] })] }), _jsx("button", { onClick: () => {
                                            setRegisterForm({ ...registerForm, contractAddress: election.contractAddress });
                                            setCurrentView('register');
                                        }, className: "px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90", children: "Register" })] }) }, election._id))) })] }))] }));
    const renderProfile = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Candidate Profile" }), profile && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Name" }), _jsx("p", { className: "text-lg", children: profile.name })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Party" }), _jsx("p", { children: profile.party })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Age" }), _jsx("p", { children: profile.age })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Gender" }), _jsx("p", { children: profile.gender })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Email" }), _jsx("p", { children: profile.email })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Phone" }), _jsx("p", { children: profile.phone })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Candidate ID" }), _jsx("p", { className: "font-mono text-sm", children: profile.candidateId })] }), _jsxs("div", { children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Wallet Address" }), _jsx("p", { className: "font-mono text-sm break-all", children: profile.walletAddress })] })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "text-sm font-medium text-muted-foreground", children: "Manifesto" }), _jsx("div", { className: "mt-2 bg-muted/50 p-4 rounded-lg", children: _jsx("p", { className: "text-sm whitespace-pre-wrap", children: profile.manifesto }) })] })] }))] }));
    const renderElections = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold", children: "My Elections" }), profile?.elections && profile.elections.length > 0 ? (_jsx("div", { className: "space-y-4", children: profile.elections.map((election, index) => (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-medium", children: election.electionId.title }), _jsxs("p", { className: "text-sm text-muted-foreground capitalize", children: [election.electionId.electionType, " Election"] })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${election.electionId.status === 'results_announced'
                                        ? 'bg-gray-100 text-gray-800'
                                        : election.electionId.status === 'voting_active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-blue-100 text-blue-800'}`, children: election.electionId.status.replace('_', ' ') })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("div", { className: "text-2xl font-semibold", children: election.votesReceived }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Votes Received" })] }), _jsxs("div", { children: [_jsxs("div", { className: "text-sm font-mono", children: [election.electionId.contractAddress.slice(0, 10), "..."] }), _jsx("div", { className: "text-xs text-muted-foreground", children: "Contract Address" })] })] }), election.electionId.status === 'results_announced' && (_jsx("div", { className: "mt-4", children: _jsx("button", { onClick: () => {
                                    setSelectedResultsContractAddress(election.electionId.contractAddress);
                                    setCurrentView('results');
                                }, className: "w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors", children: "\uD83D\uDCCA View Election Results" }) }))] }, index))) })) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No elections participated yet" }))] }));
    const renderRegister = () => (_jsxs("div", { className: "space-y-6", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Register for Elections" }), profile?.verificationStatus !== 'verified' ? (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4", children: _jsx("p", { className: "text-yellow-800", children: "You must be verified before registering for elections." }) })) : availableElections.length > 0 ? (_jsx("div", { className: "space-y-4", children: availableElections.map((election) => (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("div", { className: "flex justify-between items-start mb-4", children: _jsxs("div", { className: "flex-1", children: [_jsx("h3", { className: "text-lg font-medium", children: election.title }), _jsx("p", { className: "text-sm text-muted-foreground", children: election.description }), _jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: ["Type: ", election.electionType, " \u2022 Status: ", election.status.replace('_', ' ')] }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["Candidates: ", election.candidates.length, "/", election.maxCandidates] })] }) }), registerForm.contractAddress === election.contractAddress && (_jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Private Key" }), _jsx("input", { type: "password", value: registerForm.privateKey, onChange: (e) => setRegisterForm({ ...registerForm, privateKey: e.target.value }), placeholder: "Enter your private key for blockchain registration", className: "w-full px-3 py-2 border border-border rounded-lg bg-background" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your private key is used to register on the blockchain and is not stored." })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => registerForElection(election.contractAddress), disabled: registering === election.contractAddress || !registerForm.privateKey, className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50", children: registering === election.contractAddress ? 'Registering...' : 'Confirm Registration' }), _jsx("button", { onClick: () => setRegisterForm({ contractAddress: '', privateKey: '' }), className: "px-4 py-2 border border-border rounded-lg hover:bg-muted", children: "Cancel" })] })] })), registerForm.contractAddress !== election.contractAddress && (_jsx("button", { onClick: () => setRegisterForm({ ...registerForm, contractAddress: election.contractAddress }), disabled: election.candidates.length >= election.maxCandidates, className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50", children: election.candidates.length >= election.maxCandidates ? 'Full' : 'Register for Election' }))] }, election._id))) })) : (_jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No elections available for registration" }))] }));
    const renderCurrentView = () => {
        switch (currentView) {
            case 'profile':
                return renderProfile();
            case 'elections':
                return renderElections();
            case 'register':
                return renderRegister();
            case 'analytics':
                return _jsx(CandidateAnalytics, {});
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
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "border-b border-border bg-card", children: _jsxs("div", { className: "max-w-7xl mx-auto px-6", children: [_jsxs("div", { className: "flex justify-between items-center py-4", children: [_jsxs("div", { className: "flex items-center space-x-4", children: [_jsx("h1", { className: "text-xl font-semibold", children: "Candidate Portal" }), _jsxs("span", { className: "text-sm text-muted-foreground", children: [profile.name, " \u2022 ", profile.party] })] }), _jsx("div", { className: "text-sm text-muted-foreground", children: profile.candidateId })] }), _jsxs("nav", { className: "flex space-x-8", children: [_jsx("button", { onClick: () => setCurrentView('dashboard'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'dashboard'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Dashboard" }), _jsx("button", { onClick: () => setCurrentView('profile'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'profile'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Profile" }), _jsxs("button", { onClick: () => setCurrentView('elections'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'elections'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: ["My Elections (", profile.elections?.length || 0, ")"] }), _jsx("button", { onClick: () => setCurrentView('analytics'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'analytics'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Analytics" }), _jsx("button", { onClick: () => setCurrentView('results'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'results'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Results" }), profile.verificationStatus === 'verified' && (_jsx("button", { onClick: () => setCurrentView('register'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'register'
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Register for Elections" }))] })] }) }), _jsx("div", { className: "max-w-7xl mx-auto py-10 px-6", children: renderCurrentView() })] }));
};
