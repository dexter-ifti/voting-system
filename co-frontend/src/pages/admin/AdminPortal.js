import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { VoterManagement } from './VoterManagement';
import { CandidateManagement } from './CandidateManagement';
import { ElectionManagement } from './ElectionManagement';
import { SystemStatus } from './SystemStatus';
import { api } from '../../lib/api';
export const AdminPortal = () => {
    const user = useAuthStore(s => s.user);
    const [currentView, setCurrentView] = useState('dashboard');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/admin/dashboard');
            if (data.success)
                setData(data.data);
        }
        catch (e) {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { load(); }, []);
    const renderCurrentView = () => {
        switch (currentView) {
            case 'voters':
                return _jsx(VoterManagement, {});
            case 'candidates':
                return _jsx(CandidateManagement, {});
            case 'elections':
                return _jsx(ElectionManagement, {});
            case 'system':
                return _jsx(SystemStatus, {});
            default:
                return renderDashboard();
        }
    };
    const renderDashboard = () => (_jsxs("div", { className: "max-w-5xl mx-auto py-10 px-6 space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h1", { className: "text-2xl font-semibold", children: "Admin Dashboard" }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Welcome, ", user?.name || user?.email] })] }), _jsxs("div", { className: "grid gap-4 md:grid-cols-4", children: [_jsxs("button", { onClick: () => setCurrentView('voters'), className: "p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Manage Voters" }), _jsx("p", { className: "text-2xl font-semibold", children: data?.stats.totalVoters || 0 }), _jsx("p", { className: "text-xs text-blue-600 mt-1", children: "View All \u2192" })] }), _jsxs("button", { onClick: () => setCurrentView('candidates'), className: "p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Manage Candidates" }), _jsx("p", { className: "text-2xl font-semibold", children: data?.stats.totalCandidates || 0 }), _jsx("p", { className: "text-xs text-blue-600 mt-1", children: "View All \u2192" })] }), _jsxs("button", { onClick: () => setCurrentView('elections'), className: "p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Manage Elections" }), _jsx("p", { className: "text-2xl font-semibold", children: data?.stats.totalElections || 0 }), _jsx("p", { className: "text-xs text-blue-600 mt-1", children: "View All \u2192" })] }), _jsxs("div", { className: "p-4 rounded-lg bg-card border border-border", children: [_jsx("p", { className: "text-xs text-slate-400", children: "Active Elections" }), _jsx("p", { className: "text-2xl font-semibold", children: data?.stats.activeElections || 0 }), _jsx("p", { className: "text-xs text-green-600 mt-1", children: "Currently Running" })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold mb-3", children: "Quick Actions" }), _jsxs("div", { className: "grid gap-4 md:grid-cols-3", children: [_jsxs("button", { onClick: () => setCurrentView('elections'), className: "p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left", children: [_jsx("div", { className: "text-lg font-medium", children: "Create Election" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Start a new voting process" })] }), _jsxs("button", { onClick: () => setCurrentView('voters'), className: "p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left", children: [_jsx("div", { className: "text-lg font-medium", children: "Verify Voters" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Review pending voter applications" })] }), _jsxs("button", { onClick: () => setCurrentView('candidates'), className: "p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left", children: [_jsx("div", { className: "text-lg font-medium", children: "Verify Candidates" }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Review pending candidate applications" })] })] })] }), _jsxs("div", { children: [_jsx("h2", { className: "font-semibold mb-3", children: "Recent Elections" }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: data?.recentElections.map(el => (_jsxs("div", { className: "p-4 rounded-lg bg-card border border-border", children: [_jsx("h3", { className: "font-medium", children: el.title }), _jsx("p", { className: "text-xs text-slate-500 line-clamp-3", children: el.description }), _jsxs("p", { className: "text-[10px] mt-2 text-slate-400", children: ["Candidates: ", el.candidates.length] }), _jsx("div", { className: "mt-2 flex gap-2", children: _jsx("button", { onClick: () => setCurrentView('elections'), className: "text-xs text-blue-600 hover:text-blue-800", children: "Manage \u2192" }) })] }, el.contractAddress))) })] })] }));
    if (loading)
        return _jsx("div", { className: "p-8 text-sm text-slate-400", children: "Loading..." });
    if (!data && currentView === 'dashboard')
        return _jsx("div", { className: "p-8 text-sm text-red-400", children: "Failed to load" });
    return (_jsxs("div", { className: "min-h-screen bg-background", children: [_jsx("div", { className: "border-b border-border bg-card", children: _jsx("div", { className: "max-w-7xl mx-auto px-6", children: _jsxs("nav", { className: "flex space-x-8", children: [_jsx("button", { onClick: () => setCurrentView('dashboard'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'dashboard'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "Dashboard" }), _jsxs("button", { onClick: () => setCurrentView('voters'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'voters'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: ["Voters (", data?.stats.totalVoters || 0, ")"] }), _jsxs("button", { onClick: () => setCurrentView('candidates'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'candidates'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: ["Candidates (", data?.stats.totalCandidates || 0, ")"] }), _jsxs("button", { onClick: () => setCurrentView('elections'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'elections'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: ["Elections (", data?.stats.totalElections || 0, ")"] }), _jsx("button", { onClick: () => setCurrentView('system'), className: `py-4 text-sm font-medium border-b-2 transition-colors ${currentView === 'system'
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'}`, children: "System" })] }) }) }), renderCurrentView()] }));
};
