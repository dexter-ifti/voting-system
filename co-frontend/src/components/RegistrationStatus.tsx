import React from 'react';

interface RegistrationStatusProps {
  status: 'idle' | 'registering' | 'success' | 'error';
  message?: string;
  userType: 'candidate' | 'voter';
  electionTitle?: string;
  onClose?: () => void;
}

export const RegistrationStatus: React.FC<RegistrationStatusProps> = ({
  status,
  message,
  userType,
  electionTitle,
  onClose
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'registering':
        return (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        );
      case 'success':
        return (
          <div className="rounded-full h-12 w-12 bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="rounded-full h-12 w-12 bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'registering':
        return `Registering ${userType}...`;
      case 'success':
        return 'Registration Successful!';
      case 'error':
        return 'Registration Failed';
      default:
        return '';
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'registering':
        return `Processing your ${userType} registration for ${electionTitle}. This may take a few moments...`;
      case 'success':
        return `You have been successfully registered as a ${userType} for ${electionTitle}. You can now participate in the election.`;
      case 'error':
        return message || `Failed to register as ${userType}. Please try again.`;
      default:
        return '';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-md w-full">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            {getStatusIcon()}
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {getStatusTitle()}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6">
            {getStatusMessage()}
          </p>

          {(status === 'success' || status === 'error') && onClose && (
            <button
              onClick={onClose}
              className={`w-full py-3 px-4 rounded-lg transition-colors ${
                status === 'success'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {status === 'success' ? 'Continue' : 'Try Again'}
            </button>
          )}

          {status === 'registering' && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                Please wait while we process your registration on the blockchain...
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};