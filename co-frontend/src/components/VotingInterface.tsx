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
    <div className="space-y-6">
      {/* Candidate Selection */}
      <div>
        <h3 className="font-semibold mb-4">Select a Candidate</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {candidates.map(candidate => (
            <div 
              key={candidate.candidateId}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedCandidate === candidate.candidateId
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-border hover:border-primary/50 bg-card'
              }`}
              onClick={() => setSelectedCandidate(candidate.candidateId)}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{candidate.name}</h4>
                <div className="flex items-center">
                  <input
                    type="radio"
                    checked={selectedCandidate === candidate.candidateId}
                    onChange={() => setSelectedCandidate(candidate.candidateId)}
                    className="mr-2"
                  />
                  <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                    ID: {candidate.candidateId}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{candidate.party}</p>
              {candidate.manifesto && (
                <p className="text-xs text-muted-foreground line-clamp-2">{candidate.manifesto}</p>
              )}
              <div className="mt-3 pt-3 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Current Votes: {candidate.votes}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vote Button */}
      {selectedCandidate !== null && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h4 className="font-medium mb-3">Confirm Your Vote</h4>
          <div className="bg-muted/50 rounded-lg p-4 mb-4">
            <p className="text-sm">
              <span className="font-medium">Selected Candidate:</span> {selectedCandidateData?.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Party:</span> {selectedCandidateData?.party}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              <span className="font-medium">Contract:</span> {contractAddress}
            </p>
          </div>

          <button
            onClick={() => setShowConfirmation(true)}
            className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Cast Vote for {selectedCandidateData?.name}
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card border border-border rounded-lg max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Confirm Your Vote</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> Once cast, your vote cannot be changed. Please verify your selection.
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <p className="font-medium">Voting for: {selectedCandidateData?.name}</p>
                <p className="text-sm text-muted-foreground">Party: {selectedCandidateData?.party}</p>
                <p className="text-xs text-muted-foreground mt-2">Candidate ID: {selectedCandidate}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Private Key (Required for Blockchain Transaction)
                  </label>
                  <input
                    type="password"
                    value={privateKey}
                    onChange={(e) => setPrivateKey(e.target.value)}
                    placeholder="Enter your wallet private key"
                    className="w-full p-3 border border-border rounded-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Your private key is used only for this transaction and is not stored.
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowConfirmation(false);
                      setPrivateKey('');
                      setError('');
                    }}
                    className="flex-1 py-3 px-4 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVote}
                    disabled={isVoting || !privateKey.trim()}
                    className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    {isVoting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Casting Vote...
                      </span>
                    ) : (
                      'Confirm Vote'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};