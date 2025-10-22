import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { registerCandidateForElection, registerVoterForElection } from '../lib/api';
export const ElectionRegistrationForm = ({ election, userType, walletAddress, onSuccess, onCancel }) => {
    const [privateKey, setPrivateKey] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!privateKey.trim()) {
            setError('Private key is required');
            return;
        }
        setIsRegistering(true);
        setError('');
        try {
            const registrationData = {
                contractAddress: election.contractAddress,
                walletAddress,
                privateKey: privateKey.trim()
            };
            const result = userType === 'candidate'
                ? await registerCandidateForElection(registrationData)
                : await registerVoterForElection(registrationData);
            if (result.success) {
                onSuccess();
            }
            else {
                setError(result.message || 'Registration failed');
            }
        }
        catch (error) {
            setError(error.response?.data?.message || 'Registration failed');
        }
        finally {
            setIsRegistering(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-lg w-full", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-6", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-semibold", children: "Register for Election" }), _jsxs("p", { className: "text-sm text-muted-foreground mt-1", children: [userType === 'candidate' ? 'Register as a candidate' : 'Register as a voter', " for ", election.title] })] }), _jsx("button", { onClick: onCancel, className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), _jsxs("div", { className: "bg-muted/50 rounded-lg p-4 mb-6", children: [_jsx("h3", { className: "font-medium mb-2", children: election.title }), _jsx("p", { className: "text-sm text-muted-foreground mb-3", children: election.description }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Type:" }), _jsx("span", { className: "ml-1 capitalize", children: election.electionType })] }), _jsxs("div", { children: [_jsx("span", { className: "text-muted-foreground", children: "Status:" }), _jsx("span", { className: "ml-1 capitalize", children: election.status.replace('_', ' ') })] }), userType === 'candidate' && (_jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-muted-foreground", children: "Candidates:" }), _jsxs("span", { className: "ml-1", children: [election.candidates.length, "/", election.maxCandidates] })] }))] })] }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "contractAddress", className: "block text-sm font-medium mb-2", children: "Contract Address" }), _jsx("input", { id: "contractAddress", type: "text", value: election.contractAddress, readOnly: true, className: "w-full p-3 border border-border rounded-lg bg-muted/50 text-sm font-mono" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "walletAddress", className: "block text-sm font-medium mb-2", children: "Your Wallet Address" }), _jsx("input", { id: "walletAddress", type: "text", value: walletAddress, readOnly: true, className: "w-full p-3 border border-border rounded-lg bg-muted/50 text-sm font-mono" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "privateKey", className: "block text-sm font-medium mb-2", children: "Private Key *" }), _jsx("input", { id: "privateKey", type: "password", value: privateKey, onChange: (e) => setPrivateKey(e.target.value), placeholder: "Enter your wallet private key", className: "w-full p-3 border border-border rounded-lg", required: true }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "Your private key is used for blockchain registration and is not stored on our servers." })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 rounded-lg p-3", children: _jsx("p", { className: "text-sm text-red-800", children: error }) })), _jsxs("div", { className: "flex gap-4 pt-4", children: [_jsx("button", { type: "button", onClick: onCancel, className: "flex-1 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isRegistering || !privateKey.trim(), className: "flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors", children: isRegistering ? (_jsxs("span", { className: "flex items-center justify-center", children: [_jsxs("svg", { className: "animate-spin -ml-1 mr-3 h-4 w-4 text-white", xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", children: [_jsx("circle", { className: "opacity-25", cx: "12", cy: "12", r: "10", stroke: "currentColor", strokeWidth: "4" }), _jsx("path", { className: "opacity-75", fill: "currentColor", d: "M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" })] }), "Registering..."] })) : (`Register as ${userType}`) })] })] })] }) }) }));
};
