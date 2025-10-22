import { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const CandidateRegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name:'', party:'', manifesto:'', age: 30, gender:'NotSpecified', walletAddress:'', email:'', phone:'' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/candidate/register', form);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-orange-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-20 left-20 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/25">
            <span className="text-white text-4xl">🏛️</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
              Candidate Registration
            </span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Join the democratic process as a verified candidate. Complete your registration to participate in elections.
          </p>
        </div>

        {/* Main Registration Form */}
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={submit} className="space-y-8">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">👤</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Personal Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Full Name
                  </label>
                  <input 
                    type="text"
                    value={form.name} 
                    onChange={e=>setForm(f=>({...f,name:e.target.value}))} 
                    required 
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Political Party
                  </label>
                  <input 
                    type="text"
                    value={form.party} 
                    onChange={e=>setForm(f=>({...f,party:e.target.value}))} 
                    required 
                    placeholder="Enter your political party"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Age
                  </label>
                  <input 
                    type="number" 
                    min="18"
                    max="100"
                    value={form.age} 
                    onChange={e=>setForm(f=>({...f,age:parseInt(e.target.value)||30}))} 
                    required 
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Gender
                  </label>
                  <select 
                    value={form.gender} 
                    onChange={e=>setForm(f=>({...f,gender:e.target.value}))} 
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300"
                  >
                    <option value="NotSpecified">Prefer not to specify</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Election Manifesto
                </label>
                <textarea 
                  value={form.manifesto} 
                  onChange={e=>setForm(f=>({...f,manifesto:e.target.value}))} 
                  required 
                  rows={4}
                  placeholder="Describe your vision, goals, and promises to voters..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 resize-none"
                />
              </div>
            </div>

            {/* Blockchain Identity Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🔗</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Blockchain Identity</h3>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-slate-300">
                  Wallet Address
                </label>
                <input 
                  type="text"
                  value={form.walletAddress} 
                  onChange={e=>setForm(f=>({...f,walletAddress:e.target.value}))} 
                  required 
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all duration-300 font-mono text-sm"
                />
                <p className="text-xs text-slate-500">
                  Your Ethereum wallet address for blockchain verification and voting transactions
                </p>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📞</span>
                </div>
                <h3 className="text-xl font-semibold text-white">Contact Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e=>setForm(f=>({...f,email:e.target.value}))} 
                    required 
                    placeholder="candidate@example.com"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300"
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-300">
                    Phone Number
                  </label>
                  <input 
                    type="tel"
                    value={form.phone} 
                    onChange={e=>setForm(f=>({...f,phone:e.target.value}))} 
                    required 
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white placeholder-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Verification Notice */}
            <div className="backdrop-blur-sm bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">⚠️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-300 mb-2">Verification Process</h4>
                  <p className="text-sm text-amber-200/80 leading-relaxed">
                    After registration, your application will be reviewed by election administrators. 
                    You will receive email confirmation once your candidacy is approved. This process 
                    typically takes 24-48 hours.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden bg-gradient-to-r from-purple-600 to-orange-600 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
            >
              <span className="relative z-10">
                {loading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Submitting Registration...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-3">
                    <span>🏛️</span>
                    <span>Register as Candidate</span>
                  </div>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link 
                to="/candidate/login" 
                className="text-transparent bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text hover:from-orange-400 hover:to-purple-400 transition-all duration-300 font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
