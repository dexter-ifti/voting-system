import React, { useState } from 'react';
import { registerCandidateForElection, registerVoterForElection } from '../lib/api';

interface Election {
  _id: string;
  title: string;
  description: string;
  electionType: string;
  contractAddress: string;
  status: string;
  votingStartTime?: string;
  votingEndTime?: string;
  maxCandidates: number;
  candidates: Array<{
    candidateId: string;
    onChainId: number;
  }>;
  totalRegisteredVoters: number;
  totalVotesCast: number;
}

interface ElectionRegistrationFormProps {
  election: Election;
  userType: 'candidate' | 'voter';
  walletAddress: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ElectionRegistrationForm: React.FC<ElectionRegistrationFormProps> = ({
  election,
  userType,
  walletAddress,
  onSuccess,
  onCancel
}) => {
  const [privateKey, setPrivateKey] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privateKey.trim()) {
      setError('Private key is required');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      const registrationData = {
        contractAddress: election.contractAddress,
        walletAddress,
        privateKey: privateKey.trim()
      };

      const result = userType === 'candidate' 
        ? await registerCandidateForElection(registrationData)
        : await registerVoterForElection(registrationData);

      if (result.success) {
        onSuccess();
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="relative backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-3xl max-w-2xl w-full shadow-2xl animate-fade-in">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-slate-900/20 rounded-3xl"></div>
        
        <div className="relative z-10 p-8">
          <div className="flex justify-between items-start mb-8">
            <div className="flex items-start space-x-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                userType === 'candidate' 
                  ? 'bg-gradient-to-br from-orange-500 to-pink-500 shadow-orange-500/25'
                  : 'bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-cyan-500/25'
              }`}>
                <span className="text-white text-2xl">
                  {userType === 'candidate' ? '🏛️' : '🗳️'}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  <span className={`bg-gradient-to-r bg-clip-text text-transparent ${
                    userType === 'candidate' 
                      ? 'from-orange-400 to-pink-400'
                      : 'from-cyan-400 to-emerald-400'
                  }`}>
                    Election Registration
                  </span>
                </h2>
                <p className="text-slate-400">
                  {userType === 'candidate' ? 'Register as a candidate' : 'Register as a voter'} for {election.title}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="w-10 h-10 bg-slate-700/50 hover:bg-slate-600/50 border border-slate-600/50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 hover:scale-105"
            >
              ✕
            </button>
          </div>

          {/* Election Details */}
          <div className="backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl p-6 mb-8">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                <span className="text-slate-300 text-xl">📊</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-lg mb-2">{election.title}</h3>
                <p className="text-slate-400 leading-relaxed mb-4">{election.description}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-600/30 rounded-xl p-4 border border-slate-500/30">
                <p className="text-xs text-slate-400 mb-1">Election Type</p>
                <p className="font-medium text-white capitalize">{election.electionType}</p>
              </div>
              <div className="bg-slate-600/30 rounded-xl p-4 border border-slate-500/30">
                <p className="text-xs text-slate-400 mb-1">Status</p>
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                  {election.status.replace('_', ' ')}
                </span>
              </div>
              {userType === 'candidate' && (
                <div className="md:col-span-2 bg-slate-600/30 rounded-xl p-4 border border-slate-500/30">
                  <p className="text-xs text-slate-400 mb-1">Candidate Slots</p>
                  <p className="font-medium text-white">{election.candidates.length}/{election.maxCandidates} registered</p>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label htmlFor="contractAddress" className="block text-sm font-medium text-slate-300">
                  📋 Contract Address
                </label>
                <input
                  id="contractAddress"
                  type="text"
                  value={election.contractAddress}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white font-mono text-sm focus:outline-none"
                />
              </div>

              <div className="space-y-3">
                <label htmlFor="walletAddress" className="block text-sm font-medium text-slate-300">
                  👛 Your Wallet Address
                </label>
                <input
                  id="walletAddress"
                  type="text"
                  value={walletAddress}
                  readOnly
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-2xl text-white font-mono text-sm focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label htmlFor="privateKey" className="block text-sm font-medium text-slate-300">
                🔐 Private Key *
              </label>
              <div className="relative">
                <input
                  id="privateKey"
                  type="password"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  placeholder="Enter your wallet private key"
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-2xl text-white placeholder-slate-400 focus:outline-none transition-all duration-300 font-mono ${
                    userType === 'candidate'
                      ? 'border-slate-600/50 focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20'
                      : 'border-slate-600/50 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                  required
                />
              </div>
              <div className="backdrop-blur-sm bg-blue-500/10 border border-blue-500/30 rounded-xl p-3">
                <p className="text-xs text-blue-200/80 leading-relaxed">
                  🔒 Your private key is used for secure blockchain registration and is never stored on our servers. This ensures complete privacy and security of your wallet.
                </p>
              </div>
            </div>

            {error && (
              <div className="backdrop-blur-sm bg-red-500/10 border border-red-500/30 rounded-2xl p-4 animate-shake">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm">⚠️</span>
                  </div>
                  <p className="text-sm text-red-200 leading-relaxed">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 px-6 backdrop-blur-sm bg-slate-700/30 border border-slate-600/50 rounded-2xl text-slate-300 font-semibold hover:bg-slate-600/50 hover:text-white transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRegistering || !privateKey.trim()}
                className={`flex-1 py-4 px-6 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg ${
                  userType === 'candidate'
                    ? 'bg-gradient-to-r from-orange-600 to-pink-600 hover:from-pink-600 hover:to-orange-600 text-white shadow-orange-500/25 hover:shadow-orange-500/40'
                    : 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40'
                }`}
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Registering...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <span>{userType === 'candidate' ? '🏛️' : '🗳️'}</span>
                    <span>Register as {userType}</span>
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};