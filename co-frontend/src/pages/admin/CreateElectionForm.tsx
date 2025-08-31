import { useState } from 'react';
import { api } from '../../lib/api';

interface CreateElectionFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateElectionForm = ({ onClose, onSuccess }: CreateElectionFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    electionType: 'presidential',
    adminPrivateKey: '',
    registrationStartTime: '',
    registrationEndTime: '',
    votingStartTime: '',
    votingEndTime: '',
    maxCandidates: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        maxCandidates: parseInt(formData.maxCandidates.toString()),
        ...(formData.registrationStartTime && { registrationStartTime: new Date(formData.registrationStartTime).toISOString() }),
        ...(formData.registrationEndTime && { registrationEndTime: new Date(formData.registrationEndTime).toISOString() }),
        ...(formData.votingStartTime && { votingStartTime: new Date(formData.votingStartTime).toISOString() }),
        ...(formData.votingEndTime && { votingEndTime: new Date(formData.votingEndTime).toISOString() })
      };

      const { data } = await api.post('/election/create', payload);
      
      if (data.success) {
        onSuccess();
        alert('Election created successfully!');
      } else {
        setError(data.message || 'Failed to create election');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to create election');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold">Create New Election</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Election Type</label>
                <select
                  name="electionType"
                  value={formData.electionType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                >
                  <option value="presidential">Presidential</option>
                  <option value="parliamentary">Parliamentary</option>
                  <option value="local">Local</option>
                  <option value="referendum">Referendum</option>
                  <option value="student">Student</option>
                  <option value="corporate">Corporate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Candidates</label>
                <input
                  type="number"
                  name="maxCandidates"
                  value={formData.maxCandidates}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration Start</label>
                <input
                  type="datetime-local"
                  name="registrationStartTime"
                  value={formData.registrationStartTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Registration End</label>
                <input
                  type="datetime-local"
                  name="registrationEndTime"
                  value={formData.registrationEndTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Voting Start</label>
                <input
                  type="datetime-local"
                  name="votingStartTime"
                  value={formData.votingStartTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Voting End</label>
                <input
                  type="datetime-local"
                  name="votingEndTime"
                  value={formData.votingEndTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Admin Private Key *</label>
                <input
                  type="password"
                  name="adminPrivateKey"
                  value={formData.adminPrivateKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background"
                  placeholder="Enter your private key to deploy the election contract..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This will be used to deploy the election smart contract. Keep it secure!
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Creating Election...' : 'Create Election'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
