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
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-12 px-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Voter Management
          </h1>
          <p className="text-slate-400 text-lg">Verify and manage voter registrations</p>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <form onSubmit={handleSearch} className="flex gap-4 flex-1">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by name, email, or voter ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="group px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/25 font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Search</span>
                </span>
              </button>
            </form>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-3 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:border-purple-400/50 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Voters Table */}
        {loading ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
            <div className="text-center">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-padding"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-border opacity-20"></div>
              </div>
              <p className="text-slate-300 font-medium animate-pulse">Loading voters...</p>
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
                          <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <span>Voter ID</span>
                      </div>
                    </th>
                    <th className="text-left p-6 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <span>Name</span>
                      </div>
                    </th>
                    <th className="text-left p-6 font-semibold text-white">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <span>Email</span>
                      </div>
                    </th>
                    <th className="text-left p-6 font-semibold text-white">Age</th>
                    <th className="text-left p-6 font-semibold text-white">Gender</th>
                    <th className="text-left p-6 font-semibold text-white">Status</th>
                    <th className="text-left p-6 font-semibold text-white">Wallet</th>
                    <th className="text-left p-6 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {voters.map((voter) => (
                    <tr key={voter._id} className="group hover:bg-white/5 transition-all duration-300">
                      <td className="p-6">
                        <span className="font-mono text-sm bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-lg text-slate-300 border border-white/10">
                          {voter.voterId}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {voter.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{voter.name}</div>
                            <div className="text-xs text-slate-400">Registered {new Date(voter.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-slate-300">{voter.email || 'N/A'}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-slate-300 font-medium">{voter.age}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-slate-300 capitalize">{voter.gender}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          voter.verificationStatus === 'verified' 
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                            : voter.verificationStatus === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        }`}>
                          {voter.verificationStatus}
                        </span>
                      </td>
                      <td className="p-6">
                        <span className="font-mono text-xs bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10 text-slate-300">
                          {voter.walletAddress.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="p-6">
                        {voter.verificationStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => verifyVoter(voter.voterId, 'verified')}
                              disabled={verifying === voter.voterId}
                              className="group relative px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <span className="relative flex items-center space-x-1">
                                {verifying === voter.voterId ? (
                                  <>
                                    <svg className="animate-spin w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Verify</span>
                                  </>
                                )}
                              </span>
                            </button>
                            <button
                              onClick={() => verifyVoter(voter.voterId, 'rejected')}
                              disabled={verifying === voter.voterId}
                              className="group relative px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                              <span className="relative flex items-center space-x-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Reject</span>
                              </span>
                            </button>
                          </div>
                        )}
                        {voter.verificationStatus !== 'pending' && (
                          <span className="text-slate-500 text-xs">No actions available</span>
                        )}
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
      </div>
    </div>
  );
};
