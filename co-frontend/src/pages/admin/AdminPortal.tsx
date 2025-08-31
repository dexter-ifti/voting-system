import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AdminDashboard } from './AdminDashboard';
import { VoterManagement } from './VoterManagement';
import { CandidateManagement } from './CandidateManagement';
import { ElectionManagement } from './ElectionManagement';
import { SystemStatus } from './SystemStatus';
import { api } from '../../lib/api';

interface DashboardData {
  stats: {
    totalElections: number;
    activeElections: number;
    totalVoters: number;
    totalCandidates: number;
  };
  recentElections: any[];
}

export const AdminPortal = () => {
  const user = useAuthStore(s => s.user);
  const [currentView, setCurrentView] = useState<'dashboard' | 'voters' | 'candidates' | 'elections' | 'system'>('dashboard');
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data.success) setData(data.data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'voters':
        return <VoterManagement />;
      case 'candidates':
        return <CandidateManagement />;
      case 'elections':
        return <ElectionManagement />;
      case 'system':
        return <SystemStatus />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome, {user?.name || user?.email}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid gap-4 md:grid-cols-4">
        <button
          onClick={() => setCurrentView('voters')}
          className="p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left"
        >
          <p className="text-xs text-slate-400">Manage Voters</p>
          <p className="text-2xl font-semibold">{data?.stats.totalVoters || 0}</p>
          <p className="text-xs text-blue-600 mt-1">View All →</p>
        </button>
        <button
          onClick={() => setCurrentView('candidates')}
          className="p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left"
        >
          <p className="text-xs text-slate-400">Manage Candidates</p>
          <p className="text-2xl font-semibold">{data?.stats.totalCandidates || 0}</p>
          <p className="text-xs text-blue-600 mt-1">View All →</p>
        </button>
        <button
          onClick={() => setCurrentView('elections')}
          className="p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left"
        >
          <p className="text-xs text-slate-400">Manage Elections</p>
          <p className="text-2xl font-semibold">{data?.stats.totalElections || 0}</p>
          <p className="text-xs text-blue-600 mt-1">View All →</p>
        </button>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-slate-400">Active Elections</p>
          <p className="text-2xl font-semibold">{data?.stats.activeElections || 0}</p>
          <p className="text-xs text-green-600 mt-1">Currently Running</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <button
            onClick={() => setCurrentView('elections')}
            className="p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="text-lg font-medium">Create Election</div>
            <div className="text-sm text-muted-foreground">Start a new voting process</div>
          </button>
          <button
            onClick={() => setCurrentView('voters')}
            className="p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="text-lg font-medium">Verify Voters</div>
            <div className="text-sm text-muted-foreground">Review pending voter applications</div>
          </button>
          <button
            onClick={() => setCurrentView('candidates')}
            className="p-4 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors text-left"
          >
            <div className="text-lg font-medium">Verify Candidates</div>
            <div className="text-sm text-muted-foreground">Review pending candidate applications</div>
          </button>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recent Elections</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data?.recentElections.map(el => (
            <div key={el.contractAddress} className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-medium">{el.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3">{el.description}</p>
              <p className="text-[10px] mt-2 text-slate-400">Candidates: {el.candidates.length}</p>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => setCurrentView('elections')}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Manage →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading...</div>;
  if (!data && currentView === 'dashboard') return <div className="p-8 text-sm text-red-400">Failed to load</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'dashboard'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('voters')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'voters'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Voters ({data?.stats.totalVoters || 0})
            </button>
            <button
              onClick={() => setCurrentView('candidates')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'candidates'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Candidates ({data?.stats.totalCandidates || 0})
            </button>
            <button
              onClick={() => setCurrentView('elections')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'elections'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Elections ({data?.stats.totalElections || 0})
            </button>
            <button
              onClick={() => setCurrentView('system')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'system'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              System
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      {renderCurrentView()}
    </div>
  );
};
