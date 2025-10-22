import { useEffect, useState } from 'react';
import { api, registerVoterForElection } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { VoterAnalytics } from './VoterAnalytics';
import { ElectionResults } from '../../components/ElectionResults';

interface VoterElection {
  electionId: {
    _id: string;
    title: string;
    electionType: string;
    status?: string;
    contractAddress: string;
  };
  hasVoted: boolean;
  votedAt?: string;
}

interface VoterProfile {
  _id: string;
  voterId: string;
  name: string;
  age: number;
  gender: string;
  walletAddress: string;
  email: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  elections: VoterElection[];
  createdAt: string;
  lastLogin?: string;
}

interface Election {
  _id: string;
  title: string;
  description: string;
  electionType: string;
  contractAddress: string;
  status: string;
  votingStartTime?: string;
  votingEndTime?: string;
  maxCandidates: number;
  candidates: Array<{
    candidateId: string;
    name: string;
    party: string;
    onChainId: number;
  }>;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  isRegistered?: boolean;
  hasVoted?: boolean;
}

export const VoterDashboard = () => {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [profile, setProfile] = useState<VoterProfile | null>(null);
  const [voterElections, setVoterElections] = useState<VoterElection[]>([]);
  const [availableElections, setAvailableElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'elections' | 'vote' | 'register' | 'analytics' | 'results'>('dashboard');
  const [registering, setRegistering] = useState('');
  const [voting, setVoting] = useState('');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [selectedResultsContractAddress, setSelectedResultsContractAddress] = useState<string>('');

  const loadProfile = async () => {
    if (!user?.walletAddress) return;

    try {
      const { data } = await api.get(`/voter/profile/${user.walletAddress}`);
      if (data.success) {
        setProfile(data.data.voter);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadVoterElections = async () => {
    if (!user?.walletAddress) return;

    try {
      console.log('Loading voter elections for wallet:', user.walletAddress);
      const { data } = await api.get(`/voter/${user.walletAddress}/elections`);
      console.log('Raw voter elections response:', data);
      if (data.success) {
        console.log('Loaded voter elections:', data.data.elections);
        // Filter out any elections with malformed data
        const validElections = data.data.elections.filter((election: any) => 
          election && election.electionId && election.electionId._id
        );
        console.log('Valid voter elections after filtering:', validElections);
        setVoterElections(validElections);
      }
    } catch (error) {
      console.error('Failed to load voter elections:', error);
    }
  };

  const loadAvailableElections = async () => {
    try {
      // Query backend for elections with registration open
      const { data } = await api.get('/election', { params: { status: 'registration_open', limit: 50 } });
      if (data.success) {
        const registeredElectionIds = voterElections.map(e => e.electionId._id);
        const available = (data.data.elections || []).filter(
          (election: Election) => !registeredElectionIds.includes(election._id)
        );
        setAvailableElections(available);
      }
    } catch (error) {
      console.error('Failed to load available elections:', error);
    }
  };

  const registerForElection = async (contractAddress: string) => {
    if (!privateKey.trim()) {
      alert('Please enter your wallet private key');
      return;
    }

    setRegistering(contractAddress);
    try {
      const result = await registerVoterForElection({
        contractAddress,
        walletAddress: user?.walletAddress || '',
        privateKey: privateKey.trim()
      });

      if (result.success) {
        alert('Successfully registered for election!');
        setPrivateKey('');
        await loadVoterElections();
        await loadAvailableElections();
      } else {
        alert(result.message || 'Failed to register for election');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to register for election');
    } finally {
      setRegistering('');
    }
  };

  const castVote = async (candidateId: number, contractAddress: string) => {
    if (!privateKey.trim()) {
      alert('Please enter your wallet private key');
      return;
    }

    setVoting(contractAddress);
    try {
      const { data } = await api.post('/voter/vote', {
        contractAddress,
        candidateId,
        privateKey: privateKey.trim()
      });

      if (data.success) {
        alert('Vote cast successfully!');
        setPrivateKey('');
        setSelectedElection(null);
        await loadVoterElections();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setVoting('');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadProfile();
      await loadVoterElections();
      setLoading(false);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    // Load available elections regardless of how many the voter is already in
    loadAvailableElections();
  }, [voterElections]);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-semibold text-blue-600">
            {profile?.verificationStatus === 'verified' ? '✓' : profile?.verificationStatus === 'rejected' ? '✗' : '⏳'}
          </div>
          <div className="text-sm text-muted-foreground">Verification Status</div>
          <div className="text-xs mt-1 capitalize">{profile?.verificationStatus}</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-semibold text-green-600">{voterElections.length}</div>
          <div className="text-sm text-muted-foreground">Elections Registered</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-semibold text-purple-600">
            {voterElections.filter(e => e.hasVoted).length}
          </div>
          <div className="text-sm text-muted-foreground">Votes Cast</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-semibold text-orange-600">{availableElections.length}</div>
          <div className="text-sm text-muted-foreground">Available Elections</div>
        </div>
      </div>

      {/* Verification Status */}
      {profile?.verificationStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800">Verification Pending</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Your voter registration is under review. You'll be notified once verified.
          </p>
        </div>
      )}

      {profile?.verificationStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800">Verification Rejected</h3>
          <p className="text-sm text-red-700 mt-1">
            Your voter registration was rejected. Please contact support for more information.
          </p>
        </div>
      )}

      {/* Quick Actions */}
      {profile?.verificationStatus === 'verified' && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('vote')}
              className="p-4 bg-primary/10 border border-primary/20 rounded-lg text-left hover:bg-primary/20 transition-colors"
            >
              <div className="font-medium">Cast Your Vote</div>
              <div className="text-sm text-muted-foreground mt-1">
                Vote in active elections
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView('register')}
              className="p-4 bg-green-50 border border-green-200 rounded-lg text-left hover:bg-green-100 transition-colors"
            >
              <div className="font-medium">Register for Elections</div>
              <div className="text-sm text-muted-foreground mt-1">
                Join upcoming elections
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
        {voterElections.length > 0 ? (
          voterElections.filter(election => election?.electionId?._id).slice(0, 3).map((election) => (
            <div key={election.electionId._id} className="flex justify-between items-center py-3 border-b border-border last:border-b-0">
              <div>
                <div className="font-medium">{election.electionId.title || 'Untitled Election'}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {election.electionId.electionType || 'Unknown Type'} • {election.electionId.status?.replace('_', ' ') || 'Unknown Status'}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${election.hasVoted ? 'text-green-600' : 'text-yellow-600'}`}>
                  {election.hasVoted ? 'Voted' : 'Registered'}
                </div>
                {election.votedAt && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(election.votedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No election activity yet
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Voter Profile</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <div className="mt-1 text-sm">{profile?.name}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Age</label>
              <div className="mt-1 text-sm">{profile?.age}</div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <div className="mt-1 text-sm">{profile?.gender}</div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <div className="mt-1 text-sm">{profile?.email}</div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Voter ID</label>
              <div className="mt-1 text-sm font-mono bg-muted/50 p-2 rounded">
                {profile?.voterId}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <div className="mt-1 text-xs font-mono bg-muted/50 p-2 rounded break-all">
                {profile?.walletAddress}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Verification Status</label>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  profile?.verificationStatus === 'verified' 
                    ? 'bg-green-100 text-green-800'
                    : profile?.verificationStatus === 'rejected'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {profile?.verificationStatus}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">Member Since</label>
              <div className="mt-1 text-sm">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderElections = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">My Elections</h3>
        
        {voterElections.length > 0 ? (
          <div className="space-y-4">
            {voterElections.filter(election => election?.electionId?._id).map((election) => (
              <div key={election.electionId._id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{election.electionId.title || 'Untitled Election'}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {election.electionId.electionType || 'Unknown Type'} Election
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Status: {election.electionId.status?.replace('_', ' ') || 'Unknown Status'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Contract: {election.electionId.contractAddress?.slice(0, 10) || 'Unknown'}...
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${election.hasVoted ? 'text-green-600' : 'text-blue-600'}`}>
                      {election.hasVoted ? 'Voted' : 'Registered'}
                    </div>
                    {election.votedAt && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Voted: {new Date(election.votedAt).toLocaleDateString()}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (election.electionId.contractAddress) {
                          navigate(`/elections/${election.electionId.contractAddress}`);
                        }
                      }}
                      className="mt-2 text-xs text-primary hover:underline"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🗳️</div>
            <h3 className="text-lg font-medium mb-2">No Elections Yet</h3>
            <p className="text-muted-foreground">
              You haven't registered for any elections yet.
            </p>
            <button
              onClick={() => setCurrentView('register')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Register for Elections
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderVoting = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Cast Your Vote</h3>
        
        {/* Active Elections for Voting */}
        <div className="space-y-4">
          {voterElections
            .filter(e => e.electionId && e.electionId.status && ['voting_active', 'registration_open'].includes(e.electionId.status) && !e.hasVoted)
            .map((election) => (
              <div key={election.electionId._id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{election.electionId.title || 'Untitled Election'}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {election.electionId.electionType || 'Unknown Type'} Election
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    election.electionId.status === 'voting_active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {election.electionId.status === 'voting_active' ? 'Voting Active' : 'Registered'}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    // Create an Election object for the modal
                    setSelectedElection({
                      _id: election.electionId._id,
                      title: election.electionId.title || 'Untitled Election',
                      description: '',
                      electionType: election.electionId.electionType || 'general',
                      contractAddress: election.electionId.contractAddress,
                      status: election.electionId.status || 'voting_active',
                      candidates: [],
                      totalRegisteredVoters: 0,
                      totalVotesCast: 0,
                      maxCandidates: 0
                    });
                  }}
                  disabled={election.electionId.status !== 'voting_active'}
                  className={`w-full py-2 rounded-lg transition-colors ${
                    election.electionId.status === 'voting_active'
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  {election.electionId.status === 'voting_active' 
                    ? 'Vote in this Election' 
                    : 'Voting Not Started'}
                </button>
              </div>
            ))}
        </div>

        {voterElections.filter(e => e.electionId && e.electionId.status && ['voting_active', 'registration_open'].includes(e.electionId.status) && !e.hasVoted).length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-lg font-medium mb-2">No Active Voting</h3>
            <p className="text-muted-foreground mb-4">
              {voterElections.length === 0 
                ? "You haven't registered for any elections yet."
                : voterElections.every(e => e.hasVoted)
                ? "You have voted in all your registered elections. Thank you for participating!"
                : "No elections are currently accepting votes."
              }
            </p>
            {voterElections.length === 0 && (
              <button
                onClick={() => setCurrentView('register')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Register for Elections
              </button>
            )}
          </div>
        )}
      </div>

      {/* Elections with Results Available */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">📊 View Election Results</h3>
        
        <div className="space-y-4">
          {voterElections
            .filter(e => e.electionId && e.electionId.status === 'results_announced')
            .map((election) => (
              <div key={election.electionId._id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-medium">{election.electionId.title || 'Untitled Election'}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {election.electionId.electionType || 'Unknown Type'} Election
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {election.hasVoted ? '✅ You voted in this election' : '⚠️ You did not vote in this election'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                    Results Announced
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedResultsContractAddress(election.electionId.contractAddress);
                    setCurrentView('results');
                  }}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Results
                </button>
              </div>
            ))}
        </div>

        {voterElections.filter(e => e.electionId && e.electionId.status === 'results_announced').length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium mb-2">No Results Available</h3>
            <p className="text-muted-foreground">
              Results will appear here when elections you participated in have been completed and results announced.
            </p>
          </div>
        )}
      </div>

      {/* Voting Modal */}
      {selectedElection && (
        <VotingModal 
          election={selectedElection}
          onClose={() => setSelectedElection(null)}
          onVote={castVote}
          voting={voting}
          privateKey={privateKey}
          setPrivateKey={setPrivateKey}
        />
      )}
    </div>
  );

  const renderRegistration = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Register for Elections</h3>
        
        {availableElections.length > 0 ? (
          <div className="space-y-4">
            {availableElections.map((election) => (
              <div key={election._id} className="border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{election.title}</h4>
                    <p className="text-sm text-muted-foreground">{election.description}</p>
                    <p className="text-sm text-muted-foreground capitalize mt-1">
                      {election.electionType} Election
                    </p>
                    <div className="text-xs text-muted-foreground mt-2">
                      <span>Candidates: {election.candidates?.length || 0}</span>
                      <span className="mx-2">•</span>
                      <span>Max: {election.maxCandidates}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      Registration Open
                    </span>
                    
                    <div className="mt-3">
                      <input
                        type="password"
                        placeholder="Private Key"
                        value={privateKey}
                        onChange={(e) => setPrivateKey(e.target.value)}
                        className="text-xs p-2 border rounded w-full mb-2"
                      />
                      <button
                        onClick={() => registerForElection(election.contractAddress)}
                        disabled={registering === election.contractAddress || !privateKey.trim()}
                        className="w-full text-xs bg-primary text-primary-foreground py-2 rounded hover:bg-primary/90 disabled:opacity-50"
                      >
                        {registering === election.contractAddress ? 'Registering...' : 'Register'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">No Available Elections</h3>
            <p className="text-muted-foreground">
              There are no elections open for registration at the moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return renderProfile();
      case 'elections':
        return renderElections();
      case 'vote':
        return renderVoting();
      case 'register':
        return renderRegistration();
      case 'analytics':
        return <VoterAnalytics />;
      case 'results':
        return selectedResultsContractAddress ? (
          <ElectionResults 
            contractAddress={selectedResultsContractAddress}
            onClose={() => {
              setCurrentView('dashboard');
              setSelectedResultsContractAddress('');
            }}
          />
        ) : (
          <div className="text-center p-8">
            <p className="text-muted-foreground">No election selected for results viewing.</p>
            <button 
              onClick={() => setCurrentView('dashboard')}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Back to Dashboard
            </button>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  if (loading) return <div className="p-8 text-sm text-slate-400">Loading...</div>;
  if (!profile) return <div className="p-8 text-sm text-red-400">Failed to load profile</div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl font-semibold">Voter Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {profile.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded-full ${
                profile.verificationStatus === 'verified' 
                  ? 'bg-green-100 text-green-800'
                  : profile.verificationStatus === 'rejected'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {profile.verificationStatus}
              </span>
            </div>
          </div>
          
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
              onClick={() => setCurrentView('profile')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'profile'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setCurrentView('elections')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'elections'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              My Elections ({voterElections.length})
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                currentView === 'analytics'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Analytics
            </button>
            {profile.verificationStatus === 'verified' && (
              <>
                <button
                  onClick={() => setCurrentView('vote')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    currentView === 'vote'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Vote
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    currentView === 'register'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Register for Elections
                </button>
                <button
                  onClick={() => setCurrentView('results')}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    currentView === 'results'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Results
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {renderCurrentView()}
      </div>
    </div>
  );
};

// Voting Modal Component
const VotingModal = ({ 
  election, 
  onClose, 
  onVote, 
  voting, 
  privateKey, 
  setPrivateKey 
}: {
  election: Election;
  onClose: () => void;
  onVote: (candidateId: number, contractAddress: string) => void;
  voting: string;
  privateKey: string;
  setPrivateKey: (key: string) => void;
}) => {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const { data } = await api.get(`/election/${election.contractAddress}`);
        if (data.success) {
          setCandidates(data.data.election.candidates || []);
        }
      } catch (error) {
        console.error('Failed to load candidates:', error);
      } finally {
        setLoading(false);
      }
    };
    loadCandidates();
  }, [election.contractAddress]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{election.title}</h2>
              <p className="text-muted-foreground">Select a candidate to vote for</p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading candidates...</div>
          ) : (
            <div className="space-y-4">
              {candidates.map((candidate) => (
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
                      <h3 className="font-medium">{candidate.candidateId?.name || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">
                        {candidate.candidateId?.party || 'Independent'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        checked={selectedCandidate === candidate.onChainId}
                        onChange={() => setSelectedCandidate(candidate.onChainId)}
                        className="mr-2"
                      />
                      <span className="text-sm text-muted-foreground">
                        ID: {candidate.onChainId}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="mt-6 space-y-4">
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
                    onClick={onClose}
                    className="flex-1 py-3 border border-border rounded-lg hover:bg-muted"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedCandidate !== null) {
                        onVote(selectedCandidate, election.contractAddress);
                      }
                    }}
                    disabled={selectedCandidate === null || !privateKey.trim() || voting === election.contractAddress}
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                  >
                    {voting === election.contractAddress ? 'Casting Vote...' : 'Cast Vote'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
