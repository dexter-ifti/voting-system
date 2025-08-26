import { Link } from 'react-router-dom';

export const LandingPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold mb-4">Blockchain Voting System</h1>
      <p className="text-slate-300 mb-8 max-w-2xl">Secure, transparent and verifiable elections powered by smart contracts. Register as a voter or candidate, participate in elections, and view real-time results.</p>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="p-5 rounded-lg bg-card border border-border">
          <h2 className="font-semibold mb-2">Admins</h2>
          <p className="text-xs text-slate-400 mb-3">Create and manage elections, verify participants.</p>
          <div className="flex gap-2 flex-wrap text-xs">
            <Link to="/admin/login" className="px-3 py-1.5 rounded bg-primary/80 hover:bg-primary">Login</Link>
            <Link to="/admin/register" className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600">Register</Link>
          </div>
        </div>
        <div className="p-5 rounded-lg bg-card border border-border">
          <h2 className="font-semibold mb-2">Voters</h2>
            <p className="text-xs text-slate-400 mb-3">Register to vote and cast your ballot securely.</p>
            <div className="flex gap-2 flex-wrap text-xs">
              <Link to="/voter/login" className="px-3 py-1.5 rounded bg-primary/80 hover:bg-primary">Login</Link>
              <Link to="/voter/register" className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600">Register</Link>
            </div>
        </div>
        <div className="p-5 rounded-lg bg-card border border-border">
          <h2 className="font-semibold mb-2">Candidates</h2>
            <p className="text-xs text-slate-400 mb-3">Stand for election and present your manifesto.</p>
            <div className="flex gap-2 flex-wrap text-xs">
              <Link to="/candidate/login" className="px-3 py-1.5 rounded bg-primary/80 hover:bg-primary">Login</Link>
              <Link to="/candidate/register" className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600">Register</Link>
            </div>
        </div>
      </div>
      <div className="mt-12">
        <Link to="/elections" className="inline-flex items-center text-sm font-medium text-primary hover:underline">Browse Elections →</Link>
      </div>
    </div>
  );
};
