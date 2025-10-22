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
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Election Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Election
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by title or description"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
        >
          <option value="">All Status</option>
          <option value="created">Created</option>
          <option value="registration_open">Registration Open</option>
          <option value="voting_active">Voting Active</option>
          <option value="results_announced">Results Announced</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={electionType}
          onChange={(e) => setElectionType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
        >
          <option value="">All Types</option>
          <option value="presidential">Presidential</option>
          <option value="parliamentary">Parliamentary</option>
          <option value="local">Local</option>
          <option value="referendum">Referendum</option>
          <option value="student">Student</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>

      {/* Elections Table */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <div className="text-gray-600">Loading elections...</div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">❌ {error}</div>
          <button 
            onClick={loadElections}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      ) : elections.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">No elections found</div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Election
          </button>
        </div>
      ) : (
        <div className="bg-green-500 border border-gray-300 rounded-lg overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-500">
                <tr>
                  <th className="text-left p-4 font-medium">Title</th>
                  <th className="text-left p-4 font-medium">Type</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Candidates</th>
                  <th className="text-left p-4 font-medium">Voters</th>
                  <th className="text-left p-4 font-medium">Turnout</th>
                  <th className="text-left p-4 font-medium">Created By</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.map((election) => (
                  <tr key={election._id} className="border-t border-gray-200 hover:bg-gray-50">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{election.title}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {election.contractAddress.slice(0, 10)}...
                        </div>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{election.electionType}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(election.status)}`}>
                        {election.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">{election.candidates?.length || 0}</td>
                    <td className="p-4">
                      {election.totalVotesCast}/{election.totalRegisteredVoters}
                    </td>
                    <td className="p-4">
                      {election.turnoutPercentage ? `${election.turnoutPercentage.toFixed(1)}%` : 'N/A'}
                    </td>
                    <td className="p-4 text-sm">{election.deployedBy?.name}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedElection(election);
                            loadAnalytics(election.contractAddress);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          View
                        </button>
                        {(election.status === 'voting_active' || election.status === 'registration_open') && (
                          <button
                            onClick={() => {
                              setSelectedElection(election);
                              setEmergencyStopForm({ show: true, reason: '', privateKey: '' });
                            }}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                          >
                            Stop
                          </button>
                        )}
                        {election.status === 'voting_active' && (
                          <button
                            onClick={() => {
                              setSelectedElection(election);
                              setStatusChangeForm({ show: true, newStatus: 'voting_ended', loading: false });
                            }}
                            className="px-3 py-1 bg-orange-600 text-white rounded text-xs hover:bg-orange-700"
                            title="End voting period"
                          >
                            End Voting
                          </button>
                        )}
                        {election.status === 'voting_ended' && (
                          <button
                            onClick={() => {
                              setSelectedElection(election);
                              setAnnounceResultsForm({ show: true, privateKey: '' });
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Results
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedElection(election);
                            setStatusChangeForm({ show: true, newStatus: '', loading: false });
                          }}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700"
                          title="Change Election Status"
                        >
                          Status
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
            <div className="p-4 border-t border-gray-200 flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Election Details Modal */}
      {selectedElection && !emergencyStopForm.show && !announceResultsForm.show && !statusChangeForm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-green-500 border border-gray-300 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Election Analytics</h2>
                <button
                  onClick={() => {
                    setSelectedElection(null);
                    setAnalytics(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {loadingAnalytics ? (
                <div className="text-center py-8 text-slate-400">Loading analytics...</div>
              ) : analytics ? (
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Title</label>
                      <p>{analytics.election.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Status</label>
                      <p className="capitalize">{analytics.election.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Registered</label>
                      <p>{analytics.election.totalRegistered}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Voted</label>
                      <p>{analytics.election.totalVoted}</p>
                    </div>
                  </div>

                  {/* Vote Distribution */}
                  {analytics.voteDistribution && analytics.voteDistribution.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Vote Distribution</h3>
                      <div className="space-y-2">
                        {analytics.voteDistribution.map((candidate: any, index: number) => (
                          <div key={index} className="bg-gray-100 p-3 rounded">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{candidate.name}</span>
                                <span className="text-gray-600 ml-2">({candidate.party})</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{candidate.votes} votes</div>
                                <div className="text-sm text-gray-600">{candidate.percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                            <div className="mt-2 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all"
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
                    <div>
                      <h3 className="font-medium mb-3">Timeline</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{new Date(analytics.timeline.created).toLocaleString()}</span>
                        </div>
                        {analytics.timeline.votingStart && (
                          <div className="flex justify-between">
                            <span>Voting Start:</span>
                            <span>{new Date(analytics.timeline.votingStart).toLocaleString()}</span>
                          </div>
                        )}
                        {analytics.timeline.votingEnd && (
                          <div className="flex justify-between">
                            <span>Voting End:</span>
                            <span>{new Date(analytics.timeline.votingEnd).toLocaleString()}</span>
                          </div>
                        )}
                        {analytics.timeline.resultsAnnounced && (
                          <div className="flex justify-between">
                            <span>Results Announced:</span>
                            <span>{new Date(analytics.timeline.resultsAnnounced).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">No analytics available</div>
              )}
              {/* Admin Actions: Add Eligible Voter / Candidate (Always visible) */}
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="p-4 border border-gray-300 rounded-lg">
                  <h3 className="font-medium mb-3">Add Eligible Voter</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Voter Wallet Address</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        placeholder="0x..."
                        value={addVoterForm.walletAddress}
                        onChange={(e) => setAddVoterForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Admin/Authorized Private Key</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        placeholder="Enter private key"
                        value={addVoterForm.privateKey}
                        onChange={(e) => setAddVoterForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={handleAddVoterToElection}
                      disabled={addVoterForm.loading || !addVoterForm.walletAddress || !addVoterForm.privateKey}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                    >
                      {addVoterForm.loading ? 'Adding...' : 'Add Voter to Election'}
                    </button>
                    <p className="text-[10px] text-gray-600">Voter must be registered and verified first.</p>
                  </div>
                </div>

                <div className="p-4 border border-gray-300 rounded-lg">
                  <h3 className="font-medium mb-3">Add Candidate</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Candidate Wallet Address</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        placeholder="0x..."
                        value={addCandidateForm.walletAddress}
                        onChange={(e) => setAddCandidateForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Admin/Authorized Private Key</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        placeholder="Enter private key"
                        value={addCandidateForm.privateKey}
                        onChange={(e) => setAddCandidateForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={handleAddCandidateToElection}
                      disabled={addCandidateForm.loading || !addCandidateForm.walletAddress || !addCandidateForm.privateKey}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm"
                    >
                      {addCandidateForm.loading ? 'Adding...' : 'Add Candidate to Election'}
                    </button>
                    <p className="text-[10px] text-gray-600">Candidate must be registered and verified first. Max {selectedElection?.candidates ? selectedElection?.candidates.length : 0}/{selectedElection?.maxCandidates ?? 'N/A'} allowed.</p>
                  </div>
                </div>
              </div>

              {/* Status Controls: Open Registration / Set Timing */}
              <div className="mt-6 p-4 border border-gray-300 rounded-lg">
                <h3 className="font-medium mb-3">Open Registration / Set Timing</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Title (optional)</label>
                      <input
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        placeholder="Update election title"
                        value={timingForm.title}
                        onChange={(e) => setTimingForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Description (optional)</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        rows={2}
                        placeholder="Update election description"
                        value={timingForm.description}
                        onChange={(e) => setTimingForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs mb-1">Start In (minutes)</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                          value={timingForm.startInMinutes}
                          onChange={(e) => setTimingForm(prev => ({ ...prev, startInMinutes: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                          value={timingForm.durationMinutes}
                          onChange={(e) => setTimingForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Admin Private Key</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm"
                        placeholder="Enter your private key"
                        value={timingForm.privateKey}
                        onChange={(e) => setTimingForm(prev => ({ ...prev, privateKey: e.target.value }))}
                      />
                    </div>
                    <button
                      onClick={handleOpenRegistration}
                      disabled={timingForm.loading || !timingForm.privateKey}
                      className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm"
                    >
                      {timingForm.loading ? 'Updating...' : 'Open Registration & Set Timing'}
                    </button>
                    <p className="text-[10px] text-gray-600">This sets start/end on-chain and updates status to registration_open.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Stop Modal */}
      {emergencyStopForm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Emergency Stop Election</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <textarea
                    value={emergencyStopForm.reason}
                    onChange={(e) => setEmergencyStopForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    rows={3}
                    placeholder="Reason for emergency stop..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Private Key</label>
                  <input
                    type="password"
                    value={emergencyStopForm.privateKey}
                    onChange={(e) => setEmergencyStopForm(prev => ({ ...prev, privateKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="Enter your private key..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleEmergencyStop}
                    disabled={processing || !emergencyStopForm.privateKey}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Emergency Stop'}
                  </button>
                  <button
                    onClick={() => setEmergencyStopForm({ show: false, reason: '', privateKey: '' })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Announce Results Modal */}
      {announceResultsForm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Announce Results</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Private Key</label>
                  <input
                    type="password"
                    value={announceResultsForm.privateKey}
                    onChange={(e) => setAnnounceResultsForm(prev => ({ ...prev, privateKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                    placeholder="Enter your private key..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAnnounceResults}
                    disabled={processing || !announceResultsForm.privateKey}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Announce Results'}
                  </button>
                  <button
                    onClick={() => setAnnounceResultsForm({ show: false, privateKey: '' })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusChangeForm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Change Election Status</h2>
              <p className="text-sm text-gray-600 mb-4">
                Current Status: <span className="font-medium capitalize">{selectedElection?.status.replace('_', ' ')}</span>
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">New Status</label>
                  <select
                    value={statusChangeForm.newStatus}
                    onChange={(e) => setStatusChangeForm(prev => ({ ...prev, newStatus: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="">Select new status...</option>
                    <option value="created">Created</option>
                    <option value="registration_open">Registration Open</option>
                    <option value="registration_closed">Registration Closed</option>
                    <option value="voting_active">Voting Active</option>
                    <option value="voting_ended">Voting Ended</option>
                    <option value="results_announced">Results Announced</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800">
                    <strong>Warning:</strong> Changing election status directly bypasses blockchain validation. 
                    Use with caution and ensure the new status reflects the actual election state.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleStatusChange}
                    disabled={statusChangeForm.loading || !statusChangeForm.newStatus}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {statusChangeForm.loading ? 'Updating...' : 'Update Status'}
                  </button>
                  <button
                    onClick={() => setStatusChangeForm({ show: false, newStatus: '', loading: false })}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-200"
                  >
                    Cancel
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
  );
};
