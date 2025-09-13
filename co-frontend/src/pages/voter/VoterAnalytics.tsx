import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface VotingHistory {
  electionId: {
    _id: string;
    title?: string;
    electionType?: string;
    status?: string;
    contractAddress?: string;
    totalVotesCast?: number;
    totalRegisteredVoters?: number;
  };
  hasVoted: boolean;
  votedAt?: string;
  participationRate?: number;
}

interface VoterAnalytics {
  totalElectionsRegistered: number;
  totalVotesCast: number;
  participationRate: number;
  votingHistory: VotingHistory[];
  recentActivity: VotingHistory[];
  electionTypes: { [key: string]: number };
}

export const VoterAnalytics = () => {
  const user = useAuthStore(s => s.user);
  const [analytics, setAnalytics] = useState<VoterAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<VotingHistory | null>(null);

  const loadAnalytics = async () => {
    if (!user?.walletAddress) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/voter/${user.walletAddress}/elections`);
      if (data.success && data.data.elections) {
        const elections = data.data.elections;
        
        // Calculate analytics
        const totalElectionsRegistered = elections.length;
        const totalVotesCast = elections.filter((e: any) => e.hasVoted).length;
        const participationRate = totalElectionsRegistered > 0 
          ? (totalVotesCast / totalElectionsRegistered) * 100 
          : 0;

        // Enhance elections with additional data
        const enhancedElections = await Promise.all(
          elections.map(async (election: any) => {
            try {
              if (!election.electionId.contractAddress) {
                return election;
              }
              const electionDetail = await api.get(`/election/${election.electionId.contractAddress}`);
              if (electionDetail.data.success) {
                const electionData = electionDetail.data.data.election;
                return {
                  ...election,
                  electionId: {
                    ...election.electionId,
                    totalVotesCast: electionData.totalVotesCast || 0,
                    totalRegisteredVoters: electionData.totalRegisteredVoters || 0
                  },
                  participationRate: electionData.totalRegisteredVoters > 0 
                    ? (electionData.totalVotesCast / electionData.totalRegisteredVoters) * 100 
                    : 0
                };
              }
              return election;
            } catch (error) {
              return election;
            }
          })
        );

        // Calculate election type distribution
        const electionTypes = enhancedElections.reduce((acc: any, election: any) => {
          const type = election.electionId.electionType || 'unknown';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});

        setAnalytics({
          totalElectionsRegistered,
          totalVotesCast,
          participationRate,
          votingHistory: enhancedElections,
          recentActivity: enhancedElections.slice(-5).reverse(),
          electionTypes
        });
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'results_announced': return 'text-gray-600';
      case 'voting_active': return 'text-green-600';
      case 'registration_open': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'results_announced': return 'bg-gray-100 text-gray-800';
      case 'voting_active': return 'bg-green-100 text-green-800';
      case 'registration_open': return 'bg-blue-100 text-blue-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
  if (!analytics) return <div className="p-8 text-center text-red-400">Failed to load analytics</div>;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalElectionsRegistered}</div>
          <div className="text-sm text-muted-foreground">Elections Registered</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{analytics.totalVotesCast}</div>
          <div className="text-sm text-muted-foreground">Votes Cast</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.participationRate.toFixed(1)}%
          </div>
          <div className="text-sm text-muted-foreground">Participation Rate</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {Object.keys(analytics.electionTypes).length}
          </div>
          <div className="text-sm text-muted-foreground">Election Types</div>
        </div>
      </div>

      {/* Participation Rate Visual */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Voting Participation</h3>
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Voted: {analytics.totalVotesCast}</span>
            <span>Registered: {analytics.totalElectionsRegistered}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-4">
            <div 
              className="bg-primary h-4 rounded-full transition-all duration-300"
              style={{ width: `${analytics.participationRate}%` }}
            />
          </div>
          <div className="text-center text-sm text-muted-foreground">
            You have voted in {analytics.participationRate.toFixed(1)}% of elections you registered for
          </div>
        </div>
      </div>

      {/* Election Types Distribution */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Election Types Participated</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(analytics.electionTypes).map(([type, count]) => (
            <div key={type} className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-xl font-bold">{count as number}</div>
              <div className="text-sm text-muted-foreground capitalize">
                {type.replace('_', ' ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Recent Voting Activity</h3>
        <div className="space-y-4">
          {analytics.recentActivity.map((election, index) => (
            <div key={election.electionId._id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{election.electionId.title || 'Untitled Election'}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {election.electionId.electionType || 'Unknown'} • 
                    <span className={getStatusColor(election.electionId.status)}>
                      {(election.electionId.status || 'unknown').replace('_', ' ')}
                    </span>
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Total Votes: {election.electionId.totalVotesCast || 0}</span>
                    <span>Registered Voters: {election.electionId.totalRegisteredVoters || 0}</span>
                    {election.participationRate && (
                      <span>Turnout: {election.participationRate.toFixed(1)}%</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    election.hasVoted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {election.hasVoted ? 'Voted' : 'Registered'}
                  </div>
                  {election.votedAt && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(election.votedAt).toLocaleDateString()}
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedElection(election)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Participation bar for this election */}
              {election.participationRate && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Election Turnout</span>
                    <span>{election.participationRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${election.participationRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Full Voting History */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="font-semibold text-lg mb-4">Complete Voting History</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {analytics.votingHistory.map((election, index) => (
            <div key={election.electionId._id} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <div className="flex-1">
                <div className="text-sm font-medium">{election.electionId.title || 'Untitled Election'}</div>
                <div className="text-xs text-muted-foreground">
                  {election.electionId.electionType || 'Unknown'} • {(election.electionId.contractAddress || '').slice(0, 10)}...
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(election.electionId.status)}`}>
                  {(election.electionId.status || 'unknown').replace('_', ' ')}
                </span>
                <div className={`text-xs font-medium mt-1 ${
                  election.hasVoted ? 'text-green-600' : 'text-yellow-600'
                }`}>
                  {election.hasVoted ? 'Voted' : 'Registered Only'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* No data message */}
      {analytics.totalElectionsRegistered === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">No Voting Data</h3>
          <p className="text-muted-foreground">
            You haven't registered for any elections yet. Start participating to see your voting analytics.
          </p>
        </div>
      )}

      {/* Election Details Modal */}
      {selectedElection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Election Details</h2>
                <button
                  onClick={() => setSelectedElection(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{selectedElection.electionId.title || 'Untitled Election'}</h3>
                  <p className="text-muted-foreground capitalize">
                    {selectedElection.electionId.electionType || 'Unknown'} Election • {(selectedElection.electionId.status || 'unknown').replace('_', ' ')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">{selectedElection.electionId.totalVotesCast || 0}</div>
                    <div className="text-sm text-muted-foreground">Total Votes Cast</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">{selectedElection.electionId.totalRegisteredVoters || 0}</div>
                    <div className="text-sm text-muted-foreground">Registered Voters</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">
                      {selectedElection.participationRate?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Turnout Rate</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className={`text-2xl font-bold ${selectedElection.hasVoted ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedElection.hasVoted ? 'Yes' : 'No'}
                    </div>
                    <div className="text-sm text-muted-foreground">Your Vote</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Contract Address</h4>
                  <code className="text-xs bg-muted/50 p-2 rounded block font-mono">
                    {selectedElection.electionId.contractAddress || 'N/A'}
                  </code>
                </div>

                {selectedElection.votedAt && (
                  <div>
                    <h4 className="font-medium mb-2">Voting Details</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Voted On:</span>
                        <span>{new Date(selectedElection.votedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
