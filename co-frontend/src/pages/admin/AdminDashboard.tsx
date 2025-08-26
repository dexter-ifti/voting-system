import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface DashboardData {
  stats: {
    totalElections: number;
    activeElections: number;
    totalVoters: number;
    totalCandidates: number;
  };
  recentElections: any[];
}

export const AdminDashboard = () => {
  const user = useAuthStore(s => s.user);
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

  useEffect(()=>{load();},[]);

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading...</div>;
  if (!data) return <div className="p-8 text-sm text-red-400">Failed to load</div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-slate-400">Total Elections</p>
          <p className="text-2xl font-semibold">{data.stats.totalElections}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-slate-400">Active Elections</p>
          <p className="text-2xl font-semibold">{data.stats.activeElections}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-slate-400">Verified Voters</p>
          <p className="text-2xl font-semibold">{data.stats.totalVoters}</p>
        </div>
        <div className="p-4 rounded-lg bg-card border border-border">
          <p className="text-xs text-slate-400">Verified Candidates</p>
          <p className="text-2xl font-semibold">{data.stats.totalCandidates}</p>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Recent Elections</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {data.recentElections.map(el => (
            <div key={el.contractAddress} className="p-4 rounded-lg bg-card border border-border">
              <h3 className="font-medium">{el.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3">{el.description}</p>
              <p className="text-[10px] mt-2 text-slate-400">Candidates: {el.candidates.length}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
