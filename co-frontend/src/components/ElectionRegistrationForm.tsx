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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                Register for Election
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {userType === 'candidate' ? 'Register as a candidate' : 'Register as a voter'} for {election.title}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {/* Election Details */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">{election.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">{election.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-1 capitalize">{election.electionType}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <span className="ml-1 capitalize">{election.status.replace('_', ' ')}</span>
              </div>
              {userType === 'candidate' && (
                <div className="col-span-2">
                  <span className="text-muted-foreground">Candidates:</span>
                  <span className="ml-1">{election.candidates.length}/{election.maxCandidates}</span>
                </div>
              )}
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="contractAddress" className="block text-sm font-medium mb-2">
                Contract Address
              </label>
              <input
                id="contractAddress"
                type="text"
                value={election.contractAddress}
                readOnly
                className="w-full p-3 border border-border rounded-lg bg-muted/50 text-sm font-mono"
              />
            </div>

            <div>
              <label htmlFor="walletAddress" className="block text-sm font-medium mb-2">
                Your Wallet Address
              </label>
              <input
                id="walletAddress"
                type="text"
                value={walletAddress}
                readOnly
                className="w-full p-3 border border-border rounded-lg bg-muted/50 text-sm font-mono"
              />
            </div>

            <div>
              <label htmlFor="privateKey" className="block text-sm font-medium mb-2">
                Private Key *
              </label>
              <input
                id="privateKey"
                type="password"
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder="Enter your wallet private key"
                className="w-full p-3 border border-border rounded-lg"
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your private key is used for blockchain registration and is not stored on our servers.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isRegistering || !privateKey.trim()}
                className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isRegistering ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registering...
                  </span>
                ) : (
                  `Register as ${userType}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};