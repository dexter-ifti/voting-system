import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

export const CandidateLoginPage = () => {
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const login = async () => {
    setLoading(true);
    try {
      if (!(window as any).ethereum) throw new Error('MetaMask not found');
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const address = accounts[0];
      setWalletAddress(address);
      const message = `Login as candidate at ${new Date().toISOString()}`;
      const signer = await provider.getSigner();
      const signature = await signer.signMessage(message);
      const { data } = await api.post('/candidate/login', { walletAddress: address, message, signature });
      if (data.success) {
        setUser({ role: 'candidate', token: data.data.token, walletAddress: data.data.candidate.walletAddress, name: data.data.candidate.name });
        toast.success('Logged in');
        navigate('/candidate/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <h1 className="text-2xl font-semibold mb-6">Candidate Login (Wallet)</h1>
      <button onClick={login} disabled={loading} className="w-full bg-primary/80 hover:bg-primary py-2 rounded font-medium text-sm disabled:opacity-50">{loading? 'Connecting...':'Connect Wallet & Sign'}</button>
      <p className="text-xs text-slate-400 mt-4">Need an account? <Link to="/candidate/register" className="text-primary">Register</Link></p>
      {walletAddress && <p className="text-xs text-slate-500 mt-4">Detected: {walletAddress}</p>}
    </div>
  );
};
