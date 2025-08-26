import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface Candidate {
  candidateId: number;
  name: string;
  party: string;
  votes: string;
  manifesto?: string;
}

export const ElectionDetailsPage = () => {
  const { contractAddress } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(s => s.user);
  const [voteLoading, setVoteLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/election/${contractAddress}`);
      if (data.success) setData(data.data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [contractAddress]);

  const castVote = async (candidateId: number) => {
    if (!user || user.role !== 'voter') return toast.error('Login as voter');
    setVoteLoading(true);
    try {
      if (!(window as any).ethereum) throw new Error('MetaMask not found');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      if (address.toLowerCase() !== user.walletAddress?.toLowerCase()) {
        return toast.error('Connected wallet mismatch');
      }
      // For simplicity, request private key (NOT recommended in prod). Better flow: backend uses signature to authorize server-side key mgmt.
      const pk = prompt('Enter private key to sign vote (demo only, never share real key):');
      if (!pk) return;
      const { data: voteRes } = await api.post('/voter/vote', { contractAddress, candidateId, privateKey: pk });
      if (voteRes.success) {
        toast.success('Vote cast');
        load();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Vote failed');
    } finally {
      setVoteLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading...</div>;
  if (!data) return <div className="p-8 text-sm text-red-400">Election not found</div>;

  const election = data.election;
  const candidates: Candidate[] = data.blockchain.candidates || [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{election.title}</h1>
          <p className="text-slate-400 text-sm max-w-2xl">{election.description}</p>
          <div className="flex gap-3 mt-3 text-[10px] text-slate-500">
            <span>Status: {election.status}</span>
            <span>Type: {election.electionType}</span>
            <span>Registered: {election.totalRegisteredVoters}</span>
            <span>Votes: {election.totalVotesCast}</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="font-semibold mb-3">Candidates</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map(c => (
            <div key={c.candidateId} className="p-4 rounded-lg bg-card border border-border flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{c.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 uppercase tracking-wide">ID {c.candidateId}</span>
              </div>
              <p className="text-xs text-slate-400">{c.party}</p>
              <p className="text-xs text-slate-500 line-clamp-3">{c.manifesto}</p>
              <p className="text-xs text-slate-400">Votes: {c.votes}</p>
              {user?.role === 'voter' && (
                <button disabled={voteLoading} onClick={()=>castVote(c.candidateId)} className="text-xs mt-1 bg-primary/80 hover:bg-primary px-3 py-1.5 rounded disabled:opacity-50">Vote</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
