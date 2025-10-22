import { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const VoterRegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', age: 18, gender:'NotSpecified', walletAddress:'', email:'', phone:'' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/voter/register', form);
      if (data.success) {
        toast.success('Registered, pending verification');
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
      <div className="absolute top-20 right-24 w-80 h-80 bg-gradient-to-br from-cyan-600/30 to-emerald-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-24 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">📝</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent">
                Become a Voter
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Register to participate in secure blockchain elections
            </p>
          </div>

          {/* Registration Card */}
          <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500">
            <form onSubmit={submit} className="space-y-6">
              
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center text-xs">1</span>
                  <span>Personal Information</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input 
                      value={form.name} 
                      onChange={e=>setForm(f=>({...f,name:e.target.value}))} 
                      required 
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                      placeholder="John Smith"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Age
                      </label>
                      <input 
                        type="number" 
                        value={form.age} 
                        onChange={e=>setForm(f=>({...f,age:parseInt(e.target.value)||18}))} 
                        required 
                        min="18"
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Gender
                      </label>
                      <select 
                        value={form.gender} 
                        onChange={e=>setForm(f=>({...f,gender:e.target.value}))} 
                        className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                      >
                        <option value="NotSpecified">Not Specified</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Blockchain Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-xs">2</span>
                  <span>Blockchain Identity</span>
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Wallet Address
                  </label>
                  <input 
                    value={form.walletAddress} 
                    onChange={e=>setForm(f=>({...f,walletAddress:e.target.value}))} 
                    required 
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50 font-mono text-sm"
                    placeholder="0x1234...5678"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Your Ethereum wallet address for blockchain voting
                  </p>
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs">3</span>
                  <span>Contact Details (Optional)</span>
                </h3>
                
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      value={form.email} 
                      onChange={e=>setForm(f=>({...f,email:e.target.value}))} 
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                      placeholder="voter@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Phone Number
                    </label>
                    <input 
                      value={form.phone} 
                      onChange={e=>setForm(f=>({...f,phone:e.target.value}))} 
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>

              <button 
                disabled={loading} 
                className="w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting registration...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-xl">✅</span>
                      <span>Submit Registration</span>
                    </div>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-center text-slate-400">
                Already registered?{' '}
                <Link 
                  to="/voter/login" 
                  className="text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 font-medium"
                >
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>

          {/* Verification Notice */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-slate-500 bg-slate-800/30 px-4 py-2 rounded-lg border border-slate-700/30">
              <span>⏳</span>
              <span>Registration requires admin verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
