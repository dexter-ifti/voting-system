import { useState } from 'react';
import { api } from '../../lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

export const CreateElectionPage = () => {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title:'', description:'', electionType:'presidential', adminPrivateKey:'' });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.role.includes('admin')) return toast.error('Unauthorized');
    setLoading(true);
    try {
      const { data } = await api.post('/election/create', form);
      if (data.success) {
        toast.success('Election created');
        navigate(`/elections/${data.data.contractAddress}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      <h1 className="text-2xl font-semibold mb-6">Create Election</h1>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs mb-1">Title</label>
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} required className="w-full" />
        </div>
        <div>
          <label className="block text-xs mb-1">Description</label>
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} required className="w-full h-32" />
        </div>
        <div>
          <label className="block text-xs mb-1">Election Type</label>
          <select value={form.electionType} onChange={e=>setForm(f=>({...f,electionType:e.target.value}))} className="w-full">
            <option value="presidential">Presidential</option>
            <option value="parliamentary">Parliamentary</option>
            <option value="local">Local</option>
            <option value="referendum">Referendum</option>
            <option value="student">Student</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Admin Private Key (deployment)</label>
          <input value={form.adminPrivateKey} onChange={e=>setForm(f=>({...f,adminPrivateKey:e.target.value}))} required className="w-full" />
        </div>
        <button disabled={loading} className="w-full bg-primary/80 hover:bg-primary py-2 rounded font-medium text-sm disabled:opacity-50">{loading? 'Deploying...':'Create & Deploy'}</button>
      </form>
    </div>
  );
};
