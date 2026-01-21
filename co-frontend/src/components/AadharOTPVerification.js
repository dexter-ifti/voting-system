import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { verifyOTP } from '../lib/aadharApi';
export const OTPInput = ({ length = 6, value, onChange, onComplete, disabled = false, error = false, className = '' }) => {
    const [currentValue, setCurrentValue] = useState(value || '');
    const inputRefs = useRef([]);
    useEffect(() => {
        setCurrentValue(value || '');
    }, [value]);
    useEffect(() => {
        if (currentValue.length === length) {
            onComplete?.(currentValue);
        }
    }, [currentValue, length, onComplete]);
    const handleChange = (index, inputValue) => {
        // Only allow digits
        const digit = inputValue.replace(/\D/g, '');
        if (digit.length > 1)
            return; // Prevent multiple characters
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
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!currentValue[index] && index > 0) {
                // Focus previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            }
            else {
                // Clear current input
                const newValue = currentValue.split('');
                newValue[index] = '';
                const updatedValue = newValue.join('');
                setCurrentValue(updatedValue);
                onChange(updatedValue);
            }
        }
    };
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '');
        const newValue = pastedData.substring(0, length);
        setCurrentValue(newValue);
        onChange(newValue);
        // Focus the next empty input or last input
        const nextIndex = Math.min(newValue.length, length - 1);
        inputRefs.current[nextIndex]?.focus();
    };
    return (_jsx("div", { className: `flex justify-center space-x-3 ${className}`, children: Array.from({ length }).map((_, index) => (_jsx("input", { ref: (el) => (inputRefs.current[index] = el), type: "text", inputMode: "numeric", pattern: "\\d*", maxLength: 1, value: currentValue[index] || '', onChange: (e) => handleChange(index, e.target.value), onKeyDown: (e) => handleKeyDown(index, e), onPaste: handlePaste, disabled: disabled, className: `
            w-12 h-12 text-center text-xl font-semibold rounded-xl border-2 
            bg-slate-900/50 text-white placeholder-slate-400
            focus:outline-none focus:ring-2 transition-all duration-300
            ${error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-slate-600/50 focus:border-cyan-500 focus:ring-cyan-500/20'}
            ${disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:border-slate-500/50'}
          `, autoComplete: "one-time-code" }, index))) }));
};
export const AadharOTPVerification = ({ aadharNumber, email, otpKey, onVerificationSuccess, onCancel, onResendOTP, loading = false, resending = false }) => {
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
    const formatTime = (seconds) => {
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
                    aadharNumber: response.data.aadhar,
                    email: response.data.email
                });
            }
            else {
                setError(response.message || 'Invalid OTP. Please try again.');
                setOTP('');
            }
        }
        catch (error) {
            setError(error.response?.data?.message || 'Verification failed. Please try again.');
            setOTP('');
        }
        finally {
            setVerifying(false);
        }
    };
    const handleOTPComplete = (completedOTP) => {
        setOTP(completedOTP);
        setError('');
    };
    const maskEmail = (email) => {
        const [username, domain] = email.split('@');
        if (username.length <= 2)
            return email;
        const masked = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
        return `${masked}@${domain}`;
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50", children: _jsxs("div", { className: "w-full max-w-md bg-slate-800/90 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4", children: _jsx("span", { className: "text-white text-2xl", children: "\uD83D\uDCF1" }) }), _jsx("h2", { className: "text-2xl font-bold text-white mb-2", children: "Verify Your Aadhar" }), _jsx("p", { className: "text-slate-400 text-sm", children: "Enter the 6-digit OTP sent to" }), _jsx("p", { className: "text-cyan-400 font-medium text-sm mt-1", children: maskEmail(email) })] }), _jsx("div", { className: "bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 mb-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-slate-400 text-sm", children: "Aadhar Number:" }), _jsx("span", { className: "text-white font-mono", children: aadharNumber.replace(/(\d{4})(?=\d)/g, '$1 ') })] }) }), _jsxs("div", { className: "mb-6", children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-3 text-center", children: "Enter OTP" }), _jsx(OTPInput, { value: otp, onChange: setOTP, onComplete: handleOTPComplete, disabled: verifying || loading, error: !!error }), error && (_jsxs("p", { className: "text-red-400 text-sm text-center mt-3 flex items-center justify-center", children: [_jsx("span", { className: "mr-1", children: "\u26A0\uFE0F" }), error] }))] }), _jsx("div", { className: "text-center mb-6", children: timeLeft > 0 ? (_jsxs("p", { className: "text-slate-400 text-sm", children: ["OTP expires in ", _jsx("span", { className: "text-cyan-400 font-mono", children: formatTime(timeLeft) })] })) : (_jsx("p", { className: "text-red-400 text-sm", children: "OTP has expired" })) }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: handleVerifyOTP, disabled: otp.length !== 6 || verifying || loading || timeLeft === 0, className: "w-full bg-gradient-to-r from-cyan-600 to-emerald-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none", children: verifying ? (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" }), _jsx("span", { children: "Verifying..." })] })) : ('Verify OTP') }), _jsxs("div", { className: "flex space-x-3", children: [_jsx("button", { onClick: onResendOTP, disabled: resending || timeLeft > 240, className: "flex-1 bg-slate-700/50 text-slate-300 py-3 px-4 rounded-xl font-medium border border-slate-600/50 hover:bg-slate-600/50 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed", children: resending ? (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" }), _jsx("span", { children: "Sending..." })] })) : ('Resend OTP') }), _jsx("button", { onClick: onCancel, disabled: loading || verifying, className: "flex-1 bg-slate-700/50 text-slate-300 py-3 px-4 rounded-xl font-medium border border-slate-600/50 hover:bg-red-600/20 hover:border-red-500/50 hover:text-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed", children: "Cancel" })] })] }), _jsx("div", { className: "mt-6 text-center", children: _jsx("p", { className: "text-xs text-slate-500", children: "Didn't receive the OTP? Check your spam folder or try resending after 1 minute." }) })] }) }));
};
