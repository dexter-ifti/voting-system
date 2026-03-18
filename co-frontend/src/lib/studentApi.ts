import { api } from './api';

export interface StudentValidationResponse {
  success: boolean;
  message: string;
  data?: {
    studentId: string;
    email: string;
    name: string;
    department: string;
    enrollmentYear: number;
    program: string;
  };
}

export interface OTPResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
    studentId: string;
    otpKey: string;
    otp?: string; // Only in demo mode
  };
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  data?: {
    isValid: boolean;
    studentId: string;
    email: string;
  };
}

export interface DemoRecord {
  studentId: string;
  email: string;
  name: string;
  department: string;
}

// Validate Student ID exists in college database
export const validateStudentId = async (studentId: string): Promise<StudentValidationResponse> => {
  const response = await api.post('/student/validate', { studentId });
  return response.data;
};

// Send OTP to institutional email
export const sendOTP = async (studentId: string): Promise<OTPResponse> => {
  const response = await api.post('/student/send-otp', { studentId });
  return response.data;
};

// Verify OTP
export const verifyOTP = async (otpKey: string, otp: string): Promise<OTPVerificationResponse> => {
  const response = await api.post('/student/verify-otp', { otpKey, otp });
  return response.data;
};

// Get demo student records
export const getDemoRecords = async () => {
  const response = await api.get('/student/demo-records');
  return response.data;
};

// Utility function to format Student ID
export const formatStudentId = (value: string): string => {
  // Remove all non-alphanumeric characters
  const clean = value.replace(/[^A-Za-z0-9]/g, '');
  
  // Format as XX-0000-000000 (adjust based on your format)
  if (clean.length <= 2) return clean.toUpperCase();
  if (clean.length <= 6) return `${clean.slice(0, 2)}-${clean.slice(2)}`.toUpperCase();
  return `${clean.slice(0, 2)}-${clean.slice(2, 6)}-${clean.slice(6, 12)}`.toUpperCase();
};

// Utility function to validate Student ID format
export const isValidStudentIdFormat = (studentId: string): boolean => {
  const clean = studentId.replace(/[^A-Za-z0-9]/g, '');
  // Adjust regex based on your institution's format
  return /^[A-Z]{2}\d{10}$/.test(clean.toUpperCase());
};

// Get clean Student ID (remove formatting)
export const getCleanStudentId = (studentId: string): string => {
  return studentId.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
};
