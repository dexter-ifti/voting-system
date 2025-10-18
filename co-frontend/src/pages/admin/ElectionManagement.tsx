import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
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

  const loadElections = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (status) params.append('status', status);
      if (electionType) params.append('electionType', electionType);
      if (search) params.append('search', search);

      const { data } = await api.get(`/election?${params.toString()}`);
      if (data.success) {
        setElections(data.data.elections);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load elections:', error);
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
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
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
            className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90"
          >
            Search
          </button>
        </form>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
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
          className="px-3 py-2 border border-border rounded-lg bg-background text-sm"
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
        <div className="text-center py-8 text-slate-400">Loading elections...</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
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
                  <tr key={election._id} className="border-t border-border">
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{election.title}</div>
                        <div className="text-xs text-muted-foreground font-mono">
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
                              setAnnounceResultsForm({ show: true, privateKey: '' });
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                          >
                            Results
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border flex justify-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Election Details Modal */}
      {selectedElection && !emergencyStopForm.show && !announceResultsForm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Election Analytics</h2>
                <button
                  onClick={() => {
                    setSelectedElection(null);
                    setAnalytics(null);
                  }}
                  className="text-muted-foreground hover:text-foreground"
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
                      <label className="text-sm font-medium text-muted-foreground">Title</label>
                      <p>{analytics.election.title}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Status</label>
                      <p className="capitalize">{analytics.election.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Registered</label>
                      <p>{analytics.election.totalRegistered}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Voted</label>
                      <p>{analytics.election.totalVoted}</p>
                    </div>
                  </div>

                  {/* Vote Distribution */}
                  {analytics.voteDistribution && analytics.voteDistribution.length > 0 && (
                    <div>
                      <h3 className="font-medium mb-3">Vote Distribution</h3>
                      <div className="space-y-2">
                        {analytics.voteDistribution.map((candidate: any, index: number) => (
                          <div key={index} className="bg-muted/50 p-3 rounded">
                            <div className="flex justify-between items-center">
                              <div>
                                <span className="font-medium">{candidate.name}</span>
                                <span className="text-muted-foreground ml-2">({candidate.party})</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{candidate.votes} votes</div>
                                <div className="text-sm text-muted-foreground">{candidate.percentage.toFixed(1)}%</div>
                              </div>
                            </div>
                            <div className="mt-2 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
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
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-3">Add Eligible Voter</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Voter Wallet Address</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        placeholder="0x..."
                        value={addVoterForm.walletAddress}
                        onChange={(e) => setAddVoterForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Admin/Authorized Private Key</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
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
                    <p className="text-[10px] text-muted-foreground">Voter must be registered and verified first.</p>
                  </div>
                </div>

                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-3">Add Candidate</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Candidate Wallet Address</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        placeholder="0x..."
                        value={addCandidateForm.walletAddress}
                        onChange={(e) => setAddCandidateForm(prev => ({ ...prev, walletAddress: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Admin/Authorized Private Key</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
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
                    <p className="text-[10px] text-muted-foreground">Candidate must be registered and verified first. Max {selectedElection?.candidates ? selectedElection?.candidates.length : 0}/{selectedElection?.maxCandidates ?? 'N/A'} allowed.</p>
                  </div>
                </div>
              </div>

              {/* Status Controls: Open Registration / Set Timing */}
              <div className="mt-6 p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-3">Open Registration / Set Timing</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Title (optional)</label>
                      <input
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                        placeholder="Update election title"
                        value={timingForm.title}
                        onChange={(e) => setTimingForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Description (optional)</label>
                      <textarea
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
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
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                          value={timingForm.startInMinutes}
                          onChange={(e) => setTimingForm(prev => ({ ...prev, startInMinutes: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
                          value={timingForm.durationMinutes}
                          onChange={(e) => setTimingForm(prev => ({ ...prev, durationMinutes: Number(e.target.value) }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Admin Private Key</label>
                      <input
                        type="password"
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm"
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
                    <p className="text-[10px] text-muted-foreground">This sets start/end on-chain and updates status to registration_open.</p>
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
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Emergency Stop Election</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Reason</label>
                  <textarea
                    value={emergencyStopForm.reason}
                    onChange={(e) => setEmergencyStopForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
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
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
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
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
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
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Announce Results</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Admin Private Key</label>
                  <input
                    type="password"
                    value={announceResultsForm.privateKey}
                    onChange={(e) => setAnnounceResultsForm(prev => ({ ...prev, privateKey: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background"
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
                    className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
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
