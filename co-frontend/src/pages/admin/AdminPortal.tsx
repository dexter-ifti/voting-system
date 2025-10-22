import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { AdminDashboard } from './AdminDashboard';
import { VoterManagement } from './VoterManagement';
import { CandidateManagement } from './CandidateManagement';
import { ElectionManagement } from './ElectionManagement';
import { SystemStatus } from './SystemStatus';
import { api } from '../../lib/api';

interface DashboardData {
  stats: {
    totalElections: number;
    activeElections: number;
    totalVoters: number;
    totalCandidates: number;
  };
  recentElections: any[];
}

export const AdminPortal = () => {
  const user = useAuthStore(s => s.user);
  const [currentView, setCurrentView] = useState<'dashboard' | 'voters' | 'candidates' | 'elections' | 'system'>('dashboard');
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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'voters':
        return <VoterManagement />;
      case 'candidates':
        return <CandidateManagement />;
      case 'elections':
        return <ElectionManagement />;
      case 'system':
        return <SystemStatus />;
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto py-12 px-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 text-lg mt-2">Manage your voting system with ease</p>
          </div>
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 px-6 py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-white font-medium">Welcome back!</p>
                <p className="text-slate-400 text-sm">{user?.name || user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <button
            onClick={() => setCurrentView('voters')}
            className="group bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 16a2 2 0 100-4 2 2 0 000 4zM7 16a4 4 0 118 0v1H7v-1z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-purple-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Voters</p>
            <p className="text-3xl font-bold text-white mb-2">{data?.stats.totalVoters?.toLocaleString() || 0}</p>
            <p className="text-purple-400 text-sm font-medium">Manage Voters →</p>
          </button>

          <button
            onClick={() => setCurrentView('candidates')}
            className="group bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Candidates</p>
            <p className="text-3xl font-bold text-white mb-2">{data?.stats.totalCandidates?.toLocaleString() || 0}</p>
            <p className="text-blue-400 text-sm font-medium">Manage Candidates →</p>
          </button>

          <button
            onClick={() => setCurrentView('elections')}
            className="group bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 text-left"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Elections</p>
            <p className="text-3xl font-bold text-white mb-2">{data?.stats.totalElections?.toLocaleString() || 0}</p>
            <p className="text-indigo-400 text-sm font-medium">Manage Elections →</p>
          </button>

          <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl flex items-center justify-center animate-pulse">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-xs font-medium">LIVE</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Active Elections</p>
            <p className="text-3xl font-bold text-white mb-2">{data?.stats.activeElections?.toLocaleString() || 0}</p>
            <p className="text-green-400 text-sm font-medium">Currently Running</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            Quick Actions
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <button
              onClick={() => setCurrentView('elections')}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 text-left"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xl font-bold text-white mb-2">Create Election</div>
              <div className="text-slate-400 leading-relaxed">Start a new voting process and configure election parameters</div>
              <div className="flex items-center mt-4 text-purple-400 group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm font-medium">Get Started</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('voters')}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 text-left"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xl font-bold text-white mb-2">Verify Voters</div>
              <div className="text-slate-400 leading-relaxed">Review pending voter applications and approve registrations</div>
              <div className="flex items-center mt-4 text-blue-400 group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm font-medium">Review Applications</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => setCurrentView('candidates')}
              className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/25 text-left"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-xl font-bold text-white mb-2">Verify Candidates</div>
              <div className="text-slate-400 leading-relaxed">Review pending candidate applications and validate credentials</div>
              <div className="flex items-center mt-4 text-indigo-400 group-hover:translate-x-2 transition-transform duration-300">
                <span className="text-sm font-medium">Review Candidates</span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Elections */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Recent Elections
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.recentElections && data.recentElections.length > 0 ? (
              data.recentElections.map((el, index) => (
                <div 
                  key={el.contractAddress} 
                  className="group bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{index + 1}</span>
                    </div>
                    <div className="bg-slate-700/50 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-slate-300 text-xs font-medium">{el.candidates?.length || 0} candidates</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{el.title}</h3>
                  <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed mb-4">{el.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-xs text-slate-500">
                      Contract: {el.contractAddress?.slice(0, 8)}...
                    </div>
                    <button
                      onClick={() => setCurrentView('elections')}
                      className="flex items-center space-x-1 text-purple-400 hover:text-purple-300 transition-colors duration-200"
                    >
                      <span className="text-sm font-medium">Manage</span>
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-20 h-20 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-slate-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-slate-400 text-lg font-medium">No elections yet</p>
                <p className="text-slate-500 text-sm mt-2">Create your first election to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-padding mx-auto"></div>
          <div className="absolute inset-0 animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-border opacity-20"></div>
        </div>
        <p className="text-slate-300 font-medium mt-4 animate-pulse">Loading admin portal...</p>
      </div>
    </div>
  );
  
  if (!data && currentView === 'dashboard') return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <p className="text-red-400 font-medium">Failed to load admin data</p>
        <button 
          onClick={load}
          className="mt-4 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 font-medium"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navigation Bar */}
      <div className="relative z-10 bg-slate-900/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`group py-6 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                currentView === 'dashboard'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                <span>Dashboard</span>
              </div>
              {currentView === 'dashboard' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setCurrentView('voters')}
              className={`group py-6 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                currentView === 'voters'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM9 16a2 2 0 100-4 2 2 0 000 4zM7 16a4 4 0 118 0v1H7v-1z" />
                </svg>
                <span>Voters</span>
                <span className="bg-slate-700/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-slate-300">
                  {data?.stats.totalVoters || 0}
                </span>
              </div>
              {currentView === 'voters' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setCurrentView('candidates')}
              className={`group py-6 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                currentView === 'candidates'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Candidates</span>
                <span className="bg-slate-700/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-slate-300">
                  {data?.stats.totalCandidates || 0}
                </span>
              </div>
              {currentView === 'candidates' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setCurrentView('elections')}
              className={`group py-6 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                currentView === 'elections'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Elections</span>
                <span className="bg-slate-700/50 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-slate-300">
                  {data?.stats.totalElections || 0}
                </span>
              </div>
              {currentView === 'elections' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              )}
            </button>

            <button
              onClick={() => setCurrentView('system')}
              className={`group py-6 text-sm font-medium border-b-2 transition-all duration-300 relative ${
                currentView === 'system'
                  ? 'border-purple-400 text-purple-400'
                  : 'border-transparent text-slate-400 hover:text-white hover:border-purple-400/50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>System</span>
              </div>
              {currentView === 'system' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></div>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {renderCurrentView()}
      </div>
    </div>
  );
};
