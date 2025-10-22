import { useEffect, useState } from 'react';
import { api, updateElectionStatus } from '../../lib/api';
import { CreateElectionForm } from './CreateElectionForm';

interface Election {
  _id: string;
  title: string;
  description: string;
  electionType: string;
  contractAddress: string;
  status: string;
  maxCandidates?: number;
  deployedBy: {
    name: string;
    email: string;
  };
  votingStartTime?: string;
  votingEndTime?: string;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  candidates: Array<{
    candidateId: {
      name: string;
      party: string;
    };
    votesReceived: number;
  }>;
  createdAt: string;
  winner?: {
    walletAddress: string;
    votesReceived: number;
  };
  turnoutPercentage?: number;
}

interface ElectionsResponse {
  elections: Election[];
  totalPages: number;
  currentPage: number;
  totalElections: number;
}

export const ElectionManagement = () => {
  const [elections, setElections] = useState<Election[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [electionType, setElectionType] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedElection, setSelectedElection] = useState<Election | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [emergencyStopForm, setEmergencyStopForm] = useState({ show: false, reason: '', privateKey: '' });
  const [announceResultsForm, setAnnounceResultsForm] = useState({ show: false, privateKey: '' });
  const [processing, setProcessing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [addVoterForm, setAddVoterForm] = useState({ walletAddress: '', privateKey: '', loading: false });
  const [addCandidateForm, setAddCandidateForm] = useState({ walletAddress: '', privateKey: '', loading: false });
  const [timingForm, setTimingForm] = useState({ startInMinutes: 10, durationMinutes: 60, privateKey: '', loading: false, title: '', description: '' });
  const [statusChangeForm, setStatusChangeForm] = useState({ show: false, newStatus: '', loading: false });

  const fetchElections = async () => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (electionType) params.append('electionType', electionType);
    if (search) params.append('search', search);
    params.append('page', page.toString());
    params.append('limit', '10');

    const { data } = await api.get(`/election?${params}`);
    return data;
  };

  const loadElections = async () => {
    setLoading(true);
    setError(null);
    console.log('Loading elections...');
    try {
      const response = await fetchElections();
      console.log('Elections response:', response);
      if (response.success) {
        setElections(response.data.elections || []);
        setTotalPages(response.data.totalPages || 1);
        console.log('Elections loaded:', response.data.elections?.length || 0, 'elections');
      } else {
        console.error('Failed to fetch elections:', response.message);
        setError(response.message || 'Failed to load elections');
      }
    } catch (error: any) {
      console.error('Error loading elections:', error);
      setError(error?.response?.data?.message || error.message || 'Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (contractAddress: string) => {
    setLoadingAnalytics(true);
    try {
      const { data } = await api.get(`/admin/elections/${contractAddress}/analytics`);
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleEmergencyStop = async () => {
    if (!selectedElection || !emergencyStopForm.privateKey) return;
    
    setProcessing(true);
    try {
      const { data } = await api.post(`/election/${selectedElection.contractAddress}/emergency-stop`, {
        adminPrivateKey: emergencyStopForm.privateKey,
        reason: emergencyStopForm.reason
      });
      
      if (data.success) {
        setEmergencyStopForm({ show: false, reason: '', privateKey: '' });
        await loadElections();
        alert('Emergency stop activated successfully');
      }
    } catch (error) {
      console.error('Failed to emergency stop:', error);
      alert('Failed to activate emergency stop');
    } finally {
      setProcessing(false);
    }
  };

  const handleAnnounceResults = async () => {
    if (!selectedElection || !announceResultsForm.privateKey) return;
    
    setProcessing(true);
    try {
      const { data } = await api.post(`/election/${selectedElection.contractAddress}/announce-results`, {
        adminPrivateKey: announceResultsForm.privateKey
      });
      
      if (data.success) {
        setAnnounceResultsForm({ show: false, privateKey: '' });
        await loadElections();
        alert('Results announced successfully');
      }
    } catch (error) {
      console.error('Failed to announce results:', error);
      alert('Failed to announce results');
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedElection || !statusChangeForm.newStatus) return;
    
    alert(`Attempting to change status of election ${selectedElection.contractAddress} from ${selectedElection.status} to ${statusChangeForm.newStatus}`);
    
    setStatusChangeForm(prev => ({ ...prev, loading: true }));
    try {
      const response = await updateElectionStatus({
        contractAddress: selectedElection.contractAddress,
        status: statusChangeForm.newStatus
      });
      
      console.log('Status update response:', response);
      
      if (response.success) {
        setStatusChangeForm({ show: false, newStatus: '', loading: false });
        await loadElections();
        alert(`Election status successfully changed to ${statusChangeForm.newStatus}!`);
      } else {
        alert(`Failed: ${response.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(`Error: ${error?.response?.data?.message || error.message || 'Failed to update election status'}`);
    } finally {
      setStatusChangeForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleOpenRegistration = async () => {
    if (!selectedElection || !timingForm.privateKey) return;
    setTimingForm(prev => ({ ...prev, loading: true }));
    try {
      const payload: any = {
        startTimeFromNow: Math.max(60, Math.floor((timingForm.startInMinutes || 0) * 60)),
        durationInSeconds: Math.max(60, Math.floor((timingForm.durationMinutes || 0) * 60)),
        adminPrivateKey: timingForm.privateKey.trim()
      };
      if (timingForm.title.trim()) payload.title = timingForm.title.trim();
      if (timingForm.description.trim()) payload.description = timingForm.description.trim();

      const { data } = await api.put(`/election/${selectedElection.contractAddress}/timing`, payload);
      if (data.success) {
        alert('Registration opened and timing set successfully');
        setTimingForm({ startInMinutes: 10, durationMinutes: 60, privateKey: '', loading: false, title: '', description: '' });
        await loadElections();
        if (selectedElection) await loadAnalytics(selectedElection.contractAddress);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to open registration');
      setTimingForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAddVoterToElection = async () => {
    if (!selectedElection || !addVoterForm.walletAddress || !addVoterForm.privateKey) return;
    setAddVoterForm(prev => ({ ...prev, loading: true }));
    try {
      const { data } = await api.post('/voter/register-election', {
        contractAddress: selectedElection.contractAddress,
        walletAddress: addVoterForm.walletAddress.trim(),
        privateKey: addVoterForm.privateKey.trim()
      });
      if (data.success) {
        alert('Voter added to election successfully');
        setAddVoterForm({ walletAddress: '', privateKey: '', loading: false });
        await loadElections();
        if (selectedElection) await loadAnalytics(selectedElection.contractAddress);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to add voter to election');
      setAddVoterForm(prev => ({ ...prev, loading: false }));
    }
  };

  const handleAddCandidateToElection = async () => {
    if (!selectedElection || !addCandidateForm.walletAddress || !addCandidateForm.privateKey) return;
    setAddCandidateForm(prev => ({ ...prev, loading: true }));
    try {
      const { data } = await api.post('/candidate/register-election', {
        contractAddress: selectedElection.contractAddress,
        walletAddress: addCandidateForm.walletAddress.trim(),
        privateKey: addCandidateForm.privateKey.trim()
      });
      if (data.success) {
        alert('Candidate added to election successfully');
        setAddCandidateForm({ walletAddress: '', privateKey: '', loading: false });
        await loadElections();
        if (selectedElection) await loadAnalytics(selectedElection.contractAddress);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to add candidate to election');
      setAddCandidateForm(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    loadElections();
  }, [page, status, electionType, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadElections();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'registration_open': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'voting_active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'results_announced': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-10 px-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Election Management
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Create, monitor and manage elections</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Create New Election</span>
            </span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6">
          <div className="flex gap-4 items-end flex-wrap">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1 min-w-96">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title or description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </span>
              </button>
            </form>

            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 cursor-pointer"
                >
                  <option value="" className="bg-slate-800">All Status</option>
                  <option value="created" className="bg-slate-800">Created</option>
                  <option value="registration_open" className="bg-slate-800">Registration Open</option>
                  <option value="voting_active" className="bg-slate-800">Voting Active</option>
                  <option value="results_announced" className="bg-slate-800">Results Announced</option>
                  <option value="cancelled" className="bg-slate-800">Cancelled</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="relative">
                <select
                  value={electionType}
                  onChange={(e) => setElectionType(e.target.value)}
                  className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 cursor-pointer"
                >
                  <option value="" className="bg-slate-800">All Types</option>
                  <option value="presidential" className="bg-slate-800">Presidential</option>
                  <option value="parliamentary" className="bg-slate-800">Parliamentary</option>
                  <option value="local" className="bg-slate-800">Local</option>
                  <option value="referendum" className="bg-slate-800">Referendum</option>
                  <option value="student" className="bg-slate-800">Student</option>
                  <option value="corporate" className="bg-slate-800">Corporate</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elections Table */}
        {loading ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
            <div className="text-center">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-padding"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-border opacity-20"></div>
              </div>
              <p className="text-slate-300 font-medium animate-pulse">Loading elections...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-red-500/20 shadow-2xl p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-red-400 mb-6 font-medium">❌ {error}</div>
              <button 
                onClick={loadElections}
                className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">Try Again</span>
              </button>
            </div>
          </div>
        ) : elections.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-slate-800/50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-slate-400 mb-6 font-medium">No elections found</div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative">Create First Election</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-white/10">
                    <th className="text-left p-6 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Title</span>
                      </div>
                    </th>
                    <th className="text-left p-6 font-semibold text-white">Type</th>
                    <th className="text-left p-6 font-semibold text-white">Status</th>
                    <th className="text-left p-6 font-semibold text-white">Candidates</th>
                    <th className="text-left p-6 font-semibold text-white">Voters</th>
                    <th className="text-left p-6 font-semibold text-white">Turnout</th>
                    <th className="text-left p-6 font-semibold text-white">Created By</th>
                    <th className="text-left p-6 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {elections.map((election) => (
                    <tr key={election._id} className="group hover:bg-white/5 transition-all duration-300">
                      <td className="p-6">
                        <div>
                          <div className="font-medium text-white mb-1">{election.title}</div>
                          <div className="text-xs text-slate-400 font-mono bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10 inline-block">
                            {election.contractAddress.slice(0, 10)}...
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="capitalize text-slate-300 font-medium">{election.electionType}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          election.status === 'created' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                          election.status === 'registration_open' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                          election.status === 'voting_active' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          election.status === 'results_announced' ? 'bg-slate-500/20 text-slate-300 border border-slate-400/30' :
                          election.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        }`}>
                          {election.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-slate-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                            <span className="text-purple-400 text-xs font-bold">{election.candidates?.length || 0}</span>
                          </div>
                          <span className="text-slate-400 text-sm">registered</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="text-slate-300 font-medium">
                          <span className="text-purple-400">{election.totalVotesCast}</span>
                          <span className="text-slate-500 mx-1">/</span>
                          <span>{election.totalRegisteredVoters}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-slate-300 font-medium">
                          {election.turnoutPercentage ? `${election.turnoutPercentage.toFixed(1)}%` : 'N/A'}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {election.deployedBy?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <span className="text-slate-300 text-sm">{election.deployedBy?.name}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => {
                              setSelectedElection(election);
                              loadAnalytics(election.contractAddress);
                            }}
                            className="group relative px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-xs font-medium"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative">View</span>
                          </button>
                          {(election.status === 'voting_active' || election.status === 'registration_open') && (
                            <button
                              onClick={() => {
                                setSelectedElection(election);
                                setEmergencyStopForm({ show: true, reason: '', privateKey: '' });
                              }}
                              className="group relative px-3 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-xs font-medium"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <span className="relative">Stop</span>
                            </button>
                          )}
                          {election.status === 'voting_active' && (
                            <button
                              onClick={() => {
                                setSelectedElection(election);
                                setStatusChangeForm({ show: true, newStatus: 'voting_ended', loading: false });
                              }}
                              className="group relative px-3 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange-500/25 text-xs font-medium"
                              title="End voting period"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <span className="relative">End Voting</span>
                            </button>
                          )}
                          {election.status === 'voting_ended' && (
                            <button
                              onClick={() => {
                                setSelectedElection(election);
                                setAnnounceResultsForm({ show: true, privateKey: '' });
                              }}
                              className="group relative px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25 text-xs font-medium"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <span className="relative">Results</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedElection(election);
                              setStatusChangeForm({ show: true, newStatus: '', loading: false });
                            }}
                            className="group relative px-3 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 text-xs font-medium"
                            title="Change Election Status"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative">Status</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-white/10 flex justify-center items-center gap-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="group px-4 py-2 bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-white/10 rounded-xl hover:bg-slate-700/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </span>
                </button>
                
                <div className="bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                  <span className="text-slate-300 font-medium">
                    Page {page} of {totalPages}
                  </span>
                </div>
                
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="group px-4 py-2 bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-white/10 rounded-xl hover:bg-slate-700/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
                >
                  <span className="flex items-center space-x-2">
                    <span>Next</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Election Details Modal */}
        {selectedElection && !emergencyStopForm.show && !announceResultsForm.show && !statusChangeForm.show && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                      Election Analytics
                    </h2>
                    <p className="text-slate-400 mt-1">Comprehensive election management dashboard</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedElection(null);
                      setAnalytics(null);
                    }}
                    className="group p-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {loadingAnalytics ? (
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
                    <div className="text-center">
                      <div className="relative mx-auto w-12 h-12 mb-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-padding"></div>
                        <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-border opacity-20"></div>
                      </div>
                      <p className="text-slate-300 font-medium animate-pulse">Loading analytics...</p>
                    </div>
                  </div>
                ) : analytics ? (
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Election Overview</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                          <label className="text-sm font-medium text-purple-400 mb-1 block">Title</label>
                          <p className="text-white font-medium">{analytics.election.title}</p>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                          <label className="text-sm font-medium text-purple-400 mb-1 block">Status</label>
                          <p className="text-white font-medium capitalize">{analytics.election.status.replace('_', ' ')}</p>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                          <label className="text-sm font-medium text-purple-400 mb-1 block">Total Registered</label>
                          <p className="text-white font-medium text-2xl">{analytics.election.totalRegistered}</p>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                          <label className="text-sm font-medium text-purple-400 mb-1 block">Total Voted</label>
                          <p className="text-white font-medium text-2xl">{analytics.election.totalVoted}</p>
                        </div>
                      </div>
                    </div>

                    {/* Vote Distribution */}
                    {analytics.voteDistribution && analytics.voteDistribution.length > 0 && (
                      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                          </svg>
                          <span>Vote Distribution</span>
                        </h3>
                        <div className="space-y-4">
                          {analytics.voteDistribution.map((candidate: any, index: number) => (
                            <div key={index} className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                              <div className="flex justify-between items-center mb-3">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">
                                      {candidate.name.charAt(0)}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="font-medium text-white">{candidate.name}</span>
                                    <span className="text-slate-400 ml-2">({candidate.party})</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-purple-400">{candidate.votes}</div>
                                  <div className="text-sm text-slate-400">{candidate.percentage.toFixed(1)}%</div>
                                </div>
                              </div>
                              <div className="bg-slate-700/50 rounded-full h-3 overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: `${candidate.percentage}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    {analytics.timeline && (
                      <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                          <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          <span>Timeline</span>
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                            <span className="text-slate-300 font-medium">Created:</span>
                            <span className="text-white">{new Date(analytics.timeline.created).toLocaleString()}</span>
                          </div>
                          {analytics.timeline.votingStart && (
                            <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                              <span className="text-slate-300 font-medium">Voting Start:</span>
                              <span className="text-white">{new Date(analytics.timeline.votingStart).toLocaleString()}</span>
                            </div>
                          )}
                          {analytics.timeline.votingEnd && (
                            <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                              <span className="text-slate-300 font-medium">Voting End:</span>
                              <span className="text-white">{new Date(analytics.timeline.votingEnd).toLocaleString()}</span>
                            </div>
                          )}
                          {analytics.timeline.resultsAnnounced && (
                            <div className="flex justify-between items-center bg-slate-900/50 backdrop-blur-sm p-3 rounded-xl border border-white/10">
                              <span className="text-slate-300 font-medium">Results Announced:</span>
                              <span className="text-white">{new Date(analytics.timeline.resultsAnnounced).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-12 border border-white/10">
                    <div className="text-center text-slate-400 font-medium">No analytics available</div>
                  </div>
                )}
              {/* Admin Actions: Add Eligible Voter / Candidate (Always visible) */}
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                    </svg>
                    <span>Add Eligible Voter</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">Voter Wallet Address</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                        placeholder="0x..."
                        value={addVoterForm.walletAddress}
                        onChange={(e) => setAddVoterForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">Admin/Authorized Private Key</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-300"
                        placeholder="Enter private key"
                        value={addVoterForm.privateKey}
                        onChange={(e) => setAddVoterForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={handleAddVoterToElection}
                      disabled={addVoterForm.loading || !addVoterForm.walletAddress || !addVoterForm.privateKey}
                      className="group relative w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        {addVoterForm.loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Voter to Election</span>
                          </>
                        )}
                      </span>
                    </button>
                    <p className="text-xs text-slate-400 bg-slate-900/30 rounded-lg p-2 border border-white/5">
                      Voter must be registered and verified first.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Add Candidate</span>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-400 mb-2">Candidate Wallet Address</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
                        placeholder="0x..."
                        value={addCandidateForm.walletAddress}
                        onChange={(e) => setAddCandidateForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-purple-400 mb-2">Admin/Authorized Private Key</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300"
                        placeholder="Enter private key"
                        value={addCandidateForm.privateKey}
                        onChange={(e) => setAddCandidateForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={handleAddCandidateToElection}
                      disabled={addCandidateForm.loading || !addCandidateForm.walletAddress || !addCandidateForm.privateKey}
                      className="group relative w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        {addCandidateForm.loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Adding...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Candidate to Election</span>
                          </>
                        )}
                      </span>
                    </button>
                    <p className="text-xs text-slate-400 bg-slate-900/30 rounded-lg p-2 border border-white/5">
                      Candidate must be registered and verified first. Max {selectedElection?.candidates ? selectedElection?.candidates.length : 0}/{selectedElection?.maxCandidates ?? 'N/A'} allowed.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Controls: Open Registration / Set Timing */}
              <div className="mt-6 bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                  <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span>Open Registration / Set Timing</span>
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-indigo-400 mb-2">Title (optional)</label>
                      <input
                        className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300"
                        placeholder="Update election title"
                        value={timingForm.title}
                        onChange={(e) => setTimingForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-400 mb-2">Description (optional)</label>
                      <textarea
                        className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300 resize-none"
                        rows={2}
                        placeholder="Update election description"
                        value={timingForm.description}
                        onChange={(e) => setTimingForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-indigo-400 mb-2">Start In (minutes)</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300"
                          value={timingForm.startInMinutes}
                          onChange={(e) => setTimingForm(prev => ({ ...prev, startInMinutes: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-indigo-400 mb-2">Duration (minutes)</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300"
                          value={timingForm.durationMinutes}
                          onChange={(e) => setTimingForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-indigo-400 mb-2">Admin Private Key</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-slate-900/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400/50 transition-all duration-300"
                        placeholder="Enter your private key"
                        value={timingForm.privateKey}
                        onChange={(e) => setTimingForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={handleOpenRegistration}
                      disabled={timingForm.loading || !timingForm.privateKey}
                      className="group relative w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        {timingForm.loading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                            <span>Open Registration & Set Timing</span>
                          </>
                        )}
                      </span>
                    </button>
                    <p className="text-xs text-slate-400 bg-slate-900/30 rounded-lg p-2 border border-white/5">
                      This sets start/end on-chain and updates status to registration_open.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Stop Modal */}
      {emergencyStopForm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
                    Emergency Stop Election
                  </h2>
                  <p className="text-slate-400 mt-1">Immediately halt election process</p>
                </div>
                <button
                  onClick={() => setEmergencyStopForm({ show: false, reason: '', privateKey: '' })}
                  className="group p-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-red-400 mb-3">Reason for Emergency Stop</label>
                  <textarea
                    value={emergencyStopForm.reason}
                    onChange={(e) => setEmergencyStopForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/50 transition-all duration-300 resize-none"
                    rows={3}
                    placeholder="Describe the reason for emergency stop..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-red-400 mb-3">Admin Private Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2V9a2 2 0 00-2-2m2 2a2 2 0 002 2m-2-2a2 2 0 01-2 2" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={emergencyStopForm.privateKey}
                      onChange={(e) => setEmergencyStopForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-400/50 transition-all duration-300"
                      placeholder="Enter your private key..."
                    />
                  </div>
                </div>

                <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-4 border border-red-400/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-red-300 text-sm font-medium mb-1">Critical Action</p>
                      <p className="text-red-200/80 text-xs leading-relaxed">
                        This action will immediately stop the election and cannot be undone. 
                        All voting will cease and the election will be marked as cancelled.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleEmergencyStop}
                    disabled={processing || !emergencyStopForm.privateKey}
                    className="group relative flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center space-x-2">
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Stopping...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10h6v4H9z" />
                          </svg>
                          <span>Emergency Stop</span>
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setEmergencyStopForm({ show: false, reason: '', privateKey: '' })}
                    className="group relative px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:text-white hover:scale-105 transition-all duration-300 font-medium"
                  >
                    <span className="relative flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announce Results Modal */}
      {announceResultsForm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                    Announce Election Results
                  </h2>
                  <p className="text-slate-400 mt-1">Finalize and publish voting outcomes</p>
                </div>
                <button
                  onClick={() => setAnnounceResultsForm({ show: false, privateKey: '' })}
                  className="group p-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-green-400 mb-3">Admin Private Key</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m0 0a2 2 0 01-2 2m2-2V9a2 2 0 00-2-2m2 2a2 2 0 002 2m-2-2a2 2 0 01-2 2" />
                      </svg>
                    </div>
                    <input
                      type="password"
                      value={announceResultsForm.privateKey}
                      onChange={(e) => setAnnounceResultsForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      className="w-full pl-12 pr-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-400/50 transition-all duration-300"
                      placeholder="Enter your private key..."
                    />
                  </div>
                </div>

                <div className="bg-green-500/10 backdrop-blur-sm rounded-2xl p-4 border border-green-400/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-300 text-sm font-medium mb-1">Final Action</p>
                      <p className="text-green-200/80 text-xs leading-relaxed">
                        This will permanently finalize the election results and make them publicly visible. 
                        Ensure voting has ended before proceeding.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleAnnounceResults}
                    disabled={processing || !announceResultsForm.privateKey}
                    className="group relative flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center space-x-2">
                      {processing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Announcing...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span>Announce Results</span>
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setAnnounceResultsForm({ show: false, privateKey: '' })}
                    className="group relative px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:text-white hover:scale-105 transition-all duration-300 font-medium"
                  >
                    <span className="relative flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusChangeForm.show && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-md w-full shadow-2xl">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                    Change Election Status
                  </h2>
                  <p className="text-slate-400 mt-1">Modify election workflow state</p>
                </div>
                <button
                  onClick={() => setStatusChangeForm({ show: false, newStatus: '', loading: false })}
                  className="group p-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full animate-pulse"></div>
                  <div>
                    <span className="text-slate-300 text-sm">Current Status:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-medium ${
                      selectedElection?.status === 'created' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                      selectedElection?.status === 'registration_open' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                      selectedElection?.status === 'voting_active' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                      selectedElection?.status === 'results_announced' ? 'bg-slate-500/20 text-slate-300 border border-slate-400/30' :
                      selectedElection?.status === 'cancelled' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                      'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                    }`}>
                      {selectedElection?.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-purple-400 mb-3">New Status</label>
                  <div className="relative">
                    <select
                      value={statusChangeForm.newStatus}
                      onChange={(e) => setStatusChangeForm(prev => ({ ...prev, newStatus: e.target.value }))}
                      className="appearance-none w-full px-4 py-3 pr-10 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 cursor-pointer"
                    >
                      <option value="" className="bg-slate-800">Select new status...</option>
                      <option value="created" className="bg-slate-800">Created</option>
                      <option value="registration_open" className="bg-slate-800">Registration Open</option>
                      <option value="registration_closed" className="bg-slate-800">Registration Closed</option>
                      <option value="voting_active" className="bg-slate-800">Voting Active</option>
                      <option value="voting_ended" className="bg-slate-800">Voting Ended</option>
                      <option value="results_announced" className="bg-slate-800">Results Announced</option>
                      <option value="cancelled" className="bg-slate-800">Cancelled</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-500/10 backdrop-blur-sm rounded-2xl p-4 border border-amber-400/30">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-amber-300 text-sm font-medium mb-1">Security Warning</p>
                      <p className="text-amber-200/80 text-xs leading-relaxed">
                        Changing election status directly bypasses blockchain validation. 
                        Use with caution and ensure the new status reflects the actual election state.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStatusChange}
                    disabled={statusChangeForm.loading || !statusChangeForm.newStatus}
                    className="group relative flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative flex items-center justify-center space-x-2">
                      {statusChangeForm.loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Updating...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span>Update Status</span>
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={() => setStatusChangeForm({ show: false, newStatus: '', loading: false })}
                    className="group relative px-6 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 text-slate-300 rounded-xl hover:bg-slate-700/50 hover:text-white hover:scale-105 transition-all duration-300 font-medium"
                  >
                    <span className="relative flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span>Cancel</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Election Form */}
      {showCreateForm && (
        <CreateElectionForm
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            loadElections();
          }}
        />
      )}
      </div>
    </div>
  );
};
