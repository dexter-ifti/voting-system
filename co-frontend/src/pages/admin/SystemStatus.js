import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
export const SystemStatus = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const loadSystemStats = async () => {
        setLoading(true);
        try {
            const [blockchainRes, dashboardRes] = await Promise.all([
                api.get('/blockchain/network-info'),
                api.get('/admin/dashboard')
            ]);
            if (blockchainRes.data.success && dashboardRes.data.success) {
                setStats({
                    blockchain: blockchainRes.data.data,
                    dashboard: dashboardRes.data.data
                });
            }
        }
        catch (error) {
            console.error('Failed to load system stats:', error);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadSystemStats();
        // Refresh every 30 seconds
        const interval = setInterval(loadSystemStats, 30000);
        return () => clearInterval(interval);
    }, []);
    if (loading) {
        return _jsx("div", { className: "text-center py-4 text-slate-400", children: "Loading system status..." });
    }
    if (!stats) {
        return _jsx("div", { className: "text-center py-4 text-red-400", children: "Failed to load system status" });
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "System Overview" }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-semibold text-blue-600", children: stats.dashboard.stats.totalElections }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Total Elections" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-semibold text-green-600", children: stats.dashboard.stats.activeElections }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Active Elections" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-semibold text-purple-600", children: stats.dashboard.stats.totalVoters }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Verified Voters" })] }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg", children: [_jsx("div", { className: "text-2xl font-semibold text-orange-600", children: stats.dashboard.stats.totalCandidates }), _jsx("div", { className: "text-sm text-muted-foreground", children: "Verified Candidates" })] })] })] }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium mb-3", children: "Blockchain Status" }), _jsxs("div", { className: "bg-muted/50 p-4 rounded-lg space-y-2", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Network:" }), _jsx("span", { className: "font-medium capitalize", children: stats.blockchain.network })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Current Block:" }), _jsxs("span", { className: "font-medium font-mono", children: ["#", stats.blockchain.currentBlockNumber] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "RPC URL:" }), _jsx("span", { className: "font-mono text-xs", children: stats.blockchain.rpcUrl })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-muted-foreground", children: "Status:" }), _jsxs("span", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-green-500 rounded-full" }), _jsx("span", { className: "text-green-600 font-medium", children: "Connected" })] })] })] })] })] }));
};
