import { useState } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

export const AdminRegisterPage = () => {
  const setUser = useAuthStore(s => s.setUser);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', walletAddress:'', password: '' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/admin/register', form);
      if (data.success) {
        setUser({ role: data.data.admin.role, token: data.data.token, email: data.data.admin.email, name: data.data.admin.name });
        toast.success('Registered');
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Registration</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs mb-1">Name</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required className="w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Email</label>
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required className="w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Wallet Address</label>
          <input value={form.walletAddress} onChange={e=>setForm(f=>({...f,walletAddress:e.target.value}))} required className="w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Password</label>
          <input type="password" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required className="w-full" />
        </div>
        <button disabled={loading} className="w-full bg-primary/80 hover:bg-primary py-2 rounded font-medium text-sm disabled:opacity-50">{loading? 'Registering...':'Register'}</button>
      </form>
      <p className="text-xs text-slate-400 mt-4">Already have an account? <Link to="/admin/login" className="text-primary">Login</Link></p>
    </div>
  );
};
