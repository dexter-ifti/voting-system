import React, { useState } from 'react';
import { api } from '../lib/api';

interface Candidate {
  candidateId: number;
  name: string;
  party: string;
  votes: string;
  manifesto?: string;
}

interface VotingInterfaceProps {
  contractAddress: string;
  candidates: Candidate[];
  userWalletAddress: string;
  onVoteSuccess: () => void;
}

export const VotingInterface: React.FC<VotingInterfaceProps> = ({
  contractAddress,
  candidates,
  userWalletAddress,
  onVoteSuccess
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null);
  const [privateKey, setPrivateKey] = useState('');
  const [isVoting, setIsVoting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState('');

  const handleVote = async () => {
    if (selectedCandidate === null || !privateKey.trim()) {
      setError('Please select a candidate and enter your private key');
      return;
    }

    setIsVoting(true);
    setError('');

    try {
      const { data } = await api.post('/voter/vote', {
        contractAddress,
        candidateId: selectedCandidate,
        privateKey: privateKey.trim()
      });

      if (data.success) {
        setShowConfirmation(false);
        onVoteSuccess();
      } else {
        setError(data.message || 'Failed to cast vote');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to cast vote');
    } finally {
      setIsVoting(false);
    }
  };

  const selectedCandidateData = candidates.find(c => c.candidateId === selectedCandidate);

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -top-4 -right-4 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Cast Your Vote
          </h2>
          <p className="text-slate-400 text-lg">Choose your candidate for this election</p>
        </div>

        {/* Candidate Selection */}
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <svg className="w-8 h-8 mr-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            Select Your Candidate
          </h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {candidates.map((candidate, index) => (
              <div 
                key={candidate.candidateId}
                className={`group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedCandidate === candidate.candidateId
                    ? 'bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/25'
                    : 'bg-slate-800/50 backdrop-blur-sm border border-white/10 hover:border-cyan-400/30'
                } rounded-2xl p-6`}
                onClick={() => setSelectedCandidate(candidate.candidateId)}
              >
                {/* Selection indicator */}
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                  selectedCandidate === candidate.candidateId
                    ? 'bg-cyan-400 border-cyan-400 shadow-lg shadow-cyan-400/50'
                    : 'border-slate-400 group-hover:border-cyan-400'
                }`}>
                  {selectedCandidate === candidate.candidateId && (
                    <svg className="w-4 h-4 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>

                {/* Candidate Avatar */}
                <div className="flex justify-center mb-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    selectedCandidate === candidate.candidateId
                      ? 'bg-gradient-to-r from-cyan-500 to-emerald-600'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 group-hover:from-cyan-600 group-hover:to-emerald-700'
                  } transition-all duration-300`}>
                    <span className="text-2xl font-bold text-white">
                      {candidate.name.charAt(0)}
                    </span>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="text-center space-y-3">
                  <h4 className="text-xl font-bold text-white">{candidate.name}</h4>
                  
                  <div className="flex justify-center">
                    <span className="bg-slate-700/50 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-slate-300 border border-white/10">
                      {candidate.party}
                    </span>
                  </div>

                  {candidate.manifesto && (
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                      {candidate.manifesto}
                    </p>
                  )}

                  <div className="pt-3 border-t border-white/10">
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm font-medium text-slate-300">
                        {parseInt(candidate.votes).toLocaleString()} votes
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-700/30 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/5">
                    <span className="text-xs text-slate-400 font-medium">ID: {candidate.candidateId}</span>
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Vote Confirmation Section */}
        {selectedCandidate !== null && (
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
            <h4 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg className="w-8 h-8 mr-3 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Confirm Your Vote
            </h4>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {selectedCandidateData?.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    Selected Candidate: {selectedCandidateData?.name}
                  </p>
                  <p className="text-slate-400">
                    Party: {selectedCandidateData?.party}
                  </p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 font-mono">
                  Contract: {contractAddress}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmation(true)}
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-bold text-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center justify-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Cast Vote for {selectedCandidateData?.name}</span>
              </span>
            </button>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            {/* Modal Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-l from-cyan-500 to-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
            </div>

            <div className="relative bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-3xl max-w-md w-full shadow-2xl">
              <div className="p-8">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                    Final Vote Confirmation
                  </h3>
                </div>
                
                <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-amber-400/30">
                  <div className="flex items-center space-x-3 mb-2">
                    <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold text-amber-300">⚠️ Important Warning</span>
                  </div>
                  <p className="text-sm text-amber-200 leading-relaxed">
                    Once cast, your vote cannot be changed or revoked. Please verify your selection carefully.
                  </p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-6 space-y-3">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {selectedCandidateData?.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-white text-lg">Voting for: {selectedCandidateData?.name}</p>
                      <p className="text-slate-400">Party: {selectedCandidateData?.party}</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-white/10">
                    <p className="text-sm text-slate-400">Candidate ID: {selectedCandidate}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-2a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                      Private Key (Required for Blockchain Transaction)
                    </label>
                    <input
                      type="password"
                      value={privateKey}
                      onChange={(e) => setPrivateKey(e.target.value)}
                      placeholder="Enter your wallet private key"
                      className="w-full p-4 bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                    />
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      🔒 Your private key is used only for this transaction and is never stored or transmitted to our servers.
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl p-4 animate-shake">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm text-red-300 font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      onClick={() => {
                        setShowConfirmation(false);
                        setPrivateKey('');
                        setError('');
                      }}
                      className="flex-1 py-4 px-6 bg-slate-800/50 backdrop-blur-sm text-slate-300 border border-white/10 rounded-xl hover:bg-slate-700/50 hover:scale-105 transition-all duration-300 font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleVote}
                      disabled={isVoting || !privateKey.trim()}
                      className="group relative flex-1 py-4 px-6 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 font-bold"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-emerald-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative flex items-center justify-center space-x-2">
                        {isVoting ? (
                          <>
                            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Casting Vote...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Confirm Vote</span>
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};