import { Outlet, Link, NavLink } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export const DashboardLayout = () => {
  const { user, logout } = useAuthStore();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-slate-900/80 backdrop-blur px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold">Co Voting</Link>
        <nav className="flex gap-4 text-sm">
          <NavLink to="/elections" className={({isActive})=>isActive? 'text-primary':'text-slate-300 hover:text-white'}>Elections</NavLink>
          {user?.role?.includes('admin') && (
            <NavLink to="/elections/create" className={({isActive})=>isActive? 'text-primary':'text-slate-300 hover:text-white'}>Create Election</NavLink>
          )}
          {(user?.role === 'election_admin' || user?.role === 'super_admin') && (
            <NavLink to="/admin/dashboard" className={({isActive})=>isActive? 'text-primary':'text-slate-300 hover:text-white'}>Dashboard</NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {!user && (
            <div className="flex gap-2">
              <Link to="/admin/login" className="text-xs px-3 py-1.5 rounded bg-primary/20 hover:bg-primary/30">Admin</Link>
              <Link to="/voter/login" className="text-xs px-3 py-1.5 rounded bg-primary/20 hover:bg-primary/30">Voter</Link>
              <Link to="/candidate/login" className="text-xs px-3 py-1.5 rounded bg-primary/20 hover:bg-primary/30">Candidate</Link>
            </div>
          )}
          {user && (
            <>
              <span className="text-xs text-slate-300">{user.name || user.email}</span>
              <button onClick={logout} className="text-xs px-3 py-1.5 rounded bg-red-600/80 hover:bg-red-600">Logout</button>
            </>
          )}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="text-center text-xs py-6 text-slate-500">&copy; {new Date().getFullYear()} Co Voting System</footer>
    </div>
  );
};
