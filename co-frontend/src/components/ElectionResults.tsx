import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface ElectionResult {
  position: number;
  candidateId: string;
  candidateAddress?: string;
  name?: string;
  party?: string;
  votesReceived: number;
  percentage: number;
}

interface ElectionResultsData {
  election: {
    _id: string;
    title: string;
    description: string;
    electionType: string;
    contractAddress: string;
    status: string;
    resultsAnnouncedAt: string;
    totalRegisteredVoters: number;
    totalVotesCast: number;
    turnoutPercentage: number;
  };
  winner: {
    votesReceived: number;
    walletAddress: string;
  };
  results: ElectionResult[];
  detailedResults: ElectionResult[];
}

interface ElectionResultsProps {
  contractAddress: string;
  onClose?: () => void;
}

export function ElectionResults({ contractAddress, onClose }: ElectionResultsProps) {
  const [resultsData, setResultsData] = useState<ElectionResultsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchResults();
  }, [contractAddress]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/election/${contractAddress}/results`);
      setResultsData(data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-padding"></div>
            <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-border opacity-20"></div>
          </div>
          <span className="text-slate-300 font-medium animate-pulse">Loading election results...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-12 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10">
        <div className="flex flex-col items-center space-y-6">
          <div className="text-6xl animate-bounce">❌</div>
          <div className="text-red-400 mb-4 font-medium">{error}</div>
          <button 
            onClick={fetchResults}
            className="group relative px-8 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/25 font-medium"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative">Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!resultsData) {
    return (
      <div className="text-center p-12 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10">
        <div className="text-slate-400 font-medium">No results available</div>
      </div>
    );
  }

  const { election, winner, detailedResults } = resultsData;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-8">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="flex justify-between items-start p-8 border-b border-white/10">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                {election.title}
              </h2>
              <p className="text-slate-400 capitalize text-lg font-medium">
                {election.electionType} Election Results
              </p>
              <div className="flex items-center space-x-2 text-sm text-slate-500">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Results announced: {new Date(election.resultsAnnouncedAt).toLocaleDateString()}</span>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white text-2xl font-bold transition-colors duration-200 hover:scale-110"
              >
                ×
              </button>
            )}
          </div>

          {/* Election Statistics */}
          <div className="p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-blue-400/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{election.totalRegisteredVoters.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Registered Voters</div>
                  </div>
                </div>
              </div>

              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-green-400/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{election.totalVotesCast.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Votes Cast</div>
                  </div>
                </div>
              </div>

              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-purple-400/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{election.turnoutPercentage.toFixed(1)}%</div>
                    <div className="text-sm text-slate-400">Turnout</div>
                  </div>
                </div>
              </div>

              <div className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/5 hover:border-amber-400/30 transition-all duration-300 hover:scale-105">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{winner.votesReceived.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">Winning Votes</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Winner Announcement */}
            {detailedResults.length > 0 && (
              <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-amber-500/20 to-yellow-500/20 backdrop-blur-sm rounded-2xl p-8 border border-amber-400/30 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 animate-pulse"></div>
                <div className="relative flex items-center space-x-6">
                  <div className="text-6xl animate-bounce">🏆</div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                      Election Winner
                    </h3>
                    <p className="text-2xl font-bold text-white">
                      {detailedResults[0].name || `Candidate ${detailedResults[0].candidateId}`}
                      {detailedResults[0].party && (
                        <span className="ml-3 text-lg text-amber-300 font-medium">({detailedResults[0].party})</span>
                      )}
                    </p>
                    <div className="flex items-center space-x-4">
                      <span className="bg-amber-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-amber-400/30">
                        <span className="text-amber-300 font-medium">{detailedResults[0].votesReceived.toLocaleString()} votes</span>
                      </span>
                      <span className="bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-400/30">
                        <span className="text-yellow-300 font-medium">{detailedResults[0].percentage.toFixed(1)}%</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Table */}
          <div className="p-8 pt-0">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-800 to-slate-700 border-b border-white/10">
                      <th className="px-6 py-4 text-left font-semibold text-white">Position</th>
                      <th className="px-6 py-4 text-left font-semibold text-white">Candidate</th>
                      <th className="px-6 py-4 text-left font-semibold text-white">Party</th>
                      <th className="px-6 py-4 text-center font-semibold text-white">Votes</th>
                      <th className="px-6 py-4 text-center font-semibold text-white">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {detailedResults.map((result, index) => (
                      <tr 
                        key={result.candidateId} 
                        className={`
                          group hover:bg-white/5 transition-all duration-300
                          ${index === 0 ? 'bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-l-4 border-l-amber-400' : ''}
                        `}
                      >
                        <td className="px-6 py-6">
                          <div className="flex items-center space-x-3">
                            <div className="text-2xl">
                              {index === 0 && '🥇'}
                              {index === 1 && '🥈'}
                              {index === 2 && '🥉'}
                              {index > 2 && '🏅'}
                            </div>
                            <span className="font-bold text-white text-lg">#{result.position}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="space-y-1">
                            <div className="font-bold text-white text-lg">
                              {result.name || `Candidate ${result.candidateId}`}
                            </div>
                            {result.candidateAddress && (
                              <div className="text-sm text-slate-400 font-mono bg-slate-800/50 px-2 py-1 rounded inline-block">
                                {result.candidateAddress.slice(0, 8)}...{result.candidateAddress.slice(-6)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <span className={`
                            px-3 py-1 rounded-full text-sm font-medium
                            ${result.party ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'text-slate-400'}
                          `}>
                            {result.party || 'Independent'}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-center">
                          <div className="bg-slate-700/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                            <span className="font-bold text-white text-xl">{result.votesReceived.toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          <div className="flex items-center space-x-4">
                            <div className="flex-1">
                              <div className="bg-slate-700 rounded-full h-4 overflow-hidden">
                                <div 
                                  className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                                    index === 0 ? 'bg-gradient-to-r from-amber-400 to-yellow-500' : 
                                    index === 1 ? 'bg-gradient-to-r from-blue-400 to-cyan-500' : 
                                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 
                                    'bg-gradient-to-r from-slate-400 to-slate-500'
                                  } shadow-lg`}
                                  style={{ 
                                    width: `${result.percentage}%`,
                                    animationDelay: `${index * 200}ms`
                                  }}
                                ></div>
                              </div>
                            </div>
                            <span className="font-bold text-white text-lg min-w-[4rem] text-right">
                              {result.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300 font-medium">Contract Address:</span>
                  </div>
                  <span className="font-mono text-white bg-slate-700/50 px-3 py-1 rounded-lg text-sm">
                    {election.contractAddress}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300 font-medium">Election Status:</span>
                  </div>
                  <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 rounded-full text-sm font-semibold uppercase backdrop-blur-sm">
                    {election.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}