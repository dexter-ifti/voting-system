import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../lib/api';
export const VotingInterface = ({ contractAddress, candidates, userWalletAddress, onVoteSuccess }) => {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [privateKey, setPrivateKey] = useState('');
    const [isVoting, setIsVoting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [error, setError] = useState('');
    const handleVote = async () => {
        if (selectedCandidate === null || !privateKey.trim()) {
            setError('Please select a candidate and enter your private key');
            return;
        }
        setIsVoting(true);
        setError('');
        try {
            const { data } = await api.post('/voter/vote', {
                contractAddress,
                candidateId: selectedCandidate,
                privateKey: privateKey.trim()
            });
            if (data.success) {
                setShowConfirmation(false);
                onVoteSuccess();
            }
            else {
                setError(data.message || 'Failed to cast vote');
            }
        }
        catch (error) {
            setError(error.response?.data?.message || 'Failed to cast vote');
        }
        finally {
            setIsVoting(false);
        }
    };
    const selectedCandidateData = candidates.find(c => c.candidateId === selectedCandidate);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-4", children: "Select a Candidate" }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: candidates.map(candidate => (_jsxs("div", { className: `p-4 rounded-lg border cursor-pointer transition-all ${selectedCandidate === candidate.candidateId
                                ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                                : 'border-border hover:border-primary/50 bg-card'}`, onClick: () => setSelectedCandidate(candidate.candidateId), children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h4", { className: "font-medium", children: candidate.name }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "radio", checked: selectedCandidate === candidate.candidateId, onChange: () => setSelectedCandidate(candidate.candidateId), className: "mr-2" }), _jsxs("span", { className: "text-xs px-2 py-1 rounded bg-muted text-muted-foreground", children: ["ID: ", candidate.candidateId] })] })] }), _jsx("p", { className: "text-sm text-muted-foreground mb-2", children: candidate.party }), candidate.manifesto && (_jsx("p", { className: "text-xs text-muted-foreground line-clamp-2", children: candidate.manifesto })), _jsx("div", { className: "mt-3 pt-3 border-t border-border", children: _jsxs("span", { className: "text-xs text-muted-foreground", children: ["Current Votes: ", candidate.votes] }) })] }, candidate.candidateId))) })] }), selectedCandidate !== null && (_jsxs("div", { className: "bg-card border border-border rounded-lg p-6", children: [_jsx("h4", { className: "font-medium mb-3", children: "Confirm Your Vote" }), _jsxs("div", { className: "bg-muted/50 rounded-lg p-4 mb-4", children: [_jsxs("p", { className: "text-sm", children: [_jsx("span", { className: "font-medium", children: "Selected Candidate:" }), " ", selectedCandidateData?.name] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: [_jsx("span", { className: "font-medium", children: "Party:" }), " ", selectedCandidateData?.party] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: [_jsx("span", { className: "font-medium", children: "Contract:" }), " ", contractAddress] })] }), _jsxs("button", { onClick: () => setShowConfirmation(true), className: "w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors", children: ["Cast Vote for ", selectedCandidateData?.name] })] })), showConfirmation && (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-md w-full", children: _jsxs("div", { className: "p-6", children: [_jsx("h3", { className: "text-lg font-semibold mb-4", children: "Confirm Your Vote" }), _jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4", children: _jsxs("p", { className: "text-sm text-yellow-800", children: [_jsx("strong", { children: "Warning:" }), " Once cast, your vote cannot be changed. Please verify your selection."] }) }), _jsxs("div", { className: "bg-muted/50 rounded-lg p-4 mb-4", children: [_jsxs("p", { className: "font-medium", children: ["Voting for: ", selectedCandidateData?.name] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Party: ", selectedCandidateData?.party] }), _jsxs("p", { className: "text-xs text-muted-foreground mt-2", children: ["Candidate ID: ", selectedCandidate] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Private Key (Required for Blockchain Transaction)" }), _jsx("input", { type: "password", value: privateKey, onChange: (e) => setPrivateKey(e.target.value), placeholder: "Enter your wallet private key", className: "w-full p-3 border border-border rounded-lg" }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your private key is used only for this transaction and is not stored." })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3", children: _jsx("p", { className: "text-sm text-red-800", children: error }) })), _jsxs("div", { className: "flex gap-4", children: [_jsx("button", { onClick: () => {
                                                    setShowConfirmation(false);
                                                    setPrivateKey('');
                                                    setError('');
                                                }, className: "flex-1 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors", children: "Cancel" }), _jsx("button", { onClick: handleVote, disabled: isVoting || !privateKey.trim(), className: "flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors", children: isVoting ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Casting Vote..."] })) : ('Confirm Vote') })] })] })] }) }) }))] }));
};
