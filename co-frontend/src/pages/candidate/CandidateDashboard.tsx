import { useEffect, useState } from 'react';
import { api, registerCandidateForElection } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { CandidateAnalytics } from './CandidateAnalytics';
import { ElectionResults } from '../../components/ElectionResults';

interface CandidateProfile {
  _id: string;
  candidateId: string;
  name: string;
  party: string;
  manifesto: string;
  age: number;
  gender: string;
  walletAddress: string;
  email: string;
  phone: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  elections: Array<{
    electionId: {
      _id: string;
      title: string;
      electionType: string;
      status: string;
      contractAddress: string;
    };
    votesReceived: number;
  }>;
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
    onChainId: number;
  }>;
  totalRegisteredVoters: number;
  totalVotesCast: number;
}

export const CandidateDashboard = () => {
  const user = useAuthStore(s => s.user);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [availableElections, setAvailableElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string>('');
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'elections' | 'register' | 'analytics' | 'results'>('dashboard');
  const [registerForm, setRegisterForm] = useState({
    contractAddress: '',
    privateKey: ''
  });
  const [selectedResultsContractAddress, setSelectedResultsContractAddress] = useState<string>('');

  const loadProfile = async () => {
    if (!user?.walletAddress) return;
    
    setLoading(true);
    try {
      const { data } = await api.get(`/candidate/profile/${user.walletAddress}`);
      if (data.success) {
        setProfile(data.data.candidate);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableElections = async () => {
    try {
      const { data } = await api.get('/election?status=registration_open');
      if (data.success) {
        // Filter out elections where candidate is already registered
        const filtered = data.data.elections.filter((election: Election) => 
          !election.candidates.some(c => c.candidateId === profile?._id)
        );
        setAvailableElections(filtered);
      }
    } catch (error) {
      console.error('Failed to load elections:', error);
    }
  };

  const registerForElection = async (contractAddress: string) => {
    if (!profile || !registerForm.privateKey) {
      alert('Please enter your private key');
      return;
    }

    setRegistering(contractAddress);
    try {
      const result = await registerCandidateForElection({
        contractAddress,
        walletAddress: user?.walletAddress || '',
        privateKey: registerForm.privateKey
      });

      if (result.success) {
        alert('Successfully registered for election!');
        setRegisterForm({ contractAddress: '', privateKey: '' });
        await loadProfile();
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

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    if (profile) {
      loadAvailableElections();
    }
  }, [profile]);

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-semibold text-blue-600">
            {profile?.verificationStatus === 'verified' ? '✓' : profile?.verificationStatus === 'rejected' ? '✗' : '⏳'}
          </div>
          <div className="text-sm text-muted-foreground">Verification Status</div>
          <div className="text-xs mt-1 capitalize">{profile?.verificationStatus}</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-semibold text-green-600">{profile?.elections?.length || 0}</div>
          <div className="text-sm text-muted-foreground">Elections Participated</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-semibold text-purple-600">
            {profile?.elections?.reduce((sum, e) => sum + e.votesReceived, 0) || 0}
          </div>
          <div className="text-sm text-muted-foreground">Total Votes Received</div>
        </div>
      </div>

      {/* Verification Status */}
      {profile?.verificationStatus === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800">Verification Pending</h3>
          <p className="text-sm text-yellow-700 mt-1">
            Your candidate application is under review. You'll be notified once verified.
          </p>
        </div>
      )}

      {profile?.verificationStatus === 'rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800">Application Rejected</h3>
          <p className="text-sm text-red-700 mt-1">
            Your candidate application was rejected. Please contact support for more information.
          </p>
        </div>
      )}

      {/* Recent Elections */}
      {profile?.elections && profile.elections.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Your Elections</h3>
          <div className="space-y-3">
            {profile.elections.slice(0, 3).map((election, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{election.electionId.title}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {election.electionId.electionType} • {election.electionId.status.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold">{election.votesReceived}</div>
                    <div className="text-xs text-muted-foreground">votes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Elections */}
      {profile?.verificationStatus === 'verified' && availableElections.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Available Elections</h3>
          <div className="space-y-3">
            {availableElections.slice(0, 2).map((election) => (
              <div key={election._id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{election.title}</h4>
                    <p className="text-sm text-muted-foreground">{election.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {election.candidates.length}/{election.maxCandidates} candidates registered
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setRegisterForm({ ...registerForm, contractAddress: election.contractAddress });
                      setCurrentView('register');
                    }}
                    className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
                  >
                    Register
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Candidate Profile</h2>
      
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-lg">{profile.name}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Party</label>
              <p>{profile.party}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Age</label>
              <p>{profile.age}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p>{profile.gender}</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p>{profile.email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p>{profile.phone}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Candidate ID</label>
              <p className="font-mono text-sm">{profile.candidateId}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
              <p className="font-mono text-sm break-all">{profile.walletAddress}</p>
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-muted-foreground">Manifesto</label>
            <div className="mt-2 bg-muted/50 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{profile.manifesto}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderElections = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">My Elections</h2>
      
      {profile?.elections && profile.elections.length > 0 ? (
        <div className="space-y-4">
          {profile.elections.map((election, index) => (
            <div key={index} className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium">{election.electionId.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">
                    {election.electionId.electionType} Election
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  election.electionId.status === 'results_announced' 
                    ? 'bg-gray-100 text-gray-800' 
                    : election.electionId.status === 'voting_active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {election.electionId.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-2xl font-semibold">{election.votesReceived}</div>
                  <div className="text-xs text-muted-foreground">Votes Received</div>
                </div>
                <div>
                  <div className="text-sm font-mono">{election.electionId.contractAddress.slice(0, 10)}...</div>
                  <div className="text-xs text-muted-foreground">Contract Address</div>
                </div>
              </div>
              
              {/* View Results Button for Announced Results */}
              {election.electionId.status === 'results_announced' && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setSelectedResultsContractAddress(election.electionId.contractAddress);
                      setCurrentView('results');
                    }}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    📊 View Election Results
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No elections participated yet
        </div>
      )}
    </div>
  );

  const renderRegister = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Register for Elections</h2>
      
      {profile?.verificationStatus !== 'verified' ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            You must be verified before registering for elections.
          </p>
        </div>
      ) : availableElections.length > 0 ? (
        <div className="space-y-4">
          {availableElections.map((election) => (
            <div key={election._id} className="bg-card border border-border rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-medium">{election.title}</h3>
                  <p className="text-sm text-muted-foreground">{election.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Type: {election.electionType} • Status: {election.status.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Candidates: {election.candidates.length}/{election.maxCandidates}
                  </p>
                </div>
              </div>
              
              {registerForm.contractAddress === election.contractAddress && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">Private Key</label>
                    <input
                      type="password"
                      value={registerForm.privateKey}
                      onChange={(e) => setRegisterForm({ ...registerForm, privateKey: e.target.value })}
                      placeholder="Enter your private key for blockchain registration"
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Your private key is used to register on the blockchain and is not stored.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => registerForElection(election.contractAddress)}
                      disabled={registering === election.contractAddress || !registerForm.privateKey}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                    >
                      {registering === election.contractAddress ? 'Registering...' : 'Confirm Registration'}
                    </button>
                    <button
                      onClick={() => setRegisterForm({ contractAddress: '', privateKey: '' })}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {registerForm.contractAddress !== election.contractAddress && (
                <button
                  onClick={() => setRegisterForm({ ...registerForm, contractAddress: election.contractAddress })}
                  disabled={election.candidates.length >= election.maxCandidates}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {election.candidates.length >= election.maxCandidates ? 'Full' : 'Register for Election'}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No elections available for registration
        </div>
      )}
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'profile':
        return renderProfile();
      case 'elections':
        return renderElections();
      case 'register':
        return renderRegister();
      case 'analytics':
        return <CandidateAnalytics />;
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
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold">Candidate Portal</h1>
              <span className="text-sm text-muted-foreground">
                {profile.name} • {profile.party}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              {profile.candidateId}
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
              My Elections ({profile.elections?.length || 0})
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
            {profile.verificationStatus === 'verified' && (
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
            )}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-10 px-6">
        {renderCurrentView()}
      </div>
    </div>
  );
};
