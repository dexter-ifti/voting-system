import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

interface Election {
  contractAddress: string;
  title: string;
  description: string;
  status: string;
  electionType: string;
  createdAt: string;
  totalVotesCast?: number;
  totalRegisteredVoters?: number;
}

export const ElectionsListPage = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
          <Link key={el.contractAddress} to={`/elections/${el.contractAddress}`} className="p-5 rounded-lg bg-card border border-border flex flex-col gap-2 hover:border-primary/60">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">{el.title}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 uppercase tracking-wide">{el.status}</span>
            </div>
            <p className="text-sm line-clamp-3 text-slate-400">{el.description}</p>
            <div className="flex text-[10px] gap-3 text-slate-500">
              <span>Type: {el.electionType}</span>
              <span>Created {formatDistanceToNow(new Date(el.createdAt))} ago</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
