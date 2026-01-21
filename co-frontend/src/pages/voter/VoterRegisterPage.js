import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { AadharOTPVerification } from '../../components/AadharOTPVerification';
import { DemoOTPDisplay } from '../../components/DemoOTPDisplay';
import { validateAadhar, sendOTP, formatAadharNumber, isValidAadharFormat, getCleanAadhar } from '../../lib/aadharApi';
export const VoterRegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        age: 18,
        gender: 'NotSpecified',
        walletAddress: '',
        email: '',
        phone: '',
        aadharNumber: ''
    });
    // Aadhar verification states
    const [aadharStep, setAadharStep] = useState('input');
    const [aadharValidating, setAadharValidating] = useState(false);
    const [aadharError, setAadharError] = useState('');
    const [verifiedAadharData, setVerifiedAadharData] = useState(null);
    // OTP verification states
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otpData, setOtpData] = useState(null);
    const [resendingOTP, setResendingOTP] = useState(false);
    // Demo OTP display state
    const [demoOTPData, setDemoOTPData] = useState(null);
    // Handle Aadhar input change with formatting
    const handleAadharChange = (value) => {
        const formatted = formatAadharNumber(value);
        setForm(f => ({ ...f, aadharNumber: formatted }));
        setAadharError('');
        if (aadharStep === 'verified') {
            setAadharStep('input');
            setVerifiedAadharData(null);
        }
    };
    // Validate and verify Aadhar
    const handleAadharValidation = async () => {
        const cleanAadhar = getCleanAadhar(form.aadharNumber);
        if (!isValidAadharFormat(cleanAadhar)) {
            setAadharError('Please enter a valid 12-digit Aadhar number');
            return;
        }
        setAadharValidating(true);
        setAadharError('');
        try {
            // Step 1: Validate Aadhar exists
            const validateResponse = await validateAadhar(cleanAadhar);
            if (!validateResponse.success || !validateResponse.data) {
                setAadharError(validateResponse.message || 'Aadhar number not found in our records');
                return;
            }
            // Step 2: Send OTP
            const otpResponse = await sendOTP(cleanAadhar);
            if (!otpResponse.success || !otpResponse.data) {
                setAadharError(otpResponse.message || 'Failed to send OTP');
                return;
            }
            // Show OTP modal
            setOtpData({
                otpKey: otpResponse.data.otpKey,
                email: validateResponse.data.email,
                aadharNumber: cleanAadhar
            });
            setShowOTPModal(true);
            setAadharStep('verifying');
            // For demo: show OTP in floating component if available in response
            if (otpResponse.data.otp) {
                setDemoOTPData({
                    otp: otpResponse.data.otp,
                    email: validateResponse.data.email,
                    aadharNumber: cleanAadhar
                });
                // Auto-hide demo OTP after 30 seconds or when modal closes
                setTimeout(() => {
                    setDemoOTPData(null);
                }, 30000);
            }
            toast.success(`OTP sent to ${validateResponse.data.email}`);
        }
        catch (error) {
            setAadharError(error.response?.data?.message || 'Aadhar validation failed');
        }
        finally {
            setAadharValidating(false);
        }
    };
    // Handle OTP verification success
    const handleOTPVerificationSuccess = (data) => {
        setVerifiedAadharData(data);
        setAadharStep('verified');
        setShowOTPModal(false);
        setOtpData(null);
        setDemoOTPData(null); // Hide demo OTP on success
        // Pre-fill email if not already filled
        if (!form.email) {
            setForm(f => ({ ...f, email: data.email }));
        }
        toast.success('Aadhar verified successfully!');
    };
    // Handle OTP modal cancel
    const handleOTPCancel = () => {
        setShowOTPModal(false);
        setOtpData(null);
        setDemoOTPData(null); // Hide demo OTP on cancel
        setAadharStep('input');
    };
    // Handle OTP resend
    const handleOTPResend = async () => {
        if (!otpData)
            return;
        setResendingOTP(true);
        try {
            const otpResponse = await sendOTP(otpData.aadharNumber);
            if (otpResponse.success && otpResponse.data) {
                setOtpData(prev => prev ? {
                    ...prev,
                    otpKey: otpResponse.data.otpKey
                } : null);
                toast.success('New OTP sent successfully!');
            }
            else {
                toast.error(otpResponse.message || 'Failed to resend OTP');
            }
        }
        catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        }
        finally {
            setResendingOTP(false);
        }
    };
    const submit = async (e) => {
        e.preventDefault();
        // Check if Aadhar is verified
        if (aadharStep !== 'verified' || !verifiedAadharData) {
            toast.error('Please verify your Aadhar number first');
            return;
        }
        setLoading(true);
        try {
            const formData = {
                ...form,
                aadharNumber: verifiedAadharData.aadharNumber
            };
            const { data } = await api.post('/voter/register', formData);
            if (data.success) {
                toast.success('Registered, pending verification');
            }
        }
        catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs("div", { className: "min-h-screen bg-slate-950 relative overflow-hidden", children: [_jsx("div", { className: "absolute top-20 right-24 w-80 h-80 bg-gradient-to-br from-cyan-600/30 to-emerald-600/30 rounded-full blur-3xl animate-pulse" }), _jsx("div", { className: "absolute bottom-20 left-24 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" }), _jsx("div", { className: "absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-700" }), _jsx("div", { className: "relative z-10 flex items-center justify-center min-h-screen p-6", children: _jsxs("div", { className: "w-full max-w-lg", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("div", { className: "w-20 h-20 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6", children: _jsx("span", { className: "text-white text-3xl", children: "\uD83D\uDCDD" }) }), _jsx("h1", { className: "text-4xl md:text-5xl font-bold mb-4", children: _jsx("span", { className: "bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-400 bg-clip-text text-transparent", children: "Become a Voter" }) }), _jsx("p", { className: "text-slate-400 text-lg", children: "Register to participate in secure blockchain elections" })] }), _jsxs("div", { className: "backdrop-blur-sm bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-xl shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all duration-500", children: [_jsxs("form", { onSubmit: submit, className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white flex items-center space-x-2", children: [_jsx("span", { className: "w-6 h-6 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center text-xs", children: "1" }), _jsx("span", { children: "Identity Verification" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Aadhar Number" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { value: form.aadharNumber, onChange: e => handleAadharChange(e.target.value), required: true, placeholder: "1234 5678 9012", maxLength: 14, className: `w-full px-4 py-3 bg-slate-900/50 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:outline-none transition-all duration-300 hover:border-slate-500/50 font-mono ${aadharError
                                                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                                                                                : aadharStep === 'verified'
                                                                                    ? 'border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20'
                                                                                    : 'border-slate-600/50 focus:border-cyan-500/50 focus:ring-cyan-500/20'}`, disabled: aadharStep === 'verified' }), aadharStep === 'verified' && (_jsx("div", { className: "absolute right-3 top-1/2 transform -translate-y-1/2", children: _jsx("span", { className: "text-emerald-400 text-xl", children: "\u2713" }) }))] }), aadharError && (_jsxs("p", { className: "text-red-400 text-sm flex items-center", children: [_jsx("span", { className: "mr-1", children: "\u26A0\uFE0F" }), aadharError] })), aadharStep === 'verified' && verifiedAadharData && (_jsx("div", { className: "bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3", children: _jsxs("p", { className: "text-emerald-300 text-sm flex items-center", children: [_jsx("span", { className: "mr-2", children: "\u2705" }), "Aadhar verified with email: ", verifiedAadharData.email] }) })), _jsx("button", { type: "button", onClick: handleAadharValidation, disabled: !form.aadharNumber || aadharValidating || aadharStep === 'verified', className: `w-full py-3 px-4 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${aadharStep === 'verified'
                                                                        ? 'bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 cursor-default'
                                                                        : 'bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-600/30 hover:border-cyan-500/50'}`, children: aadharValidating ? (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("div", { className: "w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" }), _jsx("span", { children: "Validating Aadhar..." })] })) : aadharStep === 'verified' ? (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("span", { children: "\u2705" }), _jsx("span", { children: "Aadhar Verified" })] })) : (_jsxs("div", { className: "flex items-center justify-center space-x-2", children: [_jsx("span", { children: "\uD83D\uDD0D" }), _jsx("span", { children: "Verify Aadhar" })] })) })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white flex items-center space-x-2", children: [_jsx("span", { className: "w-6 h-6 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center text-xs", children: "2" }), _jsx("span", { children: "Personal Information" })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Full Name" }), _jsx("input", { value: form.name, onChange: e => setForm(f => ({ ...f, name: e.target.value })), required: true, className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50", placeholder: "John Smith" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Age" }), _jsx("input", { type: "number", value: form.age, onChange: e => setForm(f => ({ ...f, age: parseInt(e.target.value) || 18 })), required: true, min: "18", className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Gender" }), _jsxs("select", { value: form.gender, onChange: e => setForm(f => ({ ...f, gender: e.target.value })), className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50", children: [_jsx("option", { value: "NotSpecified", children: "Not Specified" }), _jsx("option", { value: "Male", children: "Male" }), _jsx("option", { value: "Female", children: "Female" }), _jsx("option", { value: "Other", children: "Other" })] })] })] })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white flex items-center space-x-2", children: [_jsx("span", { className: "w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs", children: "3" }), _jsx("span", { children: "Blockchain Identity" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Wallet Address" }), _jsx("input", { value: form.walletAddress, onChange: e => setForm(f => ({ ...f, walletAddress: e.target.value })), required: true, className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50 font-mono text-sm", placeholder: "0x1234...5678" }), _jsx("p", { className: "text-xs text-slate-500 mt-2", children: "Your Ethereum wallet address for blockchain voting" })] })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-lg font-semibold text-white flex items-center space-x-2", children: [_jsx("span", { className: "w-6 h-6 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-xs", children: "4" }), _jsx("span", { children: "Contact Details (Optional)" })] }), _jsxs("div", { className: "grid gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Email Address" }), _jsx("input", { type: "email", value: form.email, onChange: e => setForm(f => ({ ...f, email: e.target.value })), className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50", placeholder: "voter@example.com" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-slate-300 mb-2", children: "Phone Number" }), _jsx("input", { value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })), className: "w-full px-4 py-3 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-300 hover:border-slate-500/50", placeholder: "+1 (555) 123-4567" })] })] })] }), _jsxs("button", { disabled: loading || aadharStep !== 'verified', className: "w-full relative overflow-hidden bg-gradient-to-r from-cyan-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group", children: [_jsx("span", { className: "relative z-10", children: loading ? (_jsxs("div", { className: "flex items-center justify-center space-x-3", children: [_jsx("div", { className: "w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" }), _jsx("span", { children: "Submitting registration..." })] })) : aadharStep !== 'verified' ? (_jsxs("div", { className: "flex items-center justify-center space-x-3", children: [_jsx("span", { className: "text-xl", children: "\uD83D\uDD12" }), _jsx("span", { children: "Complete Aadhar Verification First" })] })) : (_jsxs("div", { className: "flex items-center justify-center space-x-3", children: [_jsx("span", { className: "text-xl", children: "\u2705" }), _jsx("span", { children: "Submit Registration" })] })) }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-r from-emerald-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" })] })] }), _jsx("div", { className: "mt-8 pt-6 border-t border-slate-700/50", children: _jsxs("p", { className: "text-center text-slate-400", children: ["Already registered?", ' ', _jsx(Link, { to: "/voter/login", className: "text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text hover:from-emerald-400 hover:to-blue-400 transition-all duration-300 font-medium", children: "Sign In Here" })] }) })] }), _jsx("div", { className: "mt-6 text-center", children: _jsxs("div", { className: "inline-flex items-center space-x-2 text-sm text-slate-500 bg-slate-800/30 px-4 py-2 rounded-lg border border-slate-700/30", children: [_jsx("span", { children: "\u23F3" }), _jsx("span", { children: "Registration requires admin verification" })] }) })] }) }), demoOTPData && (_jsx(DemoOTPDisplay, { otpData: demoOTPData, onClose: () => setDemoOTPData(null) })), showOTPModal && otpData && (_jsx(AadharOTPVerification, { aadharNumber: otpData.aadharNumber, email: otpData.email, otpKey: otpData.otpKey, onVerificationSuccess: handleOTPVerificationSuccess, onCancel: handleOTPCancel, onResendOTP: handleOTPResend, loading: loading, resending: resendingOTP }))] }));
};
