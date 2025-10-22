import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { ElectionRegistrationForm } from '../../components/ElectionRegistrationForm';
import { RegistrationStatus } from '../../components/RegistrationStatus';

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
    name: string;
    party: string;
    onChainId: number;
  }>;
  totalRegisteredVoters: number;
  totalVotesCast: number;
}

export const ElectionRegistrationPage: React.FC = () => {
  const { contractAddress } = useParams<{ contractAddress: string }>();
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  
  const [election, setElection] = useState<Election | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState<'candidate' | 'voter'>('voter');
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [registrationMessage, setRegistrationMessage] = useState('');

  useEffect(() => {
    if (!contractAddress) {
      setError('Contract address is required');
      setLoading(false);
      return;
    }

    loadElectionDetails();
  }, [contractAddress]);

  const loadElectionDetails = async () => {
    try {
      const { data } = await api.get(`/election/${contractAddress}`);
      if (data.success) {
        setElection(data.data.election);
      } else {
        setError('Election not found');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to load election details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrationSuccess = () => {
    setShowRegistrationForm(false);
    setRegistrationStatus('success');
  };

  const handleRegistrationError = (message: string) => {
    setRegistrationStatus('error');
    setRegistrationMessage(message);
  };

  const handleCloseStatus = () => {
    setRegistrationStatus('idle');
    setRegistrationMessage('');
    // Navigate back to appropriate dashboard
    if (userType === 'candidate') {
      navigate('/candidate/dashboard');
    } else {
      navigate('/voter/dashboard');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading election details...</p>
        </div>
      </div>
    );
  }

  if (error || !election) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold mb-2">Election Not Found</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold">Register for Election</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Election Details */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{election.title}</h2>
                <p className="text-muted-foreground">{election.description}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                election.status === 'registration_open'
                  ? 'bg-green-100 text-green-800'
                  : election.status === 'voting_active'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {election.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-2">Election Type</h3>
                <p className="text-sm text-muted-foreground capitalize">{election.electionType}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Candidates</h3>
                <p className="text-sm text-muted-foreground">
                  {election.candidates.length} / {election.maxCandidates} registered
                </p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Voters</h3>
                <p className="text-sm text-muted-foreground">
                  {election.totalRegisteredVoters} registered
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Contract Address</h3>
              <p className="text-sm font-mono bg-muted/50 p-3 rounded border break-all">
                {election.contractAddress}
              </p>
            </div>
          </div>

          {/* Registration Options */}
          {election.status === 'registration_open' && user ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Choose Registration Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Candidate Registration */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="rounded-full h-10 w-10 bg-blue-100 flex items-center justify-center mr-3">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h4 className="font-medium">Register as Candidate</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Run for office and let voters choose you. You'll be able to create your campaign profile and manifesto.
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      <p>• Must be a verified candidate</p>
                      <p>• One-time registration per election</p>
                      <p>• Requires blockchain transaction</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserType('candidate');
                        setShowRegistrationForm(true);
                      }}
                      disabled={election.candidates.length >= election.maxCandidates}
                      className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {election.candidates.length >= election.maxCandidates ? 'Candidate Slots Full' : 'Register as Candidate'}
                    </button>
                  </div>

                  {/* Voter Registration */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="rounded-full h-10 w-10 bg-green-100 flex items-center justify-center mr-3">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="font-medium">Register as Voter</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Register to vote in this election. You'll be able to cast your vote when voting begins.
                    </p>
                    <div className="text-xs text-muted-foreground mb-4">
                      <p>• Must be a verified voter</p>
                      <p>• One-time registration per election</p>
                      <p>• Requires blockchain transaction</p>
                    </div>
                    <button
                      onClick={() => {
                        setUserType('voter');
                        setShowRegistrationForm(true);
                      }}
                      className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Register as Voter
                    </button>
                  </div>
                </div>
              </div>

              {/* Current Candidates */}
              {election.candidates.length > 0 && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="font-medium mb-4">Current Candidates</h3>
                  <div className="space-y-3">
                    {election.candidates.map((candidate, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">{candidate.name || 'Anonymous'}</div>
                          <div className="text-sm text-muted-foreground">{candidate.party || 'Independent'}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ID: {candidate.onChainId}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <h3 className="font-medium mb-2">Registration Closed</h3>
              <p className="text-muted-foreground">
                Registration for this election is no longer available.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Registration Form Modal */}
      {showRegistrationForm && (
        <ElectionRegistrationForm
          election={election}
          userType={userType}
          walletAddress={user?.walletAddress || ''}
          onSuccess={handleRegistrationSuccess}
          onCancel={() => setShowRegistrationForm(false)}
        />
      )}

      {/* Registration Status Modal */}
      <RegistrationStatus
        status={registrationStatus}
        message={registrationMessage}
        userType={userType}
        electionTitle={election.title}
        onClose={handleCloseStatus}
      />
    </div>
  );
};