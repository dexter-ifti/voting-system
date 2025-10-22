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

  if (loading) return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-padding"></div>
              <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-border opacity-20"></div>
            </div>
            <p className="text-slate-300 font-medium animate-pulse text-lg">Loading election details...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-red-500/20 shadow-2xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Election Not Found</h3>
            <div className="space-y-2 text-slate-400 text-sm">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-red-300 font-medium">Contract Address:</span>
                <code className="block text-xs font-mono text-slate-300 mt-1 break-all">{contractAddress}</code>
              </div>
              <p className="text-xs text-slate-500">Check the browser console for more details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const election = data.election;
  const candidates: Candidate[] = data.blockchain.candidates || [];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto py-10 px-6 space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
                {election.title}
              </h1>
              <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-3xl">{election.description}</p>
              
              {/* Status and Stats Bar */}
              <div className="flex flex-wrap items-center gap-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full border ${
                  election.status === 'voting_active' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                  election.status === 'registration_open' ? 'bg-blue-500/20 text-blue-300 border-blue-400/30' :
                  election.status === 'results_announced' ? 'bg-purple-500/20 text-purple-300 border-purple-400/30' :
                  'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                }`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    election.status === 'voting_active' ? 'bg-green-400' :
                    election.status === 'registration_open' ? 'bg-blue-400' :
                    election.status === 'results_announced' ? 'bg-purple-400' :
                    'bg-yellow-400'
                  }`}></div>
                  <span className="font-medium text-sm uppercase tracking-wide">{election.status.replace('_', ' ')}</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                  <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300 text-sm font-medium capitalize">{election.electionType}</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                  <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span className="text-slate-300 text-sm font-medium">{election.totalRegisteredVoters} Registered</span>
                </div>

                <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                  <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-slate-300 text-sm font-medium">{election.totalVotesCast} Votes Cast</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3 min-w-48">
              {user && election.status === 'registration_open' && (
                <Link
                  to={`/elections/${contractAddress}/register`}
                  className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 font-medium text-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Register for Election</span>
                  </span>
                </Link>
              )}
              
              {election.status === 'voting_active' && user?.role === 'voter' && (
                <button
                  className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 font-medium animate-pulse"
                  onClick={() => setShowVoting(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Cast Your Vote</span>
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Candidates Section */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Candidates
            </h2>
            <div className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
              <span className="text-slate-300 text-sm font-medium">{candidates.length} registered</span>
            </div>
          </div>
          
          {candidates.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {candidates.map(candidate => (
                <div key={candidate.candidateId} className="group bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-blue-400/50 hover:scale-105 transition-all duration-300 shadow-xl">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {candidate.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{candidate.name}</h3>
                        <p className="text-blue-400 font-medium mb-1">{candidate.party}</p>
                        <div className="bg-slate-700/50 px-3 py-1 rounded-lg inline-block">
                          <span className="text-xs text-slate-300 font-medium">ID: {candidate.candidateId}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                      <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                        {candidate.votes}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">votes</div>
                    </div>
                  </div>
                  
                  {candidate.manifesto && (
                    <div className="bg-slate-700/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Manifesto</span>
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed line-clamp-3">{candidate.manifesto}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-slate-800/50 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-white/10">
                <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Candidates Yet</h3>
              <p className="text-slate-400 max-w-md mx-auto leading-relaxed">
                Candidates haven't registered for this election yet. Check back later as the registration period progresses.
              </p>
            </div>
          )}
        </div>

        {/* Voting Interface Modal */}
        {showVoting && user?.role === 'voter' && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                      Cast Your Vote
                    </h2>
                    <p className="text-slate-400 mt-2 text-lg">Make your democratic choice in this election</p>
                  </div>
                  <button
                    onClick={() => setShowVoting(false)}
                    className="group p-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="bg-blue-500/10 backdrop-blur-sm rounded-2xl p-6 border border-blue-400/30 mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-blue-300 font-semibold mb-2">Blockchain Voting Process</p>
                      <p className="text-blue-200/80 text-sm leading-relaxed">
                        Your vote will be securely recorded on the blockchain. This process requires your private key 
                        and creates a permanent, tamper-proof record of your democratic participation.
                      </p>
                    </div>
                  </div>
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
    </div>
  );
};
