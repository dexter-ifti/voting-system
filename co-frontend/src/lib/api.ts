import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().user?.token;
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired, logout user
      const logout = useAuthStore.getState().logout;
      logout();
      // Redirect to home page
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T> { success: boolean; message?: string; data?: T; error?: string; }
