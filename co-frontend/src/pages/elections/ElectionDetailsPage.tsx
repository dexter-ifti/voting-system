import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useParams, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { VotingInterface } from '../../components/VotingInterface';
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
  const [showVoting, setShowVoting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/election/${contractAddress}`);
      if (data.success) setData(data.data);
    } catch (e: any) {
      console.error('Failed to load election:', e);
      console.error('Contract address:', contractAddress);
      console.error('Error response:', e.response?.data);
      // Don't ignore the error, let the user know what happened
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [contractAddress]);

  const handleVoteSuccess = () => {
    toast.success('Vote cast successfully!');
    setShowVoting(false);
    load(); // Reload data to show updated vote counts
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading...</div>;
  if (!data) return (
    <div className="p-8 text-sm text-red-400">
      <div>Election not found</div>
      <div className="text-xs text-slate-500 mt-2">
        Contract Address: {contractAddress}
      </div>
      <div className="text-xs text-slate-500">
        Check the browser console for more details.
      </div>
    </div>
  );

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
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          {user && election.status === 'registration_open' && (
            <Link
              to={`/elections/${contractAddress}/register`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Register for Election
            </Link>
          )}
          
          {election.status === 'voting_active' && user?.role === 'voter' && (
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              onClick={() => setShowVoting(true)}
            >
              Cast Your Vote
            </button>
          )}
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
            </div>
          ))}
        </div>
      </div>

      {/* Voting Interface Modal */}
      {showVoting && user?.role === 'voter' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Cast Your Vote</h2>
                <button
                  onClick={() => setShowVoting(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              
              <VotingInterface
                contractAddress={contractAddress || ''}
                candidates={candidates}
                userWalletAddress={user.walletAddress || ''}
                onVoteSuccess={handleVoteSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
