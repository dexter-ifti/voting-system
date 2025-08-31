import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../../lib/api';
export const CreateElectionForm = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        electionType: 'presidential',
        adminPrivateKey: '',
        registrationStartTime: '',
        registrationEndTime: '',
        votingStartTime: '',
        votingEndTime: '',
        maxCandidates: 10
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const payload = {
                ...formData,
                maxCandidates: parseInt(formData.maxCandidates.toString()),
                ...(formData.registrationStartTime && { registrationStartTime: new Date(formData.registrationStartTime).toISOString() }),
                ...(formData.registrationEndTime && { registrationEndTime: new Date(formData.registrationEndTime).toISOString() }),
                ...(formData.votingStartTime && { votingStartTime: new Date(formData.votingStartTime).toISOString() }),
                ...(formData.votingEndTime && { votingEndTime: new Date(formData.votingEndTime).toISOString() })
            };
            const { data } = await api.post('/election/create', payload);
            if (data.success) {
                onSuccess();
                alert('Election created successfully!');
            }
            else {
                setError(data.message || 'Failed to create election');
            }
        }
        catch (error) {
            setError(error.response?.data?.message || 'Failed to create election');
        }
        finally {
            setLoading(false);
        }
    };
    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50", children: _jsx("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Create New Election" }), _jsx("button", { onClick: onClose, className: "text-muted-foreground hover:text-foreground", children: "\u2715" })] }), error && (_jsx("div", { className: "mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Title *" }), _jsx("input", { type: "text", name: "title", value: formData.title, onChange: handleChange, className: "w-full px-3 py-2 border border-border rounded-lg bg-background", required: true })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Description *" }), _jsx("textarea", { name: "description", value: formData.description, onChange: handleChange, rows: 3, className: "w-full px-3 py-2 border border-border rounded-lg bg-background", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Election Type" }), _jsxs("select", { name: "electionType", value: formData.electionType, onChange: handleChange, className: "w-full px-3 py-2 border border-border rounded-lg bg-background", children: [_jsx("option", { value: "presidential", children: "Presidential" }), _jsx("option", { value: "parliamentary", children: "Parliamentary" }), _jsx("option", { value: "local", children: "Local" }), _jsx("option", { value: "referendum", children: "Referendum" }), _jsx("option", { value: "student", children: "Student" }), _jsx("option", { value: "corporate", children: "Corporate" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Max Candidates" }), _jsx("input", { type: "number", name: "maxCandidates", value: formData.maxCandidates, onChange: handleChange, min: "1", max: "50", className: "w-full px-3 py-2 border border-border rounded-lg bg-background" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Registration Start" }), _jsx("input", { type: "datetime-local", name: "registrationStartTime", value: formData.registrationStartTime, onChange: handleChange, className: "w-full px-3 py-2 border border-border rounded-lg bg-background" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Registration End" }), _jsx("input", { type: "datetime-local", name: "registrationEndTime", value: formData.registrationEndTime, onChange: handleChange, className: "w-full px-3 py-2 border border-border rounded-lg bg-background" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Voting Start" }), _jsx("input", { type: "datetime-local", name: "votingStartTime", value: formData.votingStartTime, onChange: handleChange, className: "w-full px-3 py-2 border border-border rounded-lg bg-background" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Voting End" }), _jsx("input", { type: "datetime-local", name: "votingEndTime", value: formData.votingEndTime, onChange: handleChange, className: "w-full px-3 py-2 border border-border rounded-lg bg-background" })] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("label", { className: "block text-sm font-medium mb-2", children: "Admin Private Key *" }), _jsx("input", { type: "password", name: "adminPrivateKey", value: formData.adminPrivateKey, onChange: handleChange, className: "w-full px-3 py-2 border border-border rounded-lg bg-background", placeholder: "Enter your private key to deploy the election contract...", required: true }), _jsx("p", { className: "text-xs text-muted-foreground mt-1", children: "This will be used to deploy the election smart contract. Keep it secure!" })] })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx("button", { type: "submit", disabled: loading, className: "flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50", children: loading ? 'Creating Election...' : 'Create Election' }), _jsx("button", { type: "button", onClick: onClose, className: "flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted", children: "Cancel" })] })] })] }) }) }));
};
