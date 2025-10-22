import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuthStore } from '../../stores/authStore';

interface Election {
  contractAddress: string;
  title: string;
  description: string;
  status: string;
  electionType: string;
  createdAt: string;
  totalVotesCast?: number;
  totalRegisteredVoters?: number;
  maxCandidates?: number;
  candidates?: Array<{ candidateId: string; onChainId: number; }>;
}

export const ElectionsListPage = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const user = useAuthStore(s => s.user);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/election', { params: { search } });
      if (data.success) setElections(data.data.elections);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-2xl font-semibold">Elections</h1>
        <input placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} onKeyDown={e=> e.key==='Enter' && load()} className="text-sm" />
        <button onClick={load} className="text-sm bg-slate-700 px-3 py-1.5 rounded">Reload</button>
      </div>
      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      <div className="grid gap-4 md:grid-cols-2">
        {elections.map(el => (
          <div key={el.contractAddress} className="p-5 rounded-lg bg-card border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{el.title}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase tracking-wide ${
                el.status === 'registration_open' ? 'bg-green-100 text-green-800' :
                el.status === 'voting_active' ? 'bg-blue-100 text-blue-800' :
                el.status === 'results_announced' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {el.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm line-clamp-3 text-slate-400">{el.description}</p>
            <div className="flex text-[10px] gap-3 text-slate-500 mb-3">
              <span>Type: {el.electionType}</span>
              <span>Created {formatDistanceToNow(new Date(el.createdAt))} ago</span>
              {el.candidates && el.maxCandidates && (
                <span>Candidates: {el.candidates.length}/{el.maxCandidates}</span>
              )}
            </div>
            
            <div className="flex gap-2 mt-auto">
              <Link 
                to={`/elections/${el.contractAddress}`} 
                className="flex-1 text-center px-3 py-2 text-sm bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors"
              >
                View Details
              </Link>
              
              {user && el.status === 'registration_open' && (
                <Link 
                  to={`/elections/${el.contractAddress}/register`} 
                  className="flex-1 text-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Register
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
