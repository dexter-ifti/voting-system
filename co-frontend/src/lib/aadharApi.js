import { api } from './api';
// Validate Aadhar number exists in system
export const validateAadhar = async (aadharNumber) => {
    const response = await api.post('/aadhar/validate', { aadharNumber });
    return response.data;
};
// Send OTP to email associated with Aadhar
export const sendOTP = async (aadharNumber) => {
    const response = await api.post('/aadhar/send-otp', { aadharNumber });
    return response.data;
};
// Verify OTP
export const verifyOTP = async (otpKey, otp) => {
    const response = await api.post('/aadhar/verify-otp', { otpKey, otp });
    return response.data;
};
// Get demo records (for testing/development)
export const getDemoRecords = async () => {
    const response = await api.get('/aadhar/demo-records');
    return response.data;
};
// Utility function to format Aadhar number with spaces
export const formatAadharNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 12 digits
    const limited = digits.substring(0, 12);
    // Add spaces every 4 digits
    return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
};
// Utility function to validate Aadhar format
export const isValidAadharFormat = (aadhar) => {
    const cleanAadhar = aadhar.replace(/\s/g, '');
    return /^\d{12}$/.test(cleanAadhar);
};
// Get clean Aadhar number (remove spaces)
export const getCleanAadhar = (aadhar) => {
    return aadhar.replace(/\s/g, '');
};
