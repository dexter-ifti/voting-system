import { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export const VoterRegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', age: 18, gender:'NotSpecified', walletAddress:'', email:'', phone:'' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/voter/register', form);
      if (data.success) {
        toast.success('Registered, pending verification');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-6">
      <h1 className="text-2xl font-semibold mb-6">Voter Registration</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs mb-1">Name</label>
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required className="w-full" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs mb-1">Age</label>
            <input type="number" value={form.age} onChange={e=>setForm(f=>({...f,age:parseInt(e.target.value)||18}))} required className="w-full" />
          </div>
          <div>
            <label className="block text-xs mb-1">Gender</label>
            <select value={form.gender} onChange={e=>setForm(f=>({...f,gender:e.target.value}))} className="w-full">
              <option>NotSpecified</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs mb-1">Wallet Address</label>
          <input value={form.walletAddress} onChange={e=>setForm(f=>({...f,walletAddress:e.target.value}))} required className="w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Email</label>
          <input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Phone</label>
          <input value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} className="w-full" />
        </div>
        <button disabled={loading} className="w-full bg-primary/80 hover:bg-primary py-2 rounded font-medium text-sm disabled:opacity-50">{loading? 'Registering...':'Register'}</button>
      </form>
      <p className="text-xs text-slate-400 mt-4">Have an account? <Link to="/voter/login" className="text-primary">Login</Link></p>
    </div>
  );
};
