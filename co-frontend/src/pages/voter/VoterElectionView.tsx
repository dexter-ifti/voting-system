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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'results_announced': return 'bg-gray-100 text-gray-800';
      case 'voting_active': return 'bg-green-100 text-green-800';
      case 'registration_open': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const canRegister = () => {
    return election?.status === 'registration_open' && !election?.isRegistered && user?.role === 'voter';
  };

  const canVote = () => {
    return election?.status === 'voting_active' && election?.isRegistered && !election?.hasVoted && user?.role === 'voter';
  };

  if (loading) return <div className="p-8 text-center">Loading election details...</div>;
  if (!election) return <div className="p-8 text-center text-red-500">Election not found</div>;

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="text-primary hover:underline mb-4"
        >
          ← Back
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{election.title}</h1>
            <p className="text-muted-foreground mb-4">{election.description}</p>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(election.status)}`}>
                {election.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="text-sm text-muted-foreground capitalize">
                {election.electionType} Election
              </span>
            </div>
          </div>
          
          <div className="text-right">
            {user?.role === 'voter' && (
              <div className="space-y-2">
                {canRegister() && (
                  <button
                    onClick={() => setShowRegistrationModal(true)}
                    className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Register to Vote
                  </button>
                )}
                
                {canVote() && (
                  <button
                    onClick={() => setShowVoteModal(true)}
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Cast Your Vote
                  </button>
                )}
                
                {election.isRegistered && (
                  <div className="text-xs text-muted-foreground">
                    {election.hasVoted ? '✓ You have voted' : '✓ Registered to vote'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Election Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{election.candidates.length}</div>
          <div className="text-sm text-muted-foreground">Candidates</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{election.totalRegisteredVoters}</div>
          <div className="text-sm text-muted-foreground">Registered Voters</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{election.totalVotesCast}</div>
          <div className="text-sm text-muted-foreground">Votes Cast</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {election.totalRegisteredVoters > 0 
              ? Math.round((election.totalVotesCast / election.totalRegisteredVoters) * 100)
              : 0
            }%
          </div>
          <div className="text-sm text-muted-foreground">Turnout</div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Candidates</h2>
        
        {election.candidates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {election.candidates.map((candidate) => (
              <div key={candidate.onChainId} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{candidate.candidateId.name}</h3>
                    <p className="text-sm text-muted-foreground">{candidate.candidateId.party}</p>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {candidate.onChainId} • Age: {candidate.candidateId.age} • {candidate.candidateId.gender}
                    </div>
                  </div>
                  
                  {candidate.votes !== undefined && (
                    <div className="text-right">
                      <div className="text-lg font-bold">{candidate.votes}</div>
                      <div className="text-xs text-muted-foreground">votes</div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div>
                    <h4 className="text-sm font-medium">Manifesto</h4>
                    <p className="text-sm text-muted-foreground">{candidate.candidateId.manifesto}</p>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    <span>📧 {candidate.candidateId.email}</span>
                    {candidate.candidateId.phone && (
                      <span className="ml-4">📞 {candidate.candidateId.phone}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium mb-2">No Candidates Yet</h3>
            <p className="text-muted-foreground">
              Candidates haven't registered for this election yet.
            </p>
          </div>
        )}
      </div>

      {/* Election Details */}
      <div className="mt-8 bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Election Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Election Type</h3>
              <p className="capitalize">{election.electionType}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="capitalize">{election.status.replace('_', ' ')}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Maximum Candidates</h3>
              <p>{election.maxCandidates}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Contract Address</h3>
              <code className="text-xs bg-muted/50 p-2 rounded block font-mono break-all">
                {election.contractAddress}
              </code>
            </div>
            
            {election.votingStartTime && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Voting Period</h3>
                <p className="text-sm">
                  {new Date(election.votingStartTime).toLocaleString()}
                  {election.votingEndTime && (
                    <> - {new Date(election.votingEndTime).toLocaleString()}</>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Register for Election</h2>
              <p className="text-muted-foreground mb-4">
                Enter your wallet private key to register for this election on the blockchain.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Private Key</label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your wallet private key"
                    className="w-full p-3 border border-border rounded-lg"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setPrivateKey('');
                    }}
                    className="flex-1 py-3 border border-border rounded-lg hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={registerForElection}
                    disabled={!privateKey.trim() || registering}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {registering ? 'Registering...' : 'Register'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voting Modal */}
      {showVoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Cast Your Vote</h2>
              <p className="text-muted-foreground mb-6">
                Select a candidate and confirm your vote. This action cannot be undone.
              </p>
              
              <div className="space-y-4 mb-6">
                {election.candidates.map((candidate) => (
                  <div 
                    key={candidate.onChainId}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedCandidate === candidate.onChainId
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedCandidate(candidate.onChainId)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{candidate.candidateId.name}</h3>
                        <p className="text-sm text-muted-foreground">{candidate.candidateId.party}</p>
                      </div>
                      <input
                        type="radio"
                        checked={selectedCandidate === candidate.onChainId}
                        onChange={() => setSelectedCandidate(candidate.onChainId)}
                        className="mr-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Private Key (required for blockchain transaction)
                  </label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your wallet private key"
                    className="w-full p-3 border border-border rounded-lg"
                  />
                </div>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowVoteModal(false);
                      setSelectedCandidate(null);
                      setPrivateKey('');
                    }}
                    className="flex-1 py-3 border border-border rounded-lg hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={castVote}
                    disabled={selectedCandidate === null || !privateKey.trim() || voting}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {voting ? 'Casting Vote...' : 'Cast Vote'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
