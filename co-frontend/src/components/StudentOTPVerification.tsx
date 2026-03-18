import React, { useState, useEffect, useRef } from 'react';
import { verifyOTP } from '../lib/studentApi';

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className = ''
}) => {
  const [currentValue, setCurrentValue] = useState(value || '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setCurrentValue(value || '');
  }, [value]);

  useEffect(() => {
    if (currentValue.length === length) {
      onComplete?.(currentValue);
    }
  }, [currentValue, length, onComplete]);

  const handleChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '');
    
    if (digit.length > 1) return; // Prevent multiple characters

    const newValue = currentValue.split('');
    newValue[index] = digit;
    const updatedValue = newValue.join('');

    setCurrentValue(updatedValue);
    onChange(updatedValue);

    // Auto focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace') {
      if (!currentValue[index] && index > 0) {
        // Focus previous input if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newValue = currentValue.split('');
        newValue[index] = '';
        const updatedValue = newValue.join('');
        setCurrentValue(updatedValue);
        onChange(updatedValue);
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
    const newValue = pastedData.substring(0, length);
    setCurrentValue(newValue);
    onChange(newValue);

    // Focus the next empty input or last input
    const nextIndex = Math.min(newValue.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className={`flex justify-center space-x-3 ${className}`}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={currentValue[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`
            w-12 h-12 text-center text-xl font-semibold rounded-xl border-2 
            bg-slate-900/50 text-white placeholder-slate-400
            focus:outline-none focus:ring-2 transition-all duration-300
            ${error 
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-slate-600/50 focus:border-cyan-500 focus:ring-cyan-500/20'
            }
            ${disabled 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:border-slate-500/50'
            }
          `}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

interface StudentOTPVerificationProps {
  studentId: string;
  email: string;
  otpKey: string;
  onVerificationSuccess: (data: { studentId: string; email: string }) => void;
  onCancel: () => void;
  onResendOTP: () => void;
  loading?: boolean;
  resending?: boolean;
}

export const StudentOTPVerification: React.FC<StudentOTPVerificationProps> = ({
  studentId,
  email,
  otpKey,
  onVerificationSuccess,
  onCancel,
  onResendOTP,
  loading = false,
  resending = false
}) => {
  const [otp, setOTP] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await verifyOTP(otpKey, otp);
      
      if (response.success && response.data?.isValid) {
        onVerificationSuccess({
          studentId: response.data.studentId,
          email: response.data.email
        });
      } else {
        setError(response.message || 'Invalid OTP. Please try again.');
        setOTP('');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Verification failed. Please try again.');
      setOTP('');
    } finally {
      setVerifying(false);
    }
  };

  const handleOTPComplete = (completedOTP: string) => {
    setOTP(completedOTP);
    setError('');
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const masked = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${masked}@${domain}`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🎓</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verify Your Student ID</h2>
          <p className="text-slate-400 text-sm">
            Enter the 6-digit OTP sent to
          </p>
          <p className="text-cyan-400 font-medium text-sm mt-1">
            {maskEmail(email)}
          </p>
        </div>

        {/* Student ID Info */}
        <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-sm">Student ID:</span>
            <span className="text-white font-mono">
              {studentId}
            </span>
          </div>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3 text-center">
            Enter OTP
          </label>
          <OTPInput
            value={otp}
            onChange={setOTP}
            onComplete={handleOTPComplete}
            disabled={verifying || loading}
            error={!!error}
          />
          {error && (
            <p className="text-red-400 text-sm text-center mt-3 flex items-center justify-center">
              <span className="mr-1">⚠️</span>
              {error}
            </p>
          )}
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-slate-400 text-sm">
              OTP expires in <span className="text-cyan-400 font-mono">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-red-400 text-sm">OTP has expired</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            disabled={otp.length !== 6 || verifying || loading || timeLeft === 0}
            className="w-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {verifying ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify OTP'
            )}
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onResendOTP}
              disabled={resending || timeLeft > 240} // Allow resend after 1 minute
              className="flex-1 bg-slate-700/50 text-slate-300 py-3 px-4 rounded-xl font-medium border border-slate-600/50 hover:bg-slate-600/50 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {resending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin"></div>
                  <span>Sending...</span>
                </div>
              ) : (
                'Resend OTP'
              )}
            </button>

            <button
              onClick={onCancel}
              disabled={loading || verifying}
              className="flex-1 bg-slate-700/50 text-slate-300 py-3 px-4 rounded-xl font-medium border border-slate-600/50 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Didn't receive the OTP? Check your spam folder or try resending after 1 minute.
          </p>
        </div>
      </div>
    </div>
  );
};
