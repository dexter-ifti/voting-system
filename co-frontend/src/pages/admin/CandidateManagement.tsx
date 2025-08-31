import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Candidate {
  _id: string;
  candidateId: string;
  name: string;
  party: string;
  manifesto: string;
  email: string;
  phone: string;
  walletAddress: string;
  age: number;
  gender: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isActive: boolean;
  createdAt: string;
  elections: Array<{
    electionId: {
      title: string;
      status: string;
    };
    votesReceived: number;
  }>;
}

interface CandidatesResponse {
  candidates: Candidate[];
  totalPages: number;
  currentPage: number;
  totalCandidates: number;
}

export const CandidateManagement = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState<string>('');
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const { data } = await api.get(`/admin/candidates?${params.toString()}`);
      if (data.success) {
        setCandidates(data.data.candidates);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load candidates:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCandidate = async (candidateId: string, newStatus: 'verified' | 'rejected', reason?: string) => {
    setVerifying(candidateId);
    try {
      const { data } = await api.put(`/admin/candidates/${candidateId}/verify`, {
        status: newStatus,
        reason: reason || `Candidate ${newStatus}`
      });
      
      if (data.success) {
        await loadCandidates(); // Reload the list
      }
    } catch (error) {
      console.error('Failed to verify candidate:', error);
    } finally {
      setVerifying('');
    }
  };

  useEffect(() => {
    loadCandidates();
  }, [page, status, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadCandidates();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Candidate Management</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name, party, or candidate ID"
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
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading candidates...</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Candidate ID</th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Party</th>
                  <th className="text-left p-4 font-medium">Age</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Elections</th>
                  <th className="text-left p-4 font-medium">Wallet</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate._id} className="border-t border-border">
                    <td className="p-4 font-mono text-sm">{candidate.candidateId}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-xs text-muted-foreground">{candidate.email}</div>
                      </div>
                    </td>
                    <td className="p-4">{candidate.party}</td>
                    <td className="p-4">{candidate.age}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        candidate.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : candidate.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {candidate.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{candidate.elections?.length || 0}</td>
                    <td className="p-4 font-mono text-xs">{candidate.walletAddress.slice(0, 8)}...</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCandidate(candidate)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        >
                          View
                        </button>
                        {candidate.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => verifyCandidate(candidate.candidateId, 'verified')}
                              disabled={verifying === candidate.candidateId}
                              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                            >
                              {verifying === candidate.candidateId ? 'Processing...' : 'Verify'}
                            </button>
                            <button
                              onClick={() => verifyCandidate(candidate.candidateId, 'rejected')}
                              disabled={verifying === candidate.candidateId}
                              className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
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

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Candidate Details</h2>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p>{selectedCandidate.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Party</label>
                    <p>{selectedCandidate.party}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Age</label>
                    <p>{selectedCandidate.age}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Gender</label>
                    <p>{selectedCandidate.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p>{selectedCandidate.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Phone</label>
                    <p>{selectedCandidate.phone}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Wallet Address</label>
                  <p className="font-mono text-sm">{selectedCandidate.walletAddress}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Manifesto</label>
                  <p className="text-sm bg-muted/50 p-3 rounded">{selectedCandidate.manifesto}</p>
                </div>

                {selectedCandidate.elections && selectedCandidate.elections.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Elections Participated</label>
                    <div className="space-y-2 mt-2">
                      {selectedCandidate.elections.map((election, index) => (
                        <div key={index} className="bg-muted/50 p-3 rounded text-sm">
                          <div className="font-medium">{election.electionId?.title}</div>
                          <div className="text-muted-foreground">Votes: {election.votesReceived}</div>
                        </div>
                      ))}
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
