import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { ElectionRegistrationForm } from '../../components/ElectionRegistrationForm';
import { RegistrationStatus } from '../../components/RegistrationStatus';
export const ElectionRegistrationPage = () => {
    const { contractAddress } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userType, setUserType] = useState('voter');
    const [showRegistrationForm, setShowRegistrationForm] = useState(false);
    const [registrationStatus, setRegistrationStatus] = useState('idle');
    const [registrationMessage, setRegistrationMessage] = useState('');
    useEffect(() => {
        if (!contractAddress) {
            setError('Contract address is required');
            setLoading(false);
            return;
        }
        loadElectionDetails();
    }, [contractAddress]);
    const loadElectionDetails = async () => {
        try {
            const { data } = await api.get(`/election/${contractAddress}`);
            if (data.success) {
                setElection(data.data.election);
            }
            else {
                setError('Election not found');
            }
        }
        catch (error) {
            setError(error.response?.data?.message || 'Failed to load election details');
        }
        finally {
            setLoading(false);
        }
    };
    const handleRegistrationSuccess = () => {
        setShowRegistrationForm(false);
        setRegistrationStatus('success');
    };
    const handleRegistrationError = (message) => {
        setRegistrationStatus('error');
        setRegistrationMessage(message);
    };
    const handleCloseStatus = () => {
        setRegistrationStatus('idle');
        setRegistrationMessage('');
        // Navigate back to appropriate dashboard
        if (userType === 'candidate') {
            navigate('/candidate/dashboard');
        }
        else {
            navigate('/voter/dashboard');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading election details..." })] }) }));
    }
    if (error || !election) {
        return (_jsx("div", { className: "min-h-screen bg-background flex items-center justify-center", children: _jsxs("div", { className: "text-center max-w-md", children: [_jsx("div", { className: "rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto mb-4", children: _jsx("svg", { className: "h-6 w-6 text-red-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) }) }), _jsx("h1", { className: "text-xl font-semibold mb-2", children: "Election Not Found" }), _jsx("p", { className: "text-muted-foreground mb-6", children: error }), _jsx("button", { onClick: () => navigate('/'), className: "px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90", children: "Go Home" })] }) }));
    }
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "border-b border-border bg-card", children: _jsx("div", { className: "container mx-auto px-6 py-4", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("button", { onClick: () => navigate(-1), className: "text-muted-foreground hover:text-foreground", children: "\u2190 Back" }), _jsx("h1", { className: "text-xl font-semibold", children: "Register for Election" })] }) }) }), _jsx("div", { className: "container mx-auto px-6 py-8", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-6 mb-8", children: [_jsxs("div", { className: "flex items-start justify-between mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-semibold mb-2", children: election.title }), _jsx("p", { className: "text-muted-foreground", children: election.description })] }), _jsx("span", { className: `px-3 py-1 rounded-full text-xs font-medium ${election.status === 'registration_open'
                                                ? 'bg-green-100 text-green-800'
                                                : election.status === 'voting_active'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-gray-100 text-gray-800'}`, children: election.status.replace('_', ' ') })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Election Type" }), _jsx("p", { className: "text-sm text-muted-foreground capitalize", children: election.electionType })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Candidates" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [election.candidates.length, " / ", election.maxCandidates, " registered"] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-2", children: "Voters" }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [election.totalRegisteredVoters, " registered"] })] })] }), _jsxs("div", { className: "mt-6", children: [_jsx("h3", { className: "font-medium mb-2", children: "Contract Address" }), _jsx("p", { className: "text-sm font-mono bg-muted/50 p-3 rounded border break-all", children: election.contractAddress })] })] }), election.status === 'registration_open' && user ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Choose Registration Type" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "rounded-full h-10 w-10 bg-blue-100 flex items-center justify-center mr-3", children: _jsx("svg", { className: "h-5 w-5 text-blue-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), _jsx("h4", { className: "font-medium", children: "Register as Candidate" })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Run for office and let voters choose you. You'll be able to create your campaign profile and manifesto." }), _jsxs("div", { className: "text-xs text-muted-foreground mb-4", children: [_jsx("p", { children: "\u2022 Must be a verified candidate" }), _jsx("p", { children: "\u2022 One-time registration per election" }), _jsx("p", { children: "\u2022 Requires blockchain transaction" })] }), _jsx("button", { onClick: () => {
                                                                setUserType('candidate');
                                                                setShowRegistrationForm(true);
                                                            }, disabled: election.candidates.length >= election.maxCandidates, className: "w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed", children: election.candidates.length >= election.maxCandidates ? 'Candidate Slots Full' : 'Register as Candidate' })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsxs("div", { className: "flex items-center mb-4", children: [_jsx("div", { className: "rounded-full h-10 w-10 bg-green-100 flex items-center justify-center mr-3", children: _jsx("svg", { className: "h-5 w-5 text-green-600", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }), _jsx("h4", { className: "font-medium", children: "Register as Voter" })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: "Register to vote in this election. You'll be able to cast your vote when voting begins." }), _jsxs("div", { className: "text-xs text-muted-foreground mb-4", children: [_jsx("p", { children: "\u2022 Must be a verified voter" }), _jsx("p", { children: "\u2022 One-time registration per election" }), _jsx("p", { children: "\u2022 Requires blockchain transaction" })] }), _jsx("button", { onClick: () => {
                                                                setUserType('voter');
                                                                setShowRegistrationForm(true);
                                                            }, className: "w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700", children: "Register as Voter" })] })] })] }), election.candidates.length > 0 && (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h3", { className: "font-medium mb-4", children: "Current Candidates" }), _jsx("div", { className: "space-y-3", children: election.candidates.map((candidate, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-muted/50 rounded-lg", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: candidate.name || 'Anonymous' }), _jsx("div", { className: "text-sm text-muted-foreground", children: candidate.party || 'Independent' })] }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["ID: ", candidate.onChainId] })] }, index))) })] }))] })) : (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6 text-center", children: [_jsx("h3", { className: "font-medium mb-2", children: "Registration Closed" }), _jsx("p", { className: "text-muted-foreground", children: "Registration for this election is no longer available." })] }))] }) }), showRegistrationForm && (_jsx(ElectionRegistrationForm, { election: election, userType: userType, walletAddress: user?.walletAddress || '', onSuccess: handleRegistrationSuccess, onCancel: () => setShowRegistrationForm(false) })), _jsx(RegistrationStatus, { status: registrationStatus, message: registrationMessage, userType: userType, electionTitle: election.title, onClose: handleCloseStatus })] }));
};
