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

  // Add custom scrollbar styles
  const customScrollbarStyle = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgb(51 65 85 / 0.3);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, rgb(59 130 246), rgb(16 185 129));
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(to bottom, rgb(37 99 235), rgb(5 150 105));
    }
  `;

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
      case 'results_announced': return 'text-slate-400';
      case 'voting_active': return 'text-emerald-400';
      case 'registration_open': return 'text-cyan-400';
      case 'voting_ended': return 'text-purple-400';
      default: return 'text-amber-400';
    }
  };

  const getStatusBadgeColor = (status?: string) => {
    switch (status) {
      case 'results_announced': return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
      case 'voting_active': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      case 'registration_open': return 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      case 'voting_ended': return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      default: return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin"></div>
            <span className="text-slate-300 text-lg font-medium">Loading analytics...</span>
          </div>
        </div>
      </div>
    );
  }
  
  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="backdrop-blur-sm bg-red-900/40 border border-red-700/50 rounded-3xl p-8 shadow-xl text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-500/25">
            <span className="text-white text-2xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold text-red-300 mb-2">Failed to Load Analytics</h3>
          <p className="text-red-400">Unable to retrieve your voting analytics. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <style dangerouslySetInnerHTML={{ __html: customScrollbarStyle }} />
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-cyan-500/25">
            <span className="text-white text-3xl">📊</span>
          </div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Voting Analytics
            </span>
          </h1>
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Track your democratic participation and voting patterns
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:border-cyan-500/50 hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <span className="text-white text-2xl">📋</span>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {analytics.totalElectionsRegistered}
                </div>
                <div className="text-slate-400 font-medium">Elections Registered</div>
              </div>
            </div>
          </div>
          
          <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <span className="text-white text-2xl">✅</span>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  {analytics.totalVotesCast}
                </div>
                <div className="text-slate-400 font-medium">Votes Cast</div>
              </div>
            </div>
          </div>
          
          <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:border-purple-500/50 hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white text-2xl">📈</span>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  {analytics.participationRate.toFixed(1)}%
                </div>
                <div className="text-slate-400 font-medium">Participation Rate</div>
              </div>
            </div>
          </div>
          
          <div className="group backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:border-orange-500/50 hover:bg-slate-800/60 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                <span className="text-white text-2xl">🗂️</span>
              </div>
              <div>
                <div className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
                  {Object.keys(analytics.electionTypes).length}
                </div>
                <div className="text-slate-400 font-medium">Election Types</div>
              </div>
            </div>
          </div>
        </div>

        {/* Participation Rate Visual */}
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <span className="text-white text-2xl">📊</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  Voting Participation
                </span>
              </h3>
              <p className="text-slate-400">Your democratic engagement overview</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex justify-between text-lg font-medium">
              <span className="text-emerald-400">Voted: {analytics.totalVotesCast}</span>
              <span className="text-cyan-400">Registered: {analytics.totalElectionsRegistered}</span>
            </div>
            <div className="relative">
              <div className="w-full bg-slate-700/50 rounded-full h-6 border border-slate-600/50">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-6 rounded-full transition-all duration-1000 shadow-lg shadow-cyan-500/25 relative overflow-hidden"
                  style={{ width: `${analytics.participationRate}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                {analytics.participationRate.toFixed(1)}%
              </div>
              <p className="text-slate-400">
                You have voted in {analytics.participationRate.toFixed(1)}% of elections you registered for
              </p>
            </div>
          </div>
        </div>

        {/* Election Types Distribution */}
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-white text-2xl">🗂️</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Election Types
                </span>
              </h3>
              <p className="text-slate-400">Distribution of elections you've participated in</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(analytics.electionTypes).map(([type, count], index) => {
              const gradients = [
                'from-red-500 to-pink-500',
                'from-blue-500 to-cyan-500',
                'from-emerald-500 to-green-500',
                'from-purple-500 to-indigo-500',
                'from-orange-500 to-amber-500',
                'from-teal-500 to-cyan-500'
              ];
              const gradient = gradients[index % gradients.length];
              
              return (
                <div key={type} className="group backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 text-center hover:border-purple-500/50 hover:bg-slate-700/50 transition-all duration-300">
                  <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <span className="text-white text-xl font-bold">{count as number}</span>
                  </div>
                  <div className="text-lg font-bold text-white mb-1">{count as number}</div>
                  <div className="text-slate-400 text-sm capitalize font-medium">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <span className="text-white text-2xl">⚡</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent">
                  Recent Activity
                </span>
              </h3>
              <p className="text-slate-400">Your latest voting engagements</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {analytics.recentActivity.map((election, index) => (
              <div key={election.electionId._id} className="group backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 hover:border-emerald-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                        <span className="text-white text-xl">{election.hasVoted ? '✅' : '📋'}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-xl text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-400 group-hover:to-green-400 group-hover:bg-clip-text transition-all duration-300 mb-2">
                          {election.electionId.title || 'Untitled Election'}
                        </h4>
                        <p className="text-slate-400 capitalize font-medium mb-3">
                          {election.electionId.electionType || 'Unknown'} • 
                          <span className={`ml-2 ${getStatusColor(election.electionId.status)}`}>
                            {(election.electionId.status || 'unknown').replace('_', ' ')}
                          </span>
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                            <span>Total Votes: {election.electionId.totalVotesCast || 0}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                            <span>Registered Voters: {election.electionId.totalRegisteredVoters || 0}</span>
                          </span>
                          {election.participationRate && (
                            <span className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                              <span>Turnout: {election.participationRate.toFixed(1)}%</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold mb-3 ${
                      election.hasVoted 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {election.hasVoted ? '✅ Voted' : '📋 Registered'}
                    </div>
                    {election.votedAt && (
                      <div className="text-sm text-slate-400 mb-3">
                        {new Date(election.votedAt).toLocaleDateString()}
                      </div>
                    )}
                    <button
                      onClick={() => setSelectedElection(election)}
                      className="group/btn relative px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25 font-medium"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 rounded-xl opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative">View Details</span>
                    </button>
                  </div>
                </div>

                {/* Participation bar for this election */}
                {election.participationRate && (
                  <div className="mt-6 pt-4 border-t border-slate-600/50">
                    <div className="flex justify-between text-sm text-slate-400 mb-2">
                      <span className="font-medium">Election Turnout</span>
                      <span className="font-bold">{election.participationRate.toFixed(1)}%</span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-slate-600/50 rounded-full h-3 border border-slate-600/50">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/25 relative overflow-hidden"
                          style={{ width: `${election.participationRate}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Full Voting History */}
        <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white text-2xl">📜</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold">
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Complete Voting History
                </span>
              </h3>
              <p className="text-slate-400">All your electoral participation records</p>
            </div>
          </div>
          
          <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {analytics.votingHistory.map((election, index) => (
              <div key={election.electionId._id} className="group backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-xl p-4 hover:border-indigo-500/50 hover:bg-slate-700/50 transition-all duration-300">
                <div className="flex justify-between items-center">
                  <div className="flex-1 flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <span className="text-white text-sm font-bold">#{analytics.votingHistory.length - index}</span>
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-indigo-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                        {election.electionId.title || 'Untitled Election'}
                      </div>
                      <div className="text-sm text-slate-400 flex items-center space-x-2">
                        <span className="capitalize">{election.electionId.electionType || 'Unknown'}</span>
                        <span>•</span>
                        <code className="text-xs bg-slate-600/50 px-2 py-1 rounded">
                          {(election.electionId.contractAddress || '').slice(0, 10)}...
                        </code>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-bold rounded-xl mb-2 ${getStatusBadgeColor(election.electionId.status)}`}>
                      {(election.electionId.status || 'unknown').replace('_', ' ')}
                    </span>
                    <div className={`text-sm font-bold ${
                      election.hasVoted ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {election.hasVoted ? '✅ Voted' : '📋 Registered Only'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* No data message */}
        {analytics.totalElectionsRegistered === 0 && (
          <div className="backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-12 shadow-xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-slate-600 to-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-4xl">📊</span>
            </div>
            <h3 className="text-2xl font-bold text-slate-300 mb-4">No Voting Data</h3>
            <p className="text-slate-400 max-w-lg mx-auto leading-relaxed mb-8">
              You haven't registered for any elections yet. Start participating to see your voting analytics and track your democratic engagement.
            </p>
            <button className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-semibold">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Get Started with Voting</span>
              </span>
            </button>
          </div>
        )}

        {/* Election Details Modal */}
        {selectedElection && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="backdrop-blur-sm bg-slate-800/90 border border-slate-700/50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                      <span className="text-white text-2xl">📋</span>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                          Election Details
                        </span>
                      </h2>
                      <p className="text-slate-400">Comprehensive election information</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedElection(null)}
                    className="group w-12 h-12 bg-slate-700/50 border border-slate-600/50 rounded-xl flex items-center justify-center hover:border-red-500/50 hover:bg-red-500/20 transition-all duration-300"
                  >
                    <span className="text-slate-400 group-hover:text-red-400 text-xl">✕</span>
                  </button>
                </div>

                <div className="space-y-8">
                  <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
                    <h3 className="font-bold text-2xl text-white mb-2">
                      {selectedElection.electionId.title || 'Untitled Election'}
                    </h3>
                    <p className="text-slate-400 capitalize mb-4 text-lg">
                      {selectedElection.electionId.electionType || 'Unknown'} Election • 
                      <span className="ml-2 font-medium">
                        {(selectedElection.electionId.status || 'unknown').replace('_', ' ')}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="backdrop-blur-sm bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700/50 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/25">
                        <span className="text-white text-xl">🗳️</span>
                      </div>
                      <div className="text-3xl font-bold text-blue-300 mb-2">
                        {selectedElection.electionId.totalVotesCast || 0}
                      </div>
                      <div className="text-blue-400 font-medium">Total Votes Cast</div>
                    </div>
                    
                    <div className="backdrop-blur-sm bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-700/50 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/25">
                        <span className="text-white text-xl">👥</span>
                      </div>
                      <div className="text-3xl font-bold text-purple-300 mb-2">
                        {selectedElection.electionId.totalRegisteredVoters || 0}
                      </div>
                      <div className="text-purple-400 font-medium">Registered Voters</div>
                    </div>
                    
                    <div className="backdrop-blur-sm bg-gradient-to-br from-emerald-900/40 to-emerald-800/40 border border-emerald-700/50 rounded-2xl p-6 text-center">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                        <span className="text-white text-xl">📈</span>
                      </div>
                      <div className="text-3xl font-bold text-emerald-300 mb-2">
                        {selectedElection.participationRate?.toFixed(1) || 0}%
                      </div>
                      <div className="text-emerald-400 font-medium">Turnout Rate</div>
                    </div>
                    
                    <div className={`backdrop-blur-sm border rounded-2xl p-6 text-center ${
                      selectedElection.hasVoted 
                        ? 'bg-gradient-to-br from-emerald-900/40 to-green-800/40 border-emerald-700/50' 
                        : 'bg-gradient-to-br from-amber-900/40 to-orange-800/40 border-amber-700/50'
                    }`}>
                      <div className={`w-12 h-12 bg-gradient-to-br rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
                        selectedElection.hasVoted 
                          ? 'from-emerald-500 to-green-500 shadow-emerald-500/25' 
                          : 'from-amber-500 to-orange-500 shadow-amber-500/25'
                      }`}>
                        <span className="text-white text-xl">{selectedElection.hasVoted ? '✅' : '❌'}</span>
                      </div>
                      <div className={`text-3xl font-bold mb-2 ${
                        selectedElection.hasVoted ? 'text-emerald-300' : 'text-amber-300'
                      }`}>
                        {selectedElection.hasVoted ? 'Yes' : 'No'}
                      </div>
                      <div className={`font-medium ${
                        selectedElection.hasVoted ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        Your Vote
                      </div>
                    </div>
                  </div>

                  <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
                    <h4 className="font-bold text-xl text-white mb-4 flex items-center space-x-2">
                      <span className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">📄</span>
                      </span>
                      <span>Contract Address</span>
                    </h4>
                    <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                      <code className="text-sm text-slate-300 font-mono break-all">
                        {selectedElection.electionId.contractAddress || 'N/A'}
                      </code>
                    </div>
                  </div>

                  {selectedElection.votedAt && (
                    <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
                      <h4 className="font-bold text-xl text-white mb-4 flex items-center space-x-2">
                        <span className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg flex items-center justify-center">
                          <span className="text-white text-sm">🕒</span>
                        </span>
                        <span>Voting Details</span>
                      </h4>
                      <div className="bg-slate-800/50 border border-slate-600/50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-medium">Voted On:</span>
                          <span className="text-emerald-400 font-bold">
                            {new Date(selectedElection.votedAt).toLocaleString()}
                          </span>
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
    </div>
  );
};
