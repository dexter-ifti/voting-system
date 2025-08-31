import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface ElectionPerformance {
  electionId: {
    _id: string;
    title: string;
    electionType: string;
    status: string;
    contractAddress: string;
    totalVotesCast: number;
    totalRegisteredVoters: number;
  };
  votesReceived: number;
  position?: number;
  totalCandidates?: number;
  votePercentage?: number;
}

interface CandidateAnalytics {
  totalElections: number;
  totalVotes: number;
  averagePosition: number;
  bestPerformance: ElectionPerformance | null;
  recentPerformance: ElectionPerformance[];
}

export const CandidateAnalytics = () => {
  const user = useAuthStore(s => s.user);
  const [analytics, setAnalytics] = useState<CandidateAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedElection, setSelectedElection] = useState<ElectionPerformance | null>(null);

  const loadAnalytics = async () => {
    if (!user?.walletAddress) return;

    setLoading(true);
    try {
      const { data } = await api.get(`/candidate/profile/${user.walletAddress}`);
      if (data.success && data.data.candidate.elections) {
        const elections = data.data.candidate.elections;
        
        // Calculate analytics
        const totalElections = elections.length;
        const totalVotes = elections.reduce((sum: number, e: any) => sum + e.votesReceived, 0);
        
        // For each election, get additional details
        const enhancedElections = await Promise.all(
          elections.map(async (election: any) => {
            try {
              const electionDetail = await api.get(`/election/${election.electionId.contractAddress}`);
              if (electionDetail.data.success) {
                const candidateCount = electionDetail.data.data.election.candidates?.length || 1;
                const totalVotesCast = electionDetail.data.data.election.totalVotesCast || 0;
                
                return {
                  ...election,
                  totalCandidates: candidateCount,
                  votePercentage: totalVotesCast > 0 ? (election.votesReceived / totalVotesCast * 100) : 0
                };
              }
              return election;
            } catch (error) {
              return election;
            }
          })
        );

        const bestPerformance = enhancedElections.reduce((best: any, current: any) => {
          if (!best || current.votesReceived > best.votesReceived) {
            return current;
          }
          return best;
        }, null);

        setAnalytics({
          totalElections,
          totalVotes,
          averagePosition: 0, // Would need ranking data from backend
          bestPerformance,
          recentPerformance: enhancedElections.slice(-5).reverse()
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'results_announced': return 'text-gray-600';
      case 'voting_active': return 'text-green-600';
      case 'registration_open': return 'text-blue-600';
      default: return 'text-yellow-600';
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading analytics...</div>;
  if (!analytics) return <div className="p-8 text-center text-red-400">Failed to load analytics</div>;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{analytics.totalElections}</div>
          <div className="text-sm text-muted-foreground">Elections Participated</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{analytics.totalVotes}</div>
          <div className="text-sm text-muted-foreground">Total Votes Received</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            {analytics.totalElections > 0 ? Math.round(analytics.totalVotes / analytics.totalElections) : 0}
          </div>
          <div className="text-sm text-muted-foreground">Average Votes per Election</div>
        </div>
        
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">
            {analytics.bestPerformance?.votePercentage?.toFixed(1) || 0}%
          </div>
          <div className="text-sm text-muted-foreground">Best Vote Share</div>
        </div>
      </div>

      {/* Best Performance */}
      {analytics.bestPerformance && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold text-lg mb-4">🏆 Best Performance</h3>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h4 className="font-medium">{analytics.bestPerformance.electionId.title}</h4>
              <p className="text-sm text-muted-foreground capitalize">
                {analytics.bestPerformance.electionId.electionType} Election
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Contract: {analytics.bestPerformance.electionId.contractAddress.slice(0, 10)}...
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{analytics.bestPerformance.votesReceived}</div>
              <div className="text-sm text-muted-foreground">votes</div>
              {analytics.bestPerformance.votePercentage && (
                <div className="text-xs text-green-600 font-medium">
                  {analytics.bestPerformance.votePercentage.toFixed(1)}% share
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recent Performance */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Recent Elections</h3>
        <div className="space-y-4">
          {analytics.recentPerformance.map((election, index) => (
            <div key={election.electionId._id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{election.electionId.title}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {election.electionId.electionType} • 
                    <span className={getStatusColor(election.electionId.status)}>
                      {election.electionId.status.replace('_', ' ')}
                    </span>
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Total Votes: {election.electionId.totalVotesCast}</span>
                    <span>Turnout: {election.electionId.totalRegisteredVoters > 0 
                      ? `${((election.electionId.totalVotesCast / election.electionId.totalRegisteredVoters) * 100).toFixed(1)}%`
                      : 'N/A'
                    }</span>
                    {election.totalCandidates && (
                      <span>Candidates: {election.totalCandidates}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{election.votesReceived}</div>
                  <div className="text-xs text-muted-foreground">votes received</div>
                  {election.votePercentage !== undefined && (
                    <div className="text-xs text-blue-600 font-medium">
                      {election.votePercentage.toFixed(1)}% share
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
              
              {/* Vote percentage bar */}
              {election.votePercentage !== undefined && (
                <div className="mt-3">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${election.votePercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* No elections message */}
      {analytics.totalElections === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium mb-2">No Election Data</h3>
          <p className="text-muted-foreground">
            You haven't participated in any elections yet. Register for available elections to start building your political profile.
          </p>
        </div>
      )}

      {/* Election Details Modal */}
      {selectedElection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Election Performance Details</h2>
                <button
                  onClick={() => setSelectedElection(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-lg">{selectedElection.electionId.title}</h3>
                  <p className="text-muted-foreground capitalize">
                    {selectedElection.electionId.electionType} Election • {selectedElection.electionId.status.replace('_', ' ')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">{selectedElection.votesReceived}</div>
                    <div className="text-sm text-muted-foreground">Your Votes</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">{selectedElection.electionId.totalVotesCast}</div>
                    <div className="text-sm text-muted-foreground">Total Votes Cast</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">
                      {selectedElection.votePercentage?.toFixed(1) || 0}%
                    </div>
                    <div className="text-sm text-muted-foreground">Vote Share</div>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="text-2xl font-bold">{selectedElection.totalCandidates || 'N/A'}</div>
                    <div className="text-sm text-muted-foreground">Total Candidates</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Contract Address</h4>
                  <code className="text-xs bg-muted/50 p-2 rounded block font-mono">
                    {selectedElection.electionId.contractAddress}
                  </code>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Election Statistics</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Registered Voters:</span>
                      <span>{selectedElection.electionId.totalRegisteredVoters}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Voter Turnout:</span>
                      <span>
                        {selectedElection.electionId.totalRegisteredVoters > 0 
                          ? `${((selectedElection.electionId.totalVotesCast / selectedElection.electionId.totalRegisteredVoters) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
