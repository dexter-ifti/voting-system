import React, { useState, useEffect } from 'react';

interface DemoOTPDisplayProps {
  otpData?: {
    otp: string;
    email: string;
    studentId: string;
  } | null;
  onClose: () => void;
}

export const DemoOTPDisplay: React.FC<DemoOTPDisplayProps> = ({ otpData, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!otpData) return null;

  const copyOTP = () => {
    navigator.clipboard.writeText(otpData.otp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split('@');
    if (username.length <= 2) return email;
    const masked = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
    return `${masked}@${domain}`;
  };

  return (
    <div className="fixed top-20 right-4 z-[60] max-w-sm animate-pulse">
      <div className="bg-gradient-to-br from-emerald-500/95 to-cyan-500/95 backdrop-blur-xl border border-emerald-400/60 rounded-xl p-4 shadow-2xl shadow-emerald-500/40 ring-2 ring-emerald-400/30 transform transition-all duration-300 hover:scale-105">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-white text-lg">📱</span>
            <span className="text-white font-semibold text-sm">Demo OTP</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors p-1"
          >
            ✕
          </button>
        </div>

        {/* OTP Display */}
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-white/80 text-xs mb-1">📱 Demo OTP sent to:</div>
            <div className="text-white font-mono text-xs bg-black/20 rounded px-2 py-1">{maskEmail(otpData.email)}</div>
          </div>

          <div className="bg-black/30 rounded-lg p-4 text-center border border-white/20">
            <div className="text-emerald-200 text-xs mb-2 font-semibold">🔑 YOUR OTP CODE:</div>
            <div className="text-white font-mono text-3xl font-bold tracking-widest bg-white/10 rounded-lg py-2 px-4 border border-white/20">
              {otpData.otp}
            </div>
          </div>

          <button
            onClick={copyOTP}
            className="w-full bg-white/20 hover:bg-white/30 text-white text-sm py-2 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <span>{copied ? '✓' : '📋'}</span>
            <span>{copied ? 'Copied!' : 'Copy OTP'}</span>
          </button>

          <div className="text-white/60 text-xs text-center">
            ⚠️ Demo Mode: OTP visible for testing
          </div>
        </div>
      </div>
    </div>
  );
};