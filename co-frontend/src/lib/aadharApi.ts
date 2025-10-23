import { api } from './api';

export interface AadharValidationResponse {
  success: boolean;
  message: string;
  data?: {
    aadharNumber: string;
    email: string;
  };
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    otpKey: string;
    otp: string; // Only for demo/testing - remove in production
    expiresAt: string;
  };
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    isValid: boolean;
    aadhar: string;
    email: string;
  };
}

export interface DemoRecord {
  aadhar: string;
  email: string;
}

// Validate Aadhar number exists in system
export const validateAadhar = async (aadharNumber: string): Promise<AadharValidationResponse> => {
  const response = await api.post('/aadhar/validate', { aadharNumber });
  return response.data;
};

// Send OTP to email associated with Aadhar
export const sendOTP = async (aadharNumber: string): Promise<OTPResponse> => {
  const response = await api.post('/aadhar/send-otp', { aadharNumber });
  return response.data;
};

// Verify OTP
export const verifyOTP = async (otpKey: string, otp: string): Promise<OTPVerificationResponse> => {
  const response = await api.post('/aadhar/verify-otp', { otpKey, otp });
  return response.data;
};

// Get demo records (for testing/development)
export const getDemoRecords = async (): Promise<{ success: boolean; data: DemoRecord[] }> => {
  const response = await api.get('/aadhar/demo-records');
  return response.data;
};

// Utility function to format Aadhar number with spaces
export const formatAadharNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 12 digits
  const limited = digits.substring(0, 12);
  
  // Add spaces every 4 digits
  return limited.replace(/(\d{4})(?=\d)/g, '$1 ');
};

// Utility function to validate Aadhar format
export const isValidAadharFormat = (aadhar: string): boolean => {
  const cleanAadhar = aadhar.replace(/\s/g, '');
  return /^\d{12}$/.test(cleanAadhar);
};

// Get clean Aadhar number (remove spaces)
export const getCleanAadhar = (aadhar: string): string => {
  return aadhar.replace(/\s/g, '');
};