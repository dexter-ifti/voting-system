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
api.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Token is invalid or expired, logout user
        const logout = useAuthStore.getState().logout;
        logout();
        // Redirect to home page
        window.location.href = '/';
    }
    return Promise.reject(error);
});
// Election Registration API functions
export const registerCandidateForElection = async (data) => {
    const response = await api.post('/candidate/register-election', data);
    return response.data;
};
export const registerVoterForElection = async (data) => {
    const response = await api.post('/voter/register-election', data);
    return response.data;
};
// Get election results
export const getElectionResults = async (contractAddress) => {
    const response = await api.get(`/election/${contractAddress}/results`);
    return response.data;
};
// Update election status
export const updateElectionStatus = async (data) => {
    const response = await api.patch(`/election/${data.contractAddress}/status`, {
        status: data.status
    });
    return response.data;
};
