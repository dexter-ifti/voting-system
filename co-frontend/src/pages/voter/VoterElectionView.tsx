import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface Candidate {
  candidateId: {
    _id: string;
    name: string;
    party: string;
    manifesto: string;
    age: number;
    gender: string;
    email: string;
    phone: string;
  };
  onChainId: number;
  votes?: number;
}

interface ElectionDetail {
  _id: string;
  title: string;
  description: string;
  electionType: string;
  contractAddress: string;
  status: string;
  votingStartTime?: string;
  votingEndTime?: string;
  maxCandidates: number;
  candidates: Candidate[];
  totalRegisteredVoters: number;
  totalVotesCast: number;
  isRegistered?: boolean;
  hasVoted?: boolean;
}

export const VoterElectionView = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [election, setElection] = useState<ElectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const loadElection = async () => {
    if (!contractAddress) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/election/${contractAddress}`);
      if (data.success) {
        const electionData = data.data.election;
        
        // Check if voter is registered and has voted
        if (user?.walletAddress) {
          try {
            const voterData = await api.get(`/voter/${user.walletAddress}/elections`);
            if (voterData.data.success) {
              const voterElections = voterData.data.elections;
              const thisElection = voterElections.find(
                (e: any) => e.electionId.contractAddress === contractAddress
              );
              
              electionData.isRegistered = !!thisElection;
              electionData.hasVoted = thisElection?.hasVoted || false;
            }
          } catch (error) {
            console.error('Failed to check voter status:', error);
          }
        }
        
        setElection(electionData);
      }
    } catch (error) {
      console.error('Failed to load election:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerForElection = async () => {
    if (!privateKey.trim() || !contractAddress) return;

    setRegistering(true);
    try {
      const { data } = await api.post('/voter/register-election', {
        contractAddress,
        walletAddress: user?.walletAddress,
        privateKey: privateKey.trim()
      });

      if (data.success) {
        alert('Successfully registered for election!');
        setPrivateKey('');
        setShowRegistrationModal(false);
        await loadElection();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register for election');
    } finally {
      setRegistering(false);
    }
  };

  const castVote = async () => {
    if (!privateKey.trim() || selectedCandidate === null || !contractAddress) return;

    setVoting(true);
    try {
      const { data } = await api.post('/voter/vote', {
        contractAddress,
        candidateId: selectedCandidate,
        privateKey: privateKey.trim()
      });

      if (data.success) {
        alert('Vote cast successfully!');
        setPrivateKey('');
        setSelectedCandidate(null);
        setShowVoteModal(false);
        await loadElection();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  useEffect(() => {
    loadElection();
  }, [contractAddress, user]);

  const canRegister = () => {
    return election?.status === 'registration_open' && !election?.isRegistered && user?.role === 'voter';
  };

  const canVote = () => {
    return election?.status === 'voting_active' && election?.isRegistered && !election?.hasVoted && user?.role === 'voter';
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
          <div className="text-center">
            <div className="relative mx-auto w-16 h-16 mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-padding"></div>
              <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-border opacity-20"></div>
            </div>
            <p className="text-slate-300 font-medium animate-pulse text-lg">Loading election details...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!election) return (
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
            <p className="text-red-400 font-medium text-lg">Election not found</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative">← Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-10 px-6 space-y-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 mb-6 font-medium transition-all duration-300"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Elections</span>
          </button>
          
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-emerald-500 to-blue-600 bg-clip-text text-transparent mb-4">
                  {election.title}
                </h1>
                <p className="text-slate-300 text-lg mb-6 leading-relaxed">{election.description}</p>
                
                <div className="flex flex-wrap items-center gap-4">
                  <span className={`px-4 py-2 text-sm font-medium rounded-full border ${
                    election.status === 'results_announced' ? 'bg-slate-500/20 text-slate-300 border-slate-400/30' :
                    election.status === 'voting_active' ? 'bg-green-500/20 text-green-300 border-green-400/30' :
                    election.status === 'registration_open' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30' :
                    'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        election.status === 'results_announced' ? 'bg-slate-400' :
                        election.status === 'voting_active' ? 'bg-green-400' :
                        election.status === 'registration_open' ? 'bg-cyan-400' :
                        'bg-yellow-400'
                      }`}></div>
                      <span>{election.status.replace('_', ' ').toUpperCase()}</span>
                    </div>
                  </span>
                  
                  <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                    <svg className="w-4 h-4 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300 text-sm capitalize font-medium">{election.electionType} Election</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-3 min-w-48">
                {user?.role === 'voter' && (
                  <>
                    {canRegister() && (
                      <button
                        onClick={() => setShowRegistrationModal(true)}
                        className="group relative px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-medium"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span>Register to Vote</span>
                        </span>
                      </button>
                    )}
                    
                    {canVote() && (
                      <button
                        onClick={() => setShowVoteModal(true)}
                        className="group relative px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 font-medium animate-pulse"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center justify-center space-x-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Cast Your Vote</span>
                        </span>
                      </button>
                    )}
                    
                    {election.isRegistered && (
                      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${election.hasVoted ? 'bg-green-400' : 'bg-cyan-400'} animate-pulse`}></div>
                          <span className="text-slate-300 text-sm font-medium">
                            {election.hasVoted ? '✓ Vote Successfully Cast' : '✓ Registered to Vote'}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Election Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                  {election.candidates.length}
                </div>
                <div className="text-sm text-slate-400 font-medium">Candidates</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                  {election.totalRegisteredVoters}
                </div>
                <div className="text-sm text-slate-400 font-medium">Registered Voters</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                  {election.totalVotesCast}
                </div>
                <div className="text-sm text-slate-400 font-medium">Votes Cast</div>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl p-6 hover:scale-105 transition-all duration-300 group">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  {election.totalRegisteredVoters > 0 
                    ? Math.round((election.totalVotesCast / election.totalRegisteredVoters) * 100)
                    : 0
                  }%
                </div>
                <div className="text-sm text-slate-400 font-medium">Turnout</div>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates List */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 bg-clip-text text-transparent">
              Candidates
            </h2>
            <div className="bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
              <span className="text-slate-300 text-sm font-medium">{election.candidates.length} registered</span>
            </div>
          </div>
          
          {election.candidates.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {election.candidates.map((candidate, index) => (
                <div key={candidate.onChainId} className="group bg-slate-800/30 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-cyan-400/50 hover:scale-105 transition-all duration-300 shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                        <span className="text-white font-bold text-xl">
                          {candidate.candidateId.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{candidate.candidateId.name}</h3>
                        <p className="text-cyan-400 font-medium mb-1">{candidate.candidateId.party}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span className="bg-slate-700/50 px-2 py-1 rounded-lg">ID: {candidate.onChainId}</span>
                          <span className="bg-slate-700/50 px-2 py-1 rounded-lg">Age: {candidate.candidateId.age}</span>
                          <span className="bg-slate-700/50 px-2 py-1 rounded-lg">{candidate.candidateId.gender}</span>
                        </div>
                      </div>
                    </div>
                    
                    {candidate.votes !== undefined && (
                      <div className="text-right bg-slate-700/30 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                        <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                          {candidate.votes}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">votes</div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-slate-700/20 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                      <h4 className="text-sm font-semibold text-cyan-400 mb-2 flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Manifesto</span>
                      </h4>
                      <p className="text-slate-300 text-sm leading-relaxed">{candidate.candidateId.manifesto}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center space-x-2 bg-slate-700/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/5">
                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                        <span className="text-slate-300 text-sm">{candidate.candidateId.email}</span>
                      </div>
                      
                      {candidate.candidateId.phone && (
                        <div className="flex items-center space-x-2 bg-slate-700/20 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/5">
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-slate-300 text-sm">{candidate.candidateId.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
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

        {/* Election Details */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Election Details
            </h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  <span>Election Type</span>
                </h3>
                <p className="text-white text-lg font-medium capitalize">{election.electionType}</p>
              </div>
              
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Current Status</span>
                </h3>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    election.status === 'results_announced' ? 'bg-slate-400' :
                    election.status === 'voting_active' ? 'bg-green-400' :
                    election.status === 'registration_open' ? 'bg-cyan-400' :
                    'bg-yellow-400'
                  }`}></div>
                  <p className="text-white text-lg font-medium capitalize">{election.status.replace('_', ' ')}</p>
                </div>
              </div>
              
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  <span>Maximum Candidates</span>
                </h3>
                <div className="flex items-center space-x-2">
                  <p className="text-white text-lg font-medium">{election.maxCandidates}</p>
                  <span className="text-slate-400 text-sm">({election.candidates.length} registered)</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  <span>Contract Address</span>
                </h3>
                <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-4 border border-white/5">
                  <code className="text-xs font-mono text-cyan-400 break-all block leading-relaxed">
                    {election.contractAddress}
                  </code>
                </div>
              </div>
              
              {election.votingStartTime && (
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span>Voting Period</span>
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                      <div className="text-emerald-400 text-xs font-medium mb-1">Start Time</div>
                      <div className="text-white text-sm">{new Date(election.votingStartTime).toLocaleString()}</div>
                    </div>
                    {election.votingEndTime && (
                      <div className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-3 border border-white/5">
                        <div className="text-red-400 text-xs font-medium mb-1">End Time</div>
                        <div className="text-white text-sm">{new Date(election.votingEndTime).toLocaleString()}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Modal */}
        {showRegistrationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-md w-full shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-500 bg-clip-text text-transparent">
                      Register for Election
                    </h2>
                    <p className="text-slate-400 mt-1">Join this election as a voter</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setPrivateKey('');
                    }}
                    className="group p-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-cyan-500/10 backdrop-blur-sm rounded-2xl p-4 border border-cyan-400/30 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-cyan-300 text-sm font-medium mb-1">Blockchain Registration</p>
                      <p className="text-cyan-200/80 text-xs leading-relaxed">
                        Enter your wallet private key to register for this election on the blockchain. 
                        This creates a permanent, tamper-proof registration record.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-cyan-400 mb-3">Private Key</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2V9a2 2 0 00-2-2m2 2a2 2 0 002 2m-2-2a2 2 0 01-2 2" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        placeholder="Enter your wallet private key"
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/50 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowRegistrationModal(false);
                        setPrivateKey('');
                      }}
                      className="group relative flex-1 px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:text-white hover:scale-105 transition-all duration-300 font-medium"
                    >
                      <span className="relative flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancel</span>
                      </span>
                    </button>
                    <button
                      onClick={registerForElection}
                      disabled={!privateKey.trim() || registering}
                      className="group relative flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        {registering ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Registering...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                            <span>Register</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Voting Modal */}
        {showVoteModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                      Cast Your Vote
                    </h2>
                    <p className="text-slate-400 mt-1">Make your democratic choice</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowVoteModal(false);
                      setSelectedCandidate(null);
                      setPrivateKey('');
                    }}
                    className="group p-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-emerald-500/10 backdrop-blur-sm rounded-2xl p-4 border border-emerald-400/30 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-emerald-300 text-sm font-medium mb-1">Important Notice</p>
                      <p className="text-emerald-200/80 text-xs leading-relaxed">
                        Select a candidate and confirm your vote. This action cannot be undone and will be permanently recorded on the blockchain.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Select Your Candidate</h3>
                  {election.candidates.map((candidate) => (
                    <div 
                      key={candidate.onChainId}
                      className={`group border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                        selectedCandidate === candidate.onChainId
                          ? 'border-emerald-400/50 bg-emerald-500/10 backdrop-blur-sm shadow-lg shadow-emerald-500/25 scale-105'
                          : 'border-white/10 bg-slate-800/30 backdrop-blur-sm hover:border-emerald-400/30 hover:bg-emerald-500/5 hover:scale-102'
                      }`}
                      onClick={() => setSelectedCandidate(candidate.onChainId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            selectedCandidate === candidate.onChainId
                              ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                              : 'bg-gradient-to-r from-slate-600 to-slate-700 group-hover:from-emerald-500/50 group-hover:to-green-600/50'
                          }`}>
                            <span className="text-white font-bold">
                              {candidate.candidateId.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{candidate.candidateId.name}</h3>
                            <p className="text-emerald-400 font-medium">{candidate.candidateId.party}</p>
                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">{candidate.candidateId.manifesto}</p>
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          selectedCandidate === candidate.onChainId
                            ? 'border-emerald-400 bg-emerald-400'
                            : 'border-slate-400 group-hover:border-emerald-400'
                        }`}>
                          {selectedCandidate === candidate.onChainId && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-emerald-400 mb-3">
                      Private Key (required for blockchain transaction)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2V9a2 2 0 00-2-2m2 2a2 2 0 002 2m-2-2a2 2 0 01-2 2" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        placeholder="Enter your wallet private key"
                        className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-400/50 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowVoteModal(false);
                        setSelectedCandidate(null);
                        setPrivateKey('');
                      }}
                      className="group relative flex-1 px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:text-white hover:scale-105 transition-all duration-300 font-medium"
                    >
                      <span className="relative flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Cancel</span>
                      </span>
                    </button>
                    <button
                      onClick={castVote}
                      disabled={selectedCandidate === null || !privateKey.trim() || voting}
                      className="group relative flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        {voting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Casting Vote...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Cast Vote</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
