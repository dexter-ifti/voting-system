import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Voter {
  _id: string;
  voterId: string;
  name: string;
  email?: string;
  walletAddress: string;
  age: number;
  gender: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  isEligible: boolean;
  createdAt: string;
}

interface VotersResponse {
  voters: Voter[];
  totalPages: number;
  currentPage: number;
  totalVoters: number;
}

export const VoterManagement = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [verifying, setVerifying] = useState<string>('');

  const loadVoters = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (status) params.append('status', status);
      if (search) params.append('search', search);

      const { data } = await api.get(`/admin/voters?${params.toString()}`);
      if (data.success) {
        setVoters(data.data.voters);
        setTotalPages(data.data.totalPages);
      }
    } catch (error) {
      console.error('Failed to load voters:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyVoter = async (voterId: string, newStatus: 'verified' | 'rejected', reason?: string) => {
    setVerifying(voterId);
    try {
      const { data } = await api.put(`/admin/voters/${voterId}/verify`, {
        status: newStatus,
        reason: reason || `Voter ${newStatus}`
      });
      
      if (data.success) {
        await loadVoters(); // Reload the list
      }
    } catch (error) {
      console.error('Failed to verify voter:', error);
    } finally {
      setVerifying('');
    }
  };

  useEffect(() => {
    loadVoters();
  }, [page, status, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadVoters();
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Voter Management</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-end">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by name, email, or voter ID"
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

      {/* Voters Table */}
      {loading ? (
        <div className="text-center py-8 text-slate-400">Loading voters...</div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium">Voter ID</th>
                  <th className="text-left p-4 font-medium">Name</th>
                  <th className="text-left p-4 font-medium">Email</th>
                  <th className="text-left p-4 font-medium">Age</th>
                  <th className="text-left p-4 font-medium">Gender</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Wallet</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((voter) => (
                  <tr key={voter._id} className="border-t border-border">
                    <td className="p-4 font-mono text-sm">{voter.voterId}</td>
                    <td className="p-4">{voter.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{voter.email || 'N/A'}</td>
                    <td className="p-4">{voter.age}</td>
                    <td className="p-4">{voter.gender}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        voter.verificationStatus === 'verified' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : voter.verificationStatus === 'rejected'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {voter.verificationStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-xs">{voter.walletAddress.slice(0, 8)}...</td>
                    <td className="p-4">
                      {voter.verificationStatus === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => verifyVoter(voter.voterId, 'verified')}
                            disabled={verifying === voter.voterId}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {verifying === voter.voterId ? 'Processing...' : 'Verify'}
                          </button>
                          <button
                            onClick={() => verifyVoter(voter.voterId, 'rejected')}
                            disabled={verifying === voter.voterId}
                            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
    </div>
  );
};
