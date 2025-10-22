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
              Candidate Management
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Manage and verify candidate registrations</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-6">
          <div className="flex flex-wrap gap-4 items-end">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1 min-w-96">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, party, or candidate ID"
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

            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="appearance-none px-4 py-3 pr-10 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 transition-all duration-300 cursor-pointer"
              >
                <option value="" className="bg-slate-800">All Status</option>
                <option value="pending" className="bg-slate-800">Pending</option>
                <option value="verified" className="bg-slate-800">Verified</option>
                <option value="rejected" className="bg-slate-800">Rejected</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Candidates Table */}
        {loading ? (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-12">
            <div className="text-center">
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-padding"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-border opacity-20"></div>
              </div>
              <p className="text-slate-300 font-medium animate-pulse">Loading candidates...</p>
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
                        <span>Candidate ID</span>
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
                    <th className="text-left p-6 font-semibold text-white">Party</th>
                    <th className="text-left p-6 font-semibold text-white">Age</th>
                    <th className="text-left p-6 font-semibold text-white">Status</th>
                    <th className="text-left p-6 font-semibold text-white">Elections</th>
                    <th className="text-left p-6 font-semibold text-white">Wallet</th>
                    <th className="text-left p-6 font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {candidates.map((candidate) => (
                    <tr key={candidate._id} className="group hover:bg-white/5 transition-all duration-300">
                      <td className="p-6">
                        <span className="font-mono text-sm bg-slate-800/50 backdrop-blur-sm px-3 py-1 rounded-lg text-slate-300 border border-white/10">
                          {candidate.candidateId}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {candidate.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-white">{candidate.name}</div>
                            <div className="text-xs text-slate-400">{candidate.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full"></div>
                          <span className="text-slate-300 font-medium">{candidate.party}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="text-slate-300 font-medium">{candidate.age}</span>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          candidate.verificationStatus === 'verified' 
                            ? 'bg-green-500/20 text-green-300 border border-green-400/30'
                            : candidate.verificationStatus === 'rejected'
                            ? 'bg-red-500/20 text-red-300 border border-red-400/30'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30'
                        }`}>
                          {candidate.verificationStatus}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-slate-800/50 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/10">
                            <span className="text-purple-400 text-xs font-bold">{candidate.elections?.length || 0}</span>
                          </div>
                          <span className="text-slate-400 text-sm">contests</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className="font-mono text-xs bg-slate-800/50 backdrop-blur-sm px-2 py-1 rounded border border-white/10 text-slate-300">
                          {candidate.walletAddress.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedCandidate(candidate)}
                            className="group relative px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 text-xs font-medium"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="relative flex items-center space-x-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </span>
                          </button>
                          {candidate.verificationStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => verifyCandidate(candidate.candidateId, 'verified')}
                                disabled={verifying === candidate.candidateId}
                                className="group relative px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-green-500/25 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <span className="relative flex items-center space-x-1">
                                  {verifying === candidate.candidateId ? (
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
                                onClick={() => verifyCandidate(candidate.candidateId, 'rejected')}
                                disabled={verifying === candidate.candidateId}
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

        {/* Candidate Details Modal */}
        {selectedCandidate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                      Candidate Details
                    </h2>
                    <p className="text-slate-400 mt-1">Complete candidate information</p>
                  </div>
                  <button
                    onClick={() => setSelectedCandidate(null)}
                    className="group p-2 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 hover:scale-110 transition-all duration-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <span>Personal Information</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium text-purple-400 mb-1 block">Name</label>
                        <p className="text-white font-medium">{selectedCandidate.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-purple-400 mb-1 block">Party</label>
                        <p className="text-white font-medium">{selectedCandidate.party}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-purple-400 mb-1 block">Age</label>
                        <p className="text-white font-medium">{selectedCandidate.age}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-purple-400 mb-1 block">Gender</label>
                        <p className="text-white font-medium capitalize">{selectedCandidate.gender}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-purple-400 mb-1 block">Email</label>
                        <p className="text-slate-300">{selectedCandidate.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-purple-400 mb-1 block">Phone</label>
                        <p className="text-slate-300">{selectedCandidate.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain Information */}
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span>Blockchain Information</span>
                    </h3>
                    <div>
                      <label className="text-sm font-medium text-purple-400 mb-2 block">Wallet Address</label>
                      <div className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                        <p className="font-mono text-sm text-slate-300 break-all">{selectedCandidate.walletAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Manifesto */}
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span>Manifesto</span>
                    </h3>
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-xl border border-white/10">
                      <p className="text-slate-300 leading-relaxed">{selectedCandidate.manifesto}</p>
                    </div>
                  </div>

                  {/* Elections Participated */}
                  {selectedCandidate.elections && selectedCandidate.elections.length > 0 && (
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Elections Participated</span>
                      </h3>
                      <div className="space-y-4">
                        {selectedCandidate.elections.map((election, index) => (
                          <div key={index} className="bg-slate-900/50 backdrop-blur-sm p-4 rounded-xl border border-white/10">
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-white">{election.electionId?.title}</div>
                                <div className="text-sm text-slate-400">Election Status: {election.electionId?.status}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-400">{election.votesReceived}</div>
                                <div className="text-xs text-slate-400">votes received</div>
                              </div>
                            </div>
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
    </div>
  );
};
