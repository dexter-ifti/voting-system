import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
export const VoterElectionView = () => {
    const { contractAddress } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore(s => s.user);
    const [election, setElection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [registering, setRegistering] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [privateKey, setPrivateKey] = useState('');
    const [showVoteModal, setShowVoteModal] = useState(false);
    const [showRegistrationModal, setShowRegistrationModal] = useState(false);
    const loadElection = async () => {
        if (!contractAddress)
            return;
        setLoading(true);
        try {
            const { data } = await api.get(`/election/${contractAddress}`);
            if (data.success) {
                const electionData = data.data.election;
                // Check if voter is registered and has voted
                if (user?.walletAddress) {
                    try {
                        const voterData = await api.get(`/voter/${user.walletAddress}/elections`);
                        if (voterData.data.success) {
                            const voterElections = voterData.data.elections;
                            const thisElection = voterElections.find((e) => e.electionId.contractAddress === contractAddress);
                            electionData.isRegistered = !!thisElection;
                            electionData.hasVoted = thisElection?.hasVoted || false;
                        }
                    }
                    catch (error) {
                        console.error('Failed to check voter status:', error);
                    }
                }
                setElection(electionData);
            }
        }
        catch (error) {
            console.error('Failed to load election:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const registerForElection = async () => {
        if (!privateKey.trim() || !contractAddress)
            return;
        setRegistering(true);
        try {
            const { data } = await api.post('/voter/register-election', {
                contractAddress,
                walletAddress: user?.walletAddress,
                privateKey: privateKey.trim()
            });
            if (data.success) {
                alert('Successfully registered for election!');
                setPrivateKey('');
                setShowRegistrationModal(false);
                await loadElection();
            }
        }
        catch (error) {
            alert(error.response?.data?.message || 'Failed to register for election');
        }
        finally {
            setRegistering(false);
        }
    };
    const castVote = async () => {
        if (!privateKey.trim() || selectedCandidate === null || !contractAddress)
            return;
        setVoting(true);
        try {
            const { data } = await api.post('/voter/vote', {
                contractAddress,
                candidateId: selectedCandidate,
                privateKey: privateKey.trim()
            });
            if (data.success) {
                alert('Vote cast successfully!');
                setPrivateKey('');
                setSelectedCandidate(null);
                setShowVoteModal(false);
                await loadElection();
            }
        }
        catch (error) {
            alert(error.response?.data?.message || 'Failed to cast vote');
        }
        finally {
            setVoting(false);
        }
    };
    useEffect(() => {
        loadElection();
    }, [contractAddress, user]);
    const getStatusColor = (status) => {
        switch (status) {
            case 'results_announced': return 'bg-gray-100 text-gray-800';
            case 'voting_active': return 'bg-green-100 text-green-800';
            case 'registration_open': return 'bg-blue-100 text-blue-800';
            default: return 'bg-yellow-100 text-yellow-800';
        }
    };
    const canRegister = () => {
        return election?.status === 'registration_open' && !election?.isRegistered && user?.role === 'voter';
    };
    const canVote = () => {
        return election?.status === 'voting_active' && election?.isRegistered && !election?.hasVoted && user?.role === 'voter';
    };
    if (loading)
        return _jsx("div", { className: "p-8 text-center", children: "Loading election details..." });
    if (!election)
        return _jsx("div", { className: "p-8 text-center text-red-500", children: "Election not found" });
    return (_jsxs("div", { className: "container mx-auto px-6 py-8", children: [_jsxs("div", { className: "mb-8", children: [_jsx("button", { onClick: () => navigate(-1), className: "text-primary hover:underline mb-4", children: "\u2190 Back" }), _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold mb-2", children: election.title }), _jsx("p", { className: "text-muted-foreground mb-4", children: election.description }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: `px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(election.status)}`, children: election.status.replace('_', ' ').toUpperCase() }), _jsxs("span", { className: "text-sm text-muted-foreground capitalize", children: [election.electionType, " Election"] })] })] }), _jsx("div", { className: "text-right", children: user?.role === 'voter' && (_jsxs("div", { className: "space-y-2", children: [canRegister() && (_jsx("button", { onClick: () => setShowRegistrationModal(true), className: "block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90", children: "Register to Vote" })), canVote() && (_jsx("button", { onClick: () => setShowVoteModal(true), className: "block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700", children: "Cast Your Vote" })), election.isRegistered && (_jsx("div", { className: "text-xs text-muted-foreground", children: election.hasVoted ? '✓ You have voted' : '✓ Registered to vote' }))] })) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4 mb-8", children: [_jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: election.candidates.length }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Candidates" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: election.totalRegisteredVoters }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Registered Voters" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsx("div", { className: "text-2xl font-bold text-purple-600", children: election.totalVotesCast }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Votes Cast" })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [_jsxs("div", { className: "text-2xl font-bold text-orange-600", children: [election.totalRegisteredVoters > 0
                                        ? Math.round((election.totalVotesCast / election.totalRegisteredVoters) * 100)
                                        : 0, "%"] }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Turnout" })] })] }), _jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-6", children: "Candidates" }), election.candidates.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: election.candidates.map((candidate) => (_jsxs("div", { className: "border border-border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold text-lg", children: candidate.candidateId.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: candidate.candidateId.party }), _jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["ID: ", candidate.onChainId, " \u2022 Age: ", candidate.candidateId.age, " \u2022 ", candidate.candidateId.gender] })] }), candidate.votes !== undefined && (_jsxs("div", { className: "text-right", children: [_jsx("div", { className: "text-lg font-bold", children: candidate.votes }), _jsx("div", { className: "text-xs text-muted-foreground", children: "votes" })] }))] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "text-sm font-medium", children: "Manifesto" }), _jsx("p", { className: "text-sm text-muted-foreground", children: candidate.candidateId.manifesto })] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: [_jsxs("span", { children: ["\uD83D\uDCE7 ", candidate.candidateId.email] }), candidate.candidateId.phone && (_jsxs("span", { className: "ml-4", children: ["\uD83D\uDCDE ", candidate.candidateId.phone] }))] })] })] }, candidate.onChainId))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "text-4xl mb-4", children: "\uD83D\uDC65" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No Candidates Yet" }), _jsx("p", { className: "text-muted-foreground", children: "Candidates haven't registered for this election yet." })] }))] }), _jsxs("div", { className: "mt-8 bg-card border border-border rounded-lg p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Election Details" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Election Type" }), _jsx("p", { className: "capitalize", children: election.electionType })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Status" }), _jsx("p", { className: "capitalize", children: election.status.replace('_', ' ') })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Maximum Candidates" }), _jsx("p", { children: election.maxCandidates })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Contract Address" }), _jsx("code", { className: "text-xs bg-muted/50 p-2 rounded block font-mono break-all", children: election.contractAddress })] }), election.votingStartTime && (_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium text-muted-foreground", children: "Voting Period" }), _jsxs("p", { className: "text-sm", children: [new Date(election.votingStartTime).toLocaleString(), election.votingEndTime && (_jsxs(_Fragment, { children: [" - ", new Date(election.votingEndTime).toLocaleString()] }))] })] }))] })] })] }), showRegistrationModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Register for Election" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Enter your wallet private key to register for this election on the blockchain." }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Private Key" }), _jsx("input", { type: "password", value: privateKey, onChange: (e) => setPrivateKey(e.target.value), placeholder: "Enter your wallet private key", className: "w-full p-3 border border-border rounded-lg" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => {
                                                    setShowRegistrationModal(false);
                                                    setPrivateKey('');
                                                }, className: "flex-1 py-3 border border-border rounded-lg hover:bg-muted", children: "Cancel" }), _jsx("button", { onClick: registerForElection, disabled: !privateKey.trim() || registering, className: "flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50", children: registering ? 'Registering...' : 'Register' })] })] })] }) }) })), showVoteModal && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsx("h2", { className: "text-xl font-semibold mb-4", children: "Cast Your Vote" }), _jsx("p", { className: "text-muted-foreground mb-6", children: "Select a candidate and confirm your vote. This action cannot be undone." }), _jsx("div", { className: "space-y-4 mb-6", children: election.candidates.map((candidate) => (_jsx("div", { className: `border rounded-lg p-4 cursor-pointer transition-colors ${selectedCandidate === candidate.onChainId
                                        ? 'border-primary bg-primary/5'
                                        : 'border-border hover:border-primary/50'}`, onClick: () => setSelectedCandidate(candidate.onChainId), children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: candidate.candidateId.name }), _jsx("p", { className: "text-sm text-muted-foreground", children: candidate.candidateId.party })] }), _jsx("input", { type: "radio", checked: selectedCandidate === candidate.onChainId, onChange: () => setSelectedCandidate(candidate.onChainId), className: "mr-2" })] }) }, candidate.onChainId))) }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Private Key (required for blockchain transaction)" }), _jsx("input", { type: "password", value: privateKey, onChange: (e) => setPrivateKey(e.target.value), placeholder: "Enter your wallet private key", className: "w-full p-3 border border-border rounded-lg" })] }), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => {
                                                    setShowVoteModal(false);
                                                    setSelectedCandidate(null);
                                                    setPrivateKey('');
                                                }, className: "flex-1 py-3 border border-border rounded-lg hover:bg-muted", children: "Cancel" }), _jsx("button", { onClick: castVote, disabled: selectedCandidate === null || !privateKey.trim() || voting, className: "flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50", children: voting ? 'Casting Vote...' : 'Cast Vote' })] })] })] }) }) }))] }));
};
