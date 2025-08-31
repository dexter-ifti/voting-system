import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface SystemStats {
  blockchain: {
    currentBlockNumber: number;
    network: string;
    rpcUrl: string;
  };
  dashboard: {
    stats: {
      totalElections: number;
      activeElections: number;
      totalVoters: number;
      totalCandidates: number;
    };
  };
}

export const SystemStatus = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
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
    } catch (error) {
      console.error('Failed to load system stats:', error);
    } finally {
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
    return <div className="text-center py-4 text-slate-400">Loading system status...</div>;
  }

  if (!stats) {
    return <div className="text-center py-4 text-red-400">Failed to load system status</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-medium mb-3">System Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-2xl font-semibold text-blue-600">{stats.dashboard.stats.totalElections}</div>
            <div className="text-sm text-muted-foreground">Total Elections</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-2xl font-semibold text-green-600">{stats.dashboard.stats.activeElections}</div>
            <div className="text-sm text-muted-foreground">Active Elections</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-2xl font-semibold text-purple-600">{stats.dashboard.stats.totalVoters}</div>
            <div className="text-sm text-muted-foreground">Verified Voters</div>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-2xl font-semibold text-orange-600">{stats.dashboard.stats.totalCandidates}</div>
            <div className="text-sm text-muted-foreground">Verified Candidates</div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-medium mb-3">Blockchain Status</h3>
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Network:</span>
            <span className="font-medium capitalize">{stats.blockchain.network}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Block:</span>
            <span className="font-medium font-mono">#{stats.blockchain.currentBlockNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">RPC URL:</span>
            <span className="font-mono text-xs">{stats.blockchain.rpcUrl}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Status:</span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 font-medium">Connected</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
