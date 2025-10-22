import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

export const CandidateLoginPage = () => {
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const login = async () => {
    setLoading(true);
    try {
      if (!(window as any).ethereum) throw new Error('MetaMask not found');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      setWalletAddress(address);
      const message = `Login as candidate at ${new Date().toISOString()}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const { data } = await api.post('/candidate/login', { walletAddress: address, message, signature });
      if (data.success) {
        setUser({ role: 'candidate', token: data.data.token, walletAddress: data.data.candidate.walletAddress, name: data.data.candidate.name });
        toast.success('Logged in');
        navigate('/candidate/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-orange-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Main Login Card */}
        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-orange-500/25">
              <span className="text-white text-3xl">🏛️</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">
                Candidate Portal
              </span>
            </h1>
            <p className="text-slate-400 text-sm">
              Connect your wallet to access your campaign dashboard
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-6">
            <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🦊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">MetaMask Required</h3>
                  <p className="text-sm text-slate-400">Secure blockchain authentication</p>
                </div>
              </div>

              <button
                onClick={login}
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-orange-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Connecting Wallet...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <span>🔐</span>
                      <span>Connect Wallet & Sign</span>
                    </div>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Wallet Address Display */}
            {walletAddress && (
              <div className="backdrop-blur-sm bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 animate-fade-in">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-emerald-300">Wallet Connected</p>
                    <p className="text-xs text-emerald-400/80 font-mono break-all">
                      {walletAddress}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Info */}
            <div className="backdrop-blur-sm bg-slate-600/20 border border-slate-500/30 rounded-2xl p-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mt-0.5">
                  <span className="text-white text-sm">🔒</span>
                </div>
                <div>
                  <h4 className="font-medium text-slate-300 text-sm mb-1">Secure Authentication</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your wallet signature proves identity without revealing private keys. 
                    Only registered candidates can access campaign features.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Need to register as a candidate?{' '}
              <Link 
                to="/candidate/register" 
                className="text-transparent bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text hover:from-pink-400 hover:to-orange-400 transition-all duration-300 font-semibold"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-lg">📊</span>
            </div>
            <p className="text-xs text-slate-400">Campaign Analytics</p>
          </div>
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-lg">🗳️</span>
            </div>
            <p className="text-xs text-slate-400">Election Management</p>
          </div>
          <div className="backdrop-blur-sm bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 text-center">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-lg">🎯</span>
            </div>
            <p className="text-xs text-slate-400">Voter Outreach</p>
          </div>
        </div>
      </div>
    </div>
  );
};
