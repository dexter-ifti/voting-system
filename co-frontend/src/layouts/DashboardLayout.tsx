import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/3 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/70 backdrop-blur-xl px-6 py-4 flex items-center justify-between shadow-lg">
        {/* Logo */}
        <Link 
          to="/" 
          className="group flex items-center space-x-3 font-bold text-xl bg-gradient-to-r from-purple-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent hover:scale-105 transition-all duration-300"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span>Co Voting</span>
        </Link>

        {/* Navigation */}
        <nav className="flex gap-2">
          <NavLink 
            to="/elections" 
            className={({isActive}) => `group relative px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
              isActive 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-600/20 text-white border border-purple-400/30 shadow-lg shadow-purple-500/25' 
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50 backdrop-blur-sm border border-transparent hover:border-white/10 hover:scale-105'
            }`}
          >
            <span className="relative flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>Elections</span>
            </span>
          </NavLink>
          
          {user?.role?.includes('admin') && (
            <NavLink 
              to="/elections/create" 
              className={({isActive}) => `group relative px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-600/20 text-white border border-purple-400/30 shadow-lg shadow-purple-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50 backdrop-blur-sm border border-transparent hover:border-white/10 hover:scale-105'
              }`}
            >
              <span className="relative flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Create Election</span>
              </span>
            </NavLink>
          )}
          
          {(user?.role === 'election_admin' || user?.role === 'super_admin') && (
            <NavLink 
              to="/admin/dashboard" 
              className={({isActive}) => `group relative px-4 py-2 rounded-xl transition-all duration-300 font-medium ${
                isActive 
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-600/20 text-white border border-purple-400/30 shadow-lg shadow-purple-500/25' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50 backdrop-blur-sm border border-transparent hover:border-white/10 hover:scale-105'
              }`}
            >
              <span className="relative flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Dashboard</span>
              </span>
            </NavLink>
          )}
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {!user && (
            <div className="flex gap-2">
              <Link 
                to="/admin/login" 
                className="group relative px-4 py-2 bg-gradient-to-r from-purple-500/20 to-indigo-600/20 text-purple-300 rounded-xl hover:scale-105 transition-all duration-300 border border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/25 text-sm font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-indigo-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Admin</span>
                </span>
              </Link>
              <Link 
                to="/voter/login" 
                className="group relative px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 text-blue-300 rounded-xl hover:scale-105 transition-all duration-300 border border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/25 text-sm font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Voter</span>
                </span>
              </Link>
              <Link 
                to="/candidate/login" 
                className="group relative px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-600/20 text-emerald-300 rounded-xl hover:scale-105 transition-all duration-300 border border-emerald-400/30 hover:shadow-lg hover:shadow-emerald-500/25 text-sm font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Candidate</span>
                </span>
              </Link>
            </div>
          )}
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">{user.name || user.email}</div>
                  <div className="text-xs text-slate-400 capitalize">{user.role?.replace('_', ' ')}</div>
                </div>
              </div>
              <button 
                onClick={logout} 
                className="group relative px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-600/20 text-red-300 rounded-xl hover:scale-105 transition-all duration-300 border border-red-400/30 hover:shadow-lg hover:shadow-red-500/25 text-sm font-medium"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-600/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-8 border-t border-white/10 bg-slate-900/50 backdrop-blur-xl">
        <div className="flex items-center justify-center space-x-2 text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm font-medium">
            &copy; {new Date().getFullYear()} Co Voting System - Secure Democracy
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          Powered by blockchain technology for transparent and secure voting
        </div>
      </footer>
    </div>
  );
};
