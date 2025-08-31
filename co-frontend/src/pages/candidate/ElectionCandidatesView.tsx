import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../lib/api';

interface ElectionCandidate {
  candidateId: string;
  candidateAddress: string;
  name: string;
  party: string;
  manifesto: string;
  votes: string;
  profileImage?: string;
  socialMedia?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  registeredAt?: string;
}

interface ElectionDetails {
  _id: string;
  title: string;
  description: string;
  electionType: string;
  contractAddress: string;
  status: string;
  votingStartTime?: string;
  votingEndTime?: string;
  totalRegisteredVoters: number;
  totalVotesCast: number;
  candidates: Array<{
    candidateId: {
      name: string;
      party: string;
    };
    onChainId: number;
    votesReceived: number;
  }>;
  deployedBy?: {
    name: string;
    email: string;
  };
}

export const ElectionCandidatesView = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const [election, setElection] = useState<ElectionDetails | null>(null);
  const [candidates, setCandidates] = useState<ElectionCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<ElectionCandidate | null>(null);

  const loadElectionData = async () => {
    if (!contractAddress) return;

    setLoading(true);
    try {
      const [electionRes, candidatesRes] = await Promise.all([
        api.get(`/election/${contractAddress}`),
        api.get(`/candidate/election/${contractAddress}`)
      ]);

      if (electionRes.data.success) {
        setElection(electionRes.data.data.election);
      }

      if (candidatesRes.data.success) {
        setCandidates(candidatesRes.data.data.candidates);
      }
    } catch (error) {
      console.error('Failed to load election data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElectionData();
  }, [contractAddress]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-100 text-blue-800';
      case 'registration_open': return 'bg-purple-100 text-purple-800';
      case 'voting_active': return 'bg-green-100 text-green-800';
      case 'results_announced': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const totalVotes = candidates.reduce((sum, c) => sum + parseInt(c.votes || '0'), 0);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading election details...</div>;
  if (!election) return <div className="p-8 text-center text-red-400">Election not found</div>;

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-8">
      {/* Election Header */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold">{election.title}</h1>
            <p className="text-muted-foreground mt-1">{election.description}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(election.status)}`}>
            {election.status.replace('_', ' ')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-lg font-semibold">{candidates.length}</div>
            <div className="text-sm text-muted-foreground">Candidates</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{election.totalRegisteredVoters}</div>
            <div className="text-sm text-muted-foreground">Registered Voters</div>
          </div>
          <div>
            <div className="text-lg font-semibold">{election.totalVotesCast}</div>
            <div className="text-sm text-muted-foreground">Votes Cast</div>
          </div>
          <div>
            <div className="text-lg font-semibold">
              {election.totalRegisteredVoters > 0 
                ? `${((election.totalVotesCast / election.totalRegisteredVoters) * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <div className="text-sm text-muted-foreground">Turnout</div>
          </div>
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <span className="font-mono">{election.contractAddress}</span>
          {election.deployedBy && (
            <span className="ml-4">Deployed by: {election.deployedBy.name}</span>
          )}
        </div>
      </div>

      {/* Candidates List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Candidates</h2>
        
        {candidates.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {candidates
              .sort((a, b) => parseInt(b.votes) - parseInt(a.votes))
              .map((candidate, index) => {
                const votePercentage = totalVotes > 0 ? (parseInt(candidate.votes) / totalVotes * 100) : 0;
                
                return (
                  <div key={candidate.candidateId} className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-muted-foreground">{candidate.party}</p>
                      </div>
                      {index < 3 && (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                      )}
                    </div>

                    {/* Vote Count */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-muted-foreground">Votes</span>
                        <span className="font-semibold">{candidate.votes}</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${votePercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {votePercentage.toFixed(1)}% of total votes
                      </div>
                    </div>

                    {/* Manifesto Preview */}
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {candidate.manifesto}
                      </p>
                    </div>

                    {/* Social Media Links */}
                    {candidate.socialMedia && (
                      <div className="flex gap-2 mb-4">
                        {candidate.socialMedia.twitter && (
                          <a 
                            href={candidate.socialMedia.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-600 text-sm"
                          >
                            Twitter
                          </a>
                        )}
                        {candidate.socialMedia.facebook && (
                          <a 
                            href={candidate.socialMedia.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            Facebook
                          </a>
                        )}
                        {candidate.socialMedia.instagram && (
                          <a 
                            href={candidate.socialMedia.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-500 hover:text-pink-600 text-sm"
                          >
                            Instagram
                          </a>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => setSelectedCandidate(candidate)}
                      className="w-full px-3 py-2 bg-muted hover:bg-muted/80 rounded text-sm transition-colors"
                    >
                      View Details
                    </button>

                    <div className="mt-2 text-xs text-muted-foreground">
                      Wallet: {candidate.candidateAddress.slice(0, 8)}...
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No candidates registered for this election yet.
          </div>
        )}
      </div>

      {/* Election Timeline */}
      {(election.votingStartTime || election.votingEndTime) && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-4">Election Timeline</h3>
          <div className="space-y-2 text-sm">
            {election.votingStartTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voting Start:</span>
                <span>{new Date(election.votingStartTime).toLocaleString()}</span>
              </div>
            )}
            {election.votingEndTime && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voting End:</span>
                <span>{new Date(election.votingEndTime).toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold">{selectedCandidate.name}</h2>
                  <p className="text-muted-foreground">{selectedCandidate.party}</p>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Votes Received</h3>
                  <div className="text-2xl font-bold">{selectedCandidate.votes}</div>
                  <div className="text-sm text-muted-foreground">
                    {totalVotes > 0 ? `${((parseInt(selectedCandidate.votes) / totalVotes) * 100).toFixed(1)}% of total votes` : 'No votes yet'}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Manifesto</h3>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">{selectedCandidate.manifesto}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Wallet Address</h3>
                  <code className="text-xs bg-muted/50 p-2 rounded block">
                    {selectedCandidate.candidateAddress}
                  </code>
                </div>

                {selectedCandidate.registeredAt && (
                  <div>
                    <h3 className="font-medium mb-2">Registration Date</h3>
                    <p className="text-sm">{new Date(selectedCandidate.registeredAt).toLocaleString()}</p>
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
