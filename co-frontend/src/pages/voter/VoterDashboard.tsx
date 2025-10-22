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
    <div className="space-y-8">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Verification Status Card */}
        <div className={`group relative backdrop-blur-sm rounded-3xl p-6 shadow-xl transition-all duration-500 hover:scale-105 ${
          profile?.verificationStatus === 'verified' 
            ? 'bg-gradient-to-br from-emerald-800/30 to-green-800/30 border border-emerald-500/30 shadow-emerald-500/10 hover:shadow-emerald-500/25'
            : profile?.verificationStatus === 'rejected'
            ? 'bg-gradient-to-br from-red-800/30 to-pink-800/30 border border-red-500/30 shadow-red-500/10 hover:shadow-red-500/25'
            : 'bg-gradient-to-br from-amber-800/30 to-orange-800/30 border border-amber-500/30 shadow-amber-500/10 hover:shadow-amber-500/25'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                profile?.verificationStatus === 'verified' 
                  ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/25'
                  : profile?.verificationStatus === 'rejected'
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/25'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25'
              }`}>
                <span className="text-white text-xl">
                  {profile?.verificationStatus === 'verified' ? '✓' : profile?.verificationStatus === 'rejected' ? '✗' : '⏳'}
                </span>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium mb-1 ${
                  profile?.verificationStatus === 'verified' ? 'text-emerald-300'
                  : profile?.verificationStatus === 'rejected' ? 'text-red-300'
                  : 'text-amber-300'
                }`}>Verification</p>
                <p className="text-2xl font-bold text-white capitalize">{profile?.verificationStatus}</p>
              </div>
            </div>
            <div className={`h-1.5 rounded-full ${
              profile?.verificationStatus === 'verified' 
                ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                : profile?.verificationStatus === 'rejected'
                ? 'bg-gradient-to-r from-red-500 to-pink-500'
                : 'bg-gradient-to-r from-amber-500 to-orange-500'
            }`}></div>
          </div>
        </div>
        
        {/* Elections Registered Card */}
        <div className="group relative backdrop-blur-sm bg-gradient-to-br from-cyan-800/30 to-blue-800/30 border border-cyan-500/30 rounded-3xl p-6 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/25 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <span className="text-white text-xl">🗳️</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-cyan-300 font-medium mb-1">Elections</p>
                <p className="text-2xl font-bold text-white">{voterElections.length}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Votes Cast Card */}
        <div className="group relative backdrop-blur-sm bg-gradient-to-br from-purple-800/30 to-indigo-800/30 border border-purple-500/30 rounded-3xl p-6 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/25 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white text-xl">✅</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-300 font-medium mb-1">Votes Cast</p>
                <p className="text-2xl font-bold text-white">{voterElections.filter(e => e.hasVoted).length}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </div>
        </div>

        {/* Available Elections Card */}
        <div className="group relative backdrop-blur-sm bg-gradient-to-br from-teal-800/30 to-emerald-800/30 border border-teal-500/30 rounded-3xl p-6 shadow-xl shadow-teal-500/10 hover:shadow-teal-500/25 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-600/10 to-emerald-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/25">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-teal-300 font-medium mb-1">Available</p>
                <p className="text-2xl font-bold text-white">{availableElections.length}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Verification Status Alerts */}
      {profile?.verificationStatus === 'pending' && (
        <div className="backdrop-blur-sm bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">⏳</span>
            </div>
            <div>
              <h3 className="font-semibold text-amber-300 text-lg mb-2">Verification Pending</h3>
              <p className="text-amber-200/80 leading-relaxed">
                Your voter registration is under review by our administrators. You'll receive an email notification once your verification is complete. This process typically takes 24-48 hours.
              </p>
            </div>
          </div>
        </div>
      )}

      {profile?.verificationStatus === 'rejected' && (
        <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/30 rounded-3xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-400 rounded-2xl flex items-center justify-center">
              <span className="text-white text-xl">✗</span>
            </div>
            <div>
              <h3 className="font-semibold text-red-300 text-lg mb-2">Verification Rejected</h3>
              <p className="text-red-200/80 leading-relaxed">
                Unfortunately, your voter registration was not approved. Please contact our support team for more information about reapplying or resolving any issues with your application.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {profile?.verificationStatus === 'verified' && (
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Quick Actions
            </span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setCurrentView('vote')}
              className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-3xl p-6 text-left hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/25">
                  <span className="text-white text-xl">✅</span>
                </div>
                <div className="font-semibold text-white text-lg mb-2">Cast Your Vote</div>
                <div className="text-sm text-slate-400">
                  Participate in active elections and make your voice heard
                </div>
              </div>
            </button>
            
            <button
              onClick={() => setCurrentView('register')}
              className="group relative overflow-hidden backdrop-blur-sm bg-gradient-to-br from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-3xl p-6 text-left hover:scale-105 transition-all duration-300 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25">
                  <span className="text-white text-xl">📝</span>
                </div>
                <div className="font-semibold text-white text-lg mb-2">Register for Elections</div>
                <div className="text-sm text-slate-400">
                  Join upcoming elections and secure your participation
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
        <h3 className="text-2xl font-bold mb-6">
          <span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
            Recent Activity
          </span>
        </h3>
        {voterElections.length > 0 ? (
          <div className="space-y-4">
            {voterElections.filter(election => election?.electionId?._id).slice(0, 3).map((election, index) => (
              <div key={election.electionId._id} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-slate-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                        <span className="text-slate-300 text-lg">🗳️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:bg-clip-text transition-all duration-300">
                          {election.electionId.title || 'Untitled Election'}
                        </h4>
                        <p className="text-sm text-slate-400 capitalize mt-1">
                          {election.electionId.electionType || 'Unknown Type'} • {election.electionId.status?.replace('_', ' ') || 'Unknown Status'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      election.hasVoted 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {election.hasVoted ? '✓ Voted' : '📝 Registered'}
                    </div>
                    {election.votedAt && (
                      <div className="text-xs text-slate-500 mt-1">
                        {new Date(election.votedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <span className="text-slate-400 text-3xl">📋</span>
            </div>
            <h4 className="text-xl font-semibold text-slate-300 mb-2">No Activity Yet</h4>
            <p className="text-slate-400 max-w-md mx-auto">
              Your election participation history will appear here once you register for and vote in elections.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <span className="text-white text-2xl font-bold">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Voter Profile
              </span>
            </h3>
            <p className="text-slate-400">Complete voter information and verification status</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
              <span>Personal Information</span>
            </h4>
            <div className="space-y-4">
              <div className="group">
                <label className="text-sm font-medium text-cyan-400 mb-2 block">Full Name</label>
                <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white font-medium group-hover:border-cyan-500/50 transition-colors duration-300">
                  {profile?.name}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-sm font-medium text-cyan-400 mb-2 block">Age</label>
                  <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white font-medium group-hover:border-cyan-500/50 transition-colors duration-300">
                    {profile?.age}
                  </div>
                </div>
                
                <div className="group">
                  <label className="text-sm font-medium text-cyan-400 mb-2 block">Gender</label>
                  <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white font-medium capitalize group-hover:border-cyan-500/50 transition-colors duration-300">
                    {profile?.gender}
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-cyan-400 mb-2 block">Email Address</label>
                <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white font-medium group-hover:border-cyan-500/50 transition-colors duration-300">
                  {profile?.email}
                </div>
              </div>
            </div>
          </div>
          
          {/* System Information */}
          <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>System Information</span>
            </h4>
            <div className="space-y-4">
              <div className="group">
                <label className="text-sm font-medium text-emerald-400 mb-2 block">Voter ID</label>
                <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white font-mono text-sm group-hover:border-emerald-500/50 transition-colors duration-300">
                  {profile?.voterId}
                </div>
              </div>
              
              <div className="group">
                <label className="text-sm font-medium text-emerald-400 mb-2 block">Wallet Address</label>
                <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white font-mono text-xs break-all group-hover:border-emerald-500/50 transition-colors duration-300">
                  {profile?.walletAddress}
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-emerald-400 mb-2 block">Verification Status</label>
                <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 group-hover:border-emerald-500/50 transition-colors duration-300">
                  <span className={`inline-flex px-4 py-2 text-sm font-medium rounded-xl ${
                    profile?.verificationStatus === 'verified' 
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : profile?.verificationStatus === 'rejected'
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}>
                    {profile?.verificationStatus === 'verified' ? '✓ Verified' :
                     profile?.verificationStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
                  </span>
                </div>
              </div>

              <div className="group">
                <label className="text-sm font-medium text-emerald-400 mb-2 block">Member Since</label>
                <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-4 text-white font-medium group-hover:border-emerald-500/50 transition-colors duration-300">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderElections = () => (
    <div className="space-y-8">
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <span className="text-white text-2xl">🗳️</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  My Elections
                </span>
              </h3>
              <p className="text-slate-400">Elections you've registered for and participated in</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-cyan-400">{voterElections.length}</div>
            <div className="text-sm text-slate-400">Total Registered</div>
          </div>
        </div>
        
        {voterElections.length > 0 ? (
          <div className="space-y-6">
            {voterElections.filter(election => election?.electionId?._id).map((election, index) => (
              <div key={election.electionId._id} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-cyan-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center group-hover:from-cyan-600 group-hover:to-emerald-600 transition-all duration-300">
                        <span className="text-xl">
                          {election.electionId.electionType === 'presidential' ? '🏛️' :
                           election.electionId.electionType === 'parliamentary' ? '🏢' :
                           election.electionId.electionType === 'local' ? '🏘️' :
                           election.electionId.electionType === 'student' ? '🎓' : '🗳️'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.electionId.title || 'Untitled Election'}
                        </h4>
                        <div className="flex flex-wrap gap-3 mb-3">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-slate-800/50 text-slate-300 border border-slate-600/50">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            {(election.electionId.electionType || 'Unknown Type').replace('_', ' ')}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium ${
                            election.electionId.status === 'voting_active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            election.electionId.status === 'registration_open' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            election.electionId.status === 'results_announced' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                            'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                          }`}>
                            {(election.electionId.status?.replace('_', ' ') || 'Unknown Status')}
                          </span>
                        </div>
                        <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-xl p-3">
                          <div className="text-xs text-slate-400 font-mono">
                            Contract: {election.electionId.contractAddress?.slice(0, 20) || 'Unknown'}...
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right min-w-32">
                    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold mb-3 ${
                      election.hasVoted 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    }`}>
                      {election.hasVoted ? '✅ Voted' : '📝 Registered'}
                    </div>
                    {election.votedAt && (
                      <div className="text-xs text-slate-400 mb-3 backdrop-blur-sm bg-slate-800/50 border border-slate-600/50 rounded-lg p-2">
                        Voted: {new Date(election.votedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        if (election.electionId.contractAddress) {
                          navigate(`/elections/${election.electionId.contractAddress}`);
                        }
                      }}
                      className="group/btn relative w-full px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 rounded-xl hover:scale-105 transition-all duration-300 border border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/25 text-sm font-medium"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Details</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-slate-400 text-4xl">🗳️</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-300 mb-4">No Elections Yet</h4>
            <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
              You haven't registered for any elections yet. Start participating in the democratic process by registering for available elections.
            </p>
            <button
              onClick={() => setCurrentView('register')}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Register for Elections</span>
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderVoting = () => (
    <div className="space-y-8">
      {/* Active Elections for Voting */}
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-white text-2xl">✅</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                Cast Your Vote
              </span>
            </h3>
            <p className="text-slate-400">Participate in active elections and make your voice heard</p>
          </div>
        </div>
        
        {/* Active Elections for Voting */}
        <div className="space-y-6">
          {voterElections
            .filter(e => e.electionId && e.electionId.status && ['voting_active', 'registration_open'].includes(e.electionId.status) && !e.hasVoted)
            .map((election) => (
              <div key={election.electionId._id} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-emerald-400 to-green-400 rounded-full animate-pulse"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <span className="text-white text-xl">🗳️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.electionId.title || 'Untitled Election'}
                        </h4>
                        <p className="text-slate-400 capitalize font-medium mb-3">
                          {election.electionId.electionType || 'Unknown Type'} Election
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold ${
                      election.electionId.status === 'voting_active' 
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30 animate-pulse' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {election.electionId.status === 'voting_active' ? '🔴 Live Voting' : '📝 Registered'}
                    </span>
                  </div>
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
                  className={`group/btn relative w-full py-4 rounded-xl transition-all duration-300 font-bold text-lg ${
                    election.electionId.status === 'voting_active'
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:scale-105 shadow-lg hover:shadow-emerald-500/25'
                      : 'bg-slate-600/50 text-slate-400 cursor-not-allowed border border-slate-500/30'
                  }`}
                >
                  {election.electionId.status === 'voting_active' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  )}
                  <span className="relative flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                      {election.electionId.status === 'voting_active' 
                        ? 'Vote in this Election' 
                        : 'Voting Not Started'}
                    </span>
                  </span>
                </button>
              </div>
            ))}
        </div>

        {voterElections.filter(e => e.electionId && e.electionId.status && ['voting_active', 'registration_open'].includes(e.electionId.status) && !e.hasVoted).length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25">
              <span className="text-white text-4xl">✅</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-300 mb-4">No Active Voting</h4>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
              {voterElections.length === 0 
                ? "You haven't registered for any elections yet. Register for elections to participate in voting."
                : voterElections.every(e => e.hasVoted)
                ? "Congratulations! You have voted in all your registered elections. Thank you for participating in the democratic process!"
                : "No elections are currently accepting votes. Check back when voting periods open."
              }
            </p>
            {voterElections.length === 0 && (
              <button
                onClick={() => setCurrentView('register')}
                className="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 font-semibold"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Register for Elections</span>
                </span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Elections with Results Available */}
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
            <span className="text-white text-2xl">📊</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Election Results
              </span>
            </h3>
            <p className="text-slate-400">View results from completed elections</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {voterElections
            .filter(e => e.electionId && e.electionId.status === 'results_announced')
            .map((election) => (
              <div key={election.electionId._id} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 pr-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <span className="text-white text-xl">🏆</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.electionId.title || 'Untitled Election'}
                        </h4>
                        <p className="text-slate-400 capitalize font-medium mb-3">
                          {election.electionId.electionType || 'Unknown Type'} Election
                        </p>
                        <div className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium ${
                          election.hasVoted 
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {election.hasVoted ? '✅ You voted in this election' : '⚠️ You did not vote in this election'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-slate-500/20 text-slate-300 border border-slate-500/30">
                      🏁 Results Announced
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setSelectedResultsContractAddress(election.electionId.contractAddress);
                    setCurrentView('results');
                  }}
                  className="group/btn relative w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-bold text-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>View Results</span>
                  </span>
                </button>
              </div>
            ))}
        </div>

        {voterElections.filter(e => e.electionId && e.electionId.status === 'results_announced').length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
              <span className="text-white text-4xl">📊</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-300 mb-4">No Results Available</h4>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
              Results will appear here when elections you participated in have been completed and results announced. 
              Check back after election periods end to see the outcomes.
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
    <div className="space-y-8">
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
            <span className="text-white text-2xl">📝</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Register for Elections
              </span>
            </h3>
            <p className="text-slate-400">Join available elections and participate in democracy</p>
          </div>
        </div>
        
        {availableElections.length > 0 ? (
          <div className="space-y-6">
            {availableElections.map((election) => (
              <div key={election._id} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full animate-pulse"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                        <span className="text-white text-xl">🗳️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.title}
                        </h4>
                        <p className="text-slate-400 mb-3 leading-relaxed">
                          {election.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                            {election.electionType} Election
                          </span>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                              <span>Candidates: {election.candidates?.length || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                              <span>Max: {election.maxCandidates}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-80">
                    <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-2xl p-6">
                      <div className="text-center mb-6">
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse"></span>
                          Registration Open
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">
                            🔑 Private Key
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              placeholder="Enter your private key to register"
                              value={privateKey}
                              onChange={(e) => setPrivateKey(e.target.value)}
                              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => registerForElection(election.contractAddress)}
                          disabled={registering === election.contractAddress || !privateKey.trim()}
                          className={`group/btn relative w-full py-4 rounded-xl transition-all duration-300 font-bold text-lg ${
                            registering === election.contractAddress || !privateKey.trim()
                              ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed border border-slate-500/30'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:scale-105 shadow-lg hover:shadow-blue-500/25'
                          }`}
                        >
                          {!registering && privateKey.trim() && (
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          )}
                          <span className="relative flex items-center justify-center space-x-2">
                            {registering === election.contractAddress ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                <span>Registering...</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                <span>Register Now</span>
                              </>
                            )}
                          </span>
                        </button>
                        
                        {!privateKey.trim() && (
                          <p className="text-xs text-amber-400 text-center flex items-center justify-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>Private key required to register</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-4xl">📝</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-300 mb-4">No Available Elections</h4>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
              There are no elections open for registration at the moment. Check back later or contact your electoral administrator for more information about upcoming elections.
            </p>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="group relative px-8 py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-800 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Back to Dashboard</span>
              </span>
            </button>
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-600/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-400 text-lg">Loading voter dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-red-500/25">
            <span className="text-white text-3xl">⚠️</span>
          </div>
          <p className="text-red-400 text-xl mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-cyan-500/25"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-cyan-600/20 to-emerald-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-blue-500/15 to-cyan-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Navigation Header */}
      <div className="relative z-10 backdrop-blur-sm bg-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <span className="text-white text-xl">🗳️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Voter Dashboard
                  </span>
                </h1>
                <p className="text-slate-400">Welcome back, {profile.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                profile.verificationStatus === 'verified' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : profile.verificationStatus === 'rejected'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {profile.verificationStatus === 'verified' ? '✓ Verified' : 
                 profile.verificationStatus === 'rejected' ? '✗ Rejected' : '⏳ Pending'}
              </span>
            </div>
          </div>
          
          <nav className="flex space-x-2 pb-6 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'profile'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setCurrentView('elections')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'elections'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              🗳️ My Elections ({voterElections.length})
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              📊 Analytics
            </button>
            {profile.verificationStatus === 'verified' && (
              <>
                <button
                  onClick={() => setCurrentView('vote')}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                    currentView === 'vote'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 border border-slate-700/30'
                  }`}
                >
                  ✅ Vote
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                    currentView === 'register'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 border border-slate-700/30'
                  }`}
                >
                  📝 Register
                </button>
                <button
                  onClick={() => setCurrentView('results')}
                  className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                    currentView === 'results'
                      ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-slate-800/30 text-slate-400 hover:text-cyan-300 hover:bg-slate-700/50 border border-slate-700/30'
                  }`}
                >
                  📈 Results
                </button>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
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
