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

export interface ApiResponse<T> { success: boolean; message?: string; data?: T; error?: string; }
