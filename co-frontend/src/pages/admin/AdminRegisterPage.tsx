import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export const AdminRegisterPage = () => {
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', walletAddress:'', password: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/register', form);
      if (data.success) {
        setUser({ role: data.data.admin.role, token: data.data.token, email: data.data.admin.email, name: data.data.admin.name });
        toast.success('Registered');
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-10 right-20 w-80 h-80 bg-gradient-to-br from-emerald-600/30 to-cyan-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 left-20 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Join as Admin
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Request administrative access to the system
            </p>
          </div>

          {/* Registration Card */}
          <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-500">
            <form onSubmit={submit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Full Name
                </label>
                <input 
                  value={form.name} 
                  onChange={e=>setForm(f=>({...f,name:e.target.value}))} 
                  required 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                  placeholder="John Smith"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={e=>setForm(f=>({...f,email:e.target.value}))} 
                  required 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                  placeholder="admin@company.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Wallet Address
                </label>
                <input 
                  value={form.walletAddress} 
                  onChange={e=>setForm(f=>({...f,walletAddress:e.target.value}))} 
                  required 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50 font-mono text-sm"
                  placeholder="0x1234...5678"
                />
                <p className="text-xs text-slate-500">
                  Your blockchain wallet address for admin verification
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input 
                  type="password" 
                  value={form.password} 
                  onChange={e=>setForm(f=>({...f,password:e.target.value}))} 
                  required 
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                  placeholder="••••••••"
                />
              </div>

              <button 
                disabled={loading} 
                className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    'Request Admin Access'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <p className="text-center text-slate-400">
                Already have admin access?{' '}
                <Link 
                  to="/admin/login" 
                  className="text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text hover:from-cyan-400 hover:to-blue-400 transition-all duration-300 font-medium"
                >
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>

          {/* Admin Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-slate-500 bg-slate-800/30 px-4 py-2 rounded-lg border border-slate-700/30">
              <span>⚡</span>
              <span>Admin requests require approval from existing administrators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
