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
    <div className="space-y-8">
      {/* Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                profile?.verificationStatus === 'verified' 
                  ? 'bg-gradient-to-br from-emerald-500 to-green-500 shadow-emerald-500/25'
                  : profile?.verificationStatus === 'rejected'
                  ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-red-500/25'
                  : 'bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/25'
              }`}>
                <span className="text-white text-2xl">
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
        
        {/* Elections Participated Card */}
        <div className="group relative backdrop-blur-sm bg-gradient-to-br from-purple-800/30 to-indigo-800/30 border border-purple-500/30 rounded-3xl p-6 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/25 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white text-2xl">🏛️</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-purple-300 font-medium mb-1">Elections</p>
                <p className="text-2xl font-bold text-white">{profile?.elections?.length || 0}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Total Votes Received Card */}
        <div className="group relative backdrop-blur-sm bg-gradient-to-br from-pink-800/30 to-rose-800/30 border border-pink-500/30 rounded-3xl p-6 shadow-xl shadow-pink-500/10 hover:shadow-pink-500/25 hover:scale-105 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-rose-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                <span className="text-white text-2xl">🏆</span>
              </div>
              <div className="text-right">
                <p className="text-sm text-pink-300 font-medium mb-1">Total Votes</p>
                <p className="text-2xl font-bold text-white">{profile?.elections?.reduce((sum, e) => sum + e.votesReceived, 0) || 0}</p>
              </div>
            </div>
            <div className="h-1.5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
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
                Your candidate application is under administrative review. You'll receive an email notification once your verification is complete. This process typically takes 24-48 hours.
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
              <h3 className="font-semibold text-red-300 text-lg mb-2">Application Rejected</h3>
              <p className="text-red-200/80 leading-relaxed">
                Unfortunately, your candidate application was not approved. Please contact our support team for detailed feedback and information about reapplying or resolving any issues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Elections */}
      {profile?.elections && profile.elections.length > 0 && (
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
              Your Elections
            </span>
          </h3>
          <div className="space-y-4">
            {profile.elections.slice(0, 3).map((election, index) => (
              <div key={index} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-slate-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center">
                        <span className="text-slate-300 text-xl">🗳️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                          {election.electionId.title}
                        </h4>
                        <p className="text-sm text-slate-400 capitalize mt-1">
                          {election.electionId.electionType} • {election.electionId.status.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white mb-1">{election.votesReceived}</div>
                    <div className="text-sm text-slate-400">votes received</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Elections */}
      {profile?.verificationStatus === 'verified' && availableElections.length > 0 && (
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
          <h3 className="text-2xl font-bold mb-6">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              Available Elections
            </span>
          </h3>
          <div className="space-y-4">
            {availableElections.slice(0, 2).map((election) => (
              <div key={election._id} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-slate-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-3 right-3 w-3 h-3 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex justify-between items-start">
                  <div className="flex-1 mr-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <span className="text-white text-xl">📝</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.title}
                        </h4>
                        <p className="text-sm text-slate-400 line-clamp-2 mb-3">{election.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>📊 {election.candidates.length}/{election.maxCandidates} candidates</span>
                          <span>🗓️ {election.electionType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setRegisterForm({ ...registerForm, contractAddress: election.contractAddress });
                      setCurrentView('register');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-emerald-500/25 whitespace-nowrap"
                  >
                    Register Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {profile?.elections?.length === 0 && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <span className="text-slate-400 text-4xl">🏛️</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-300 mb-3">No Elections Yet</h3>
          <p className="text-slate-400 max-w-md mx-auto mb-6">
            You haven't participated in any elections yet. Register for upcoming elections to start your political campaign.
          </p>
          {profile?.verificationStatus === 'verified' && availableElections.length > 0 && (
            <button
              onClick={() => setCurrentView('register')}
              className="px-8 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-orange-500/25"
            >
              Register for Elections
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
            <span className="text-white text-2xl">👤</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Candidate Profile
              </span>
            </h3>
            <p className="text-slate-400">Your political identity and campaign information</p>
          </div>
        </div>
        
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white text-xl">📝</span>
                </div>
                <h4 className="text-xl font-bold text-white">Personal Information</h4>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
                  <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                    <p className="text-white font-semibold text-lg">{profile.name}</p>
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Political Party</label>
                  <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                    <p className="text-white font-semibold">{profile.party}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Age</label>
                    <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                      <p className="text-white font-semibold">{profile.age}</p>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-slate-400 mb-2">Gender</label>
                    <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                      <p className="text-white font-semibold capitalize">{profile.gender}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Contact & System Information */}
            <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="text-white text-xl">📧</span>
                </div>
                <h4 className="text-xl font-bold text-white">Contact & System</h4>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
                  <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                    <p className="text-white font-mono text-sm break-all">{profile.email}</p>
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Phone Number</label>
                  <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                    <p className="text-white font-mono">{profile.phone}</p>
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Candidate ID</label>
                  <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                    <p className="text-orange-400 font-mono text-sm">{profile.candidateId}</p>
                  </div>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-medium text-slate-400 mb-2">Wallet Address</label>
                  <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-4 group-hover:border-orange-500/50 transition-colors duration-300">
                    <p className="text-cyan-400 font-mono text-xs break-all">{profile.walletAddress}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Manifesto */}
            <div className="lg:col-span-2 backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="text-white text-xl">📜</span>
                </div>
                <h4 className="text-xl font-bold text-white">Political Manifesto</h4>
              </div>
              
              <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-xl p-6 hover:border-orange-500/50 transition-colors duration-300">
                <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{profile.manifesto}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderElections = () => (
    <div className="space-y-8">
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white text-2xl">🏛️</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  My Elections
                </span>
              </h3>
              <p className="text-slate-400">Track your campaign performance and election results</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{profile?.elections?.length || 0}</div>
            <div className="text-slate-400 text-sm">Total Elections</div>
          </div>
        </div>
        
        {profile?.elections && profile.elections.length > 0 ? (
          <div className="space-y-6">
            {profile.elections.map((election, index) => (
              <div key={index} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-purple-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                        <span className="text-white text-xl">🗳️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.electionId.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                            {election.electionId.electionType} Election
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-xl text-sm font-bold ${
                            election.electionId.status === 'results_announced' 
                              ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                              : election.electionId.status === 'voting_active'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {election.electionId.status === 'results_announced' ? '🏁 Results Announced' : 
                             election.electionId.status === 'voting_active' ? '🔴 Voting Active' : 
                             '📝 ' + election.electionId.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                            <span>Contract: {election.electionId.contractAddress.slice(0, 10)}...</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-64">
                    <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-2xl p-6 text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/25">
                        <span className="text-white text-2xl">🏆</span>
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent mb-2">
                        {election.votesReceived}
                      </div>
                      <div className="text-slate-400 font-medium">Votes Received</div>
                    </div>
                  </div>
                </div>
                
                {/* View Results Button for Announced Results */}
                {election.electionId.status === 'results_announced' && (
                  <div className="mt-6 pt-6 border-t border-slate-600/50">
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
                        <span>View Election Results</span>
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-4xl">🏛️</span>
            </div>
            <h4 className="text-2xl font-bold text-slate-300 mb-4">No Elections Yet</h4>
            <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
              You haven't participated in any elections yet. Start your political journey by registering for available elections and building your campaign presence.
            </p>
            {profile?.verificationStatus === 'verified' && availableElections.length > 0 && (
              <button
                onClick={() => setCurrentView('register')}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-semibold"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
    </div>
  );

  const renderRegister = () => (
    <div className="space-y-8">
      <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
        <div className="flex items-center space-x-4 mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <span className="text-white text-2xl">📝</span>
          </div>
          <div>
            <h3 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Register for Elections
              </span>
            </h3>
            <p className="text-slate-400">Join electoral campaigns and expand your political reach</p>
          </div>
        </div>
        
        {profile?.verificationStatus !== 'verified' ? (
          <div className="backdrop-blur-sm bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center">
                <span className="text-white text-xl">⚠️</span>
              </div>
              <div>
                <h4 className="font-semibold text-amber-300 text-lg mb-2">Verification Required</h4>
                <p className="text-amber-200/80 leading-relaxed">
                  You must be verified before registering for elections. Please wait for administrative approval or contact support for assistance with your verification status.
                </p>
              </div>
            </div>
          </div>
        ) : availableElections.length > 0 ? (
          <div className="space-y-6">
            {availableElections.map((election) => (
              <div key={election._id} className="group relative backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full animate-pulse"></div>
                
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <span className="text-white text-xl">🗳️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-teal-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.title}
                        </h4>
                        <p className="text-slate-400 mb-4 leading-relaxed line-clamp-2">
                          {election.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                            {election.electionType} Election
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></span>
                            {election.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-400">
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            <span>Candidates: {election.candidates.length}/{election.maxCandidates}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span>Type: {election.electionType}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-80">
                    {registerForm.contractAddress === election.contractAddress ? (
                      <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-2xl p-6">
                        <div className="text-center mb-6">
                          <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></span>
                            Complete Registration
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
                                value={registerForm.privateKey}
                                onChange={(e) => setRegisterForm({ ...registerForm, privateKey: e.target.value })}
                                placeholder="Enter your private key for blockchain registration"
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-300"
                              />
                              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              </div>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                              Your private key is used for blockchain registration and is not stored on our servers.
                            </p>
                          </div>
                          
                          <div className="flex gap-3">
                            <button
                              onClick={() => registerForElection(election.contractAddress)}
                              disabled={registering === election.contractAddress || !registerForm.privateKey}
                              className={`group/btn relative flex-1 py-3 rounded-xl transition-all duration-300 font-bold ${
                                registering === election.contractAddress || !registerForm.privateKey
                                  ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed border border-slate-500/30'
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105 shadow-lg hover:shadow-emerald-500/25'
                              }`}
                            >
                              {!registering && registerForm.privateKey && (
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                              )}
                              <span className="relative flex items-center justify-center space-x-2">
                                {registering === election.contractAddress ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    <span>Registering...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Confirm</span>
                                  </>
                                )}
                              </span>
                            </button>
                            <button
                              onClick={() => setRegisterForm({ contractAddress: '', privateKey: '' })}
                              className="px-4 py-3 bg-slate-600/50 border border-slate-500/50 text-slate-300 rounded-xl hover:bg-slate-600/70 transition-colors duration-300"
                            >
                              Cancel
                            </button>
                          </div>
                          
                          {!registerForm.privateKey && (
                            <p className="text-xs text-amber-400 text-center flex items-center justify-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              <span>Private key required for registration</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="backdrop-blur-sm bg-slate-600/30 border border-slate-500/50 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                          <span className="text-white text-2xl">🚀</span>
                        </div>
                        <button
                          onClick={() => setRegisterForm({ ...registerForm, contractAddress: election.contractAddress })}
                          disabled={election.candidates.length >= election.maxCandidates}
                          className={`group/btn relative w-full py-4 rounded-xl transition-all duration-300 font-bold text-lg ${
                            election.candidates.length >= election.maxCandidates
                              ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed border border-slate-500/30'
                              : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-105 shadow-lg hover:shadow-emerald-500/25'
                          }`}
                        >
                          {election.candidates.length < election.maxCandidates && (
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                          )}
                          <span className="relative flex items-center justify-center space-x-2">
                            {election.candidates.length >= election.maxCandidates ? (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                                </svg>
                                <span>Registration Full</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                <span>Register for Election</span>
                              </>
                            )}
                          </span>
                        </button>
                      </div>
                    )}
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
              There are no elections open for registration at the moment. Check back later for new opportunities to participate in the democratic process, or contact the electoral administration for upcoming election schedules.
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-pink-950 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-orange-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-400 text-lg">Loading candidate dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-pink-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-red-500/25">
            <span className="text-white text-3xl">⚠️</span>
          </div>
          <p className="text-red-400 text-xl mb-4">Failed to load profile</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-orange-600 to-pink-600 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-orange-500/25"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-orange-950 to-pink-950 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-orange-600/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-purple-500/15 to-orange-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      {/* Navigation Header */}
      <div className="relative z-10 backdrop-blur-sm bg-slate-900/50 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <span className="text-white text-xl">🏛️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                    Candidate Portal
                  </span>
                </h1>
                <p className="text-slate-400">{profile.name} • {profile.party}</p>
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
              <div className="text-sm text-slate-500 font-mono">
                {profile.candidateId}
              </div>
            </div>
          </div>
          
          <nav className="flex space-x-2 pb-6 overflow-x-auto">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-orange-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              🏠 Dashboard
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'profile'
                  ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-orange-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              👤 Profile
            </button>
            <button
              onClick={() => setCurrentView('elections')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'elections'
                  ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-orange-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              🗳️ My Elections ({profile.elections?.length || 0})
            </button>
            <button
              onClick={() => setCurrentView('analytics')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'analytics'
                  ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-orange-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setCurrentView('results')}
              className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                currentView === 'results'
                  ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/50'
                  : 'bg-slate-800/30 text-slate-400 hover:text-orange-300 hover:bg-slate-700/50 border border-slate-700/30'
              }`}
            >
              📈 Results
            </button>
            {profile.verificationStatus === 'verified' && (
              <button
                onClick={() => setCurrentView('register')}
                className={`px-6 py-3 rounded-2xl font-medium transition-all duration-300 whitespace-nowrap ${
                  currentView === 'register'
                    ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 text-orange-300 border border-orange-500/50'
                    : 'bg-slate-800/30 text-slate-400 hover:text-orange-300 hover:bg-slate-700/50 border border-slate-700/30'
                }`}
              >
                📝 Register
              </button>
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
