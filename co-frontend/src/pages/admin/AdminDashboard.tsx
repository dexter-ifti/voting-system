import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface DashboardData {
  stats: {
    totalElections: number;
    activeElections: number;
    totalVoters: number;
    totalCandidates: number;
  };
  recentElections: any[];
}

export const AdminDashboard = () => {
  const user = useAuthStore(s => s.user);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/dashboard');
      if (data.success) setData(data.data);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-400 text-lg">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-2xl shadow-red-500/25">
            <span className="text-white text-3xl">⚠️</span>
          </div>
          <p className="text-red-400 text-xl mb-4">Failed to load dashboard data</p>
          <button
            onClick={load}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-purple-500/25"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-blue-950 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-cyan-500/15 to-emerald-500/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      <div className="relative z-10 max-w-7xl mx-auto py-10 px-6 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25">
            <span className="text-white text-3xl">👑</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-slate-400 text-lg">
            Welcome back, {user?.name}! Monitor and manage your voting system
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {/* Total Elections Card */}
          <div className="group relative backdrop-blur-sm bg-gradient-to-br from-purple-800/30 to-blue-800/30 border border-purple-500/30 rounded-3xl p-6 shadow-xl shadow-purple-500/10 hover:shadow-purple-500/25 hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                  <span className="text-white text-2xl">🗳️</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-300 font-medium mb-1">Total Elections</p>
                  <p className="text-3xl font-bold text-white">{data.stats.totalElections}</p>
                </div>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
            </div>
          </div>

          {/* Active Elections Card */}
          <div className="group relative backdrop-blur-sm bg-gradient-to-br from-emerald-800/30 to-cyan-800/30 border border-emerald-500/30 rounded-3xl p-6 shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <span className="text-white text-2xl">⚡</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-emerald-300 font-medium mb-1">Active Elections</p>
                  <p className="text-3xl font-bold text-white">{data.stats.activeElections}</p>
                </div>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"></div>
            </div>
          </div>

          {/* Verified Voters Card */}
          <div className="group relative backdrop-blur-sm bg-gradient-to-br from-blue-800/30 to-cyan-800/30 border border-blue-500/30 rounded-3xl p-6 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-cyan-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <span className="text-white text-2xl">👥</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-blue-300 font-medium mb-1">Verified Voters</p>
                  <p className="text-3xl font-bold text-white">{data.stats.totalVoters}</p>
                </div>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            </div>
          </div>

          {/* Verified Candidates Card */}
          <div className="group relative backdrop-blur-sm bg-gradient-to-br from-pink-800/30 to-purple-800/30 border border-pink-500/30 rounded-3xl p-6 shadow-xl shadow-pink-500/10 hover:shadow-pink-500/25 hover:scale-105 transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-purple-600/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25">
                  <span className="text-white text-2xl">🏆</span>
                </div>
                <div className="text-right">
                  <p className="text-sm text-pink-300 font-medium mb-1">Verified Candidates</p>
                  <p className="text-3xl font-bold text-white">{data.stats.totalCandidates}</p>
                </div>
              </div>
              <div className="h-1.5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Recent Elections Section */}
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-slate-200 to-slate-400 bg-clip-text text-transparent">
                Recent Elections
              </span>
            </h2>
            <p className="text-slate-400 text-lg">Keep track of the latest electoral activities</p>
          </div>

          {data.recentElections.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.recentElections.map((el, index) => (
                <div
                  key={el.contractAddress}
                  className="group relative backdrop-blur-sm bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 hover:border-slate-600/50"
                >
                  {/* Corner decoration */}
                  <div className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-slate-300 text-xl">📊</span>
                      </div>
                      <span className="text-xs text-slate-500 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600/50">
                        #{index + 1}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-lg mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-blue-400 group-hover:bg-clip-text transition-all duration-300">
                      {el.title}
                    </h3>

                    <p className="text-sm text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                      {el.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-400 font-medium">
                          {el.candidates.length} candidates
                        </span>
                      </div>
                      <button className="text-sm bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-purple-300 px-4 py-2 rounded-xl border border-purple-500/30 hover:border-purple-400/50 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-blue-600/30 hover:scale-105 transition-all duration-300 font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <span className="text-slate-400 text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-300 mb-3">No Recent Elections</h3>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Elections will appear here once they are created and managed through the system
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
