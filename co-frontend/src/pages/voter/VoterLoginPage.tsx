import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

export const VoterLoginPage = () => {
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
      const message = `Login as voter at ${new Date().toISOString()}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const { data } = await api.post('/voter/login', { walletAddress: address, message, signature });
      if (data.success) {
        setUser({ role: 'voter', token: data.data.token, walletAddress: data.data.voter.walletAddress, name: data.data.voter.name });
        toast.success('Logged in');
        navigate('/voter/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-32 left-16 w-80 h-80 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-16 right-16 w-96 h-96 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-cyan-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-3xl">🗳️</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Voter Access
              </span>
            </h1>
            <p className="text-slate-400 text-lg">
              Connect your wallet to participate in elections
            </p>
          </div>

          {/* Login Card */}
          <div className="backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-500">
            
            {/* Wallet Connection */}
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-white text-2xl">🦊</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Connect MetaMask Wallet
                </h3>
                <p className="text-slate-400 text-sm">
                  Your wallet signature serves as your secure login credential
                </p>
              </div>

              <button 
                onClick={login} 
                disabled={loading} 
                className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group"
              >
                <span className="relative z-10">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Connecting to wallet...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-xl">🔗</span>
                      <span>Connect Wallet & Sign Message</span>
                    </div>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              {/* Wallet Address Display */}
              {walletAddress && (
                <div className="mt-4 p-4 bg-slate-900/50 border border-slate-600/50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Connected Wallet</p>
                      <p className="text-sm font-mono text-emerald-400 break-all">
                        {walletAddress}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Notice */}
              <div className="bg-slate-900/30 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-400 text-sm">ℹ️</span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium mb-1">Secure Authentication</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      We use cryptographic signatures to verify your identity. No passwords required - just your wallet signature.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-center text-slate-400">
                New to voting?{' '}
                <Link 
                  to="/voter/register" 
                  className="text-transparent bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text hover:from-cyan-400 hover:to-emerald-400 transition-all duration-300 font-medium"
                >
                  Register as Voter
                </Link>
              </p>
            </div>
          </div>

          {/* MetaMask Requirements */}
          <div className="mt-6 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-slate-500 bg-slate-800/30 px-4 py-2 rounded-lg border border-slate-700/30">
              <span>🦊</span>
              <span>Requires MetaMask browser extension</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
