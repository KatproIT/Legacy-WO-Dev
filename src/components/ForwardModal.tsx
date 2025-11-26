import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { extractNameFromEmail } from '../utils/userRoles';
import { authFetch } from '../utils/authFetch';

const API =
  (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL as string).trim()) ||
  'https://legacywobe.azurewebsites.net/api';

interface ForwardModalProps {
  onClose: () => void;
  onSubmit: (technicianEmail: string) => void;
}

interface Technician {
  id: string;
  email: string;
}

export default function ForwardModal({ onClose, onSubmit }: ForwardModalProps) {
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [error, setError] = useState('');
  const [technicians, setTechnicians] = useState<Array<{ email: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await authFetch(`${API}/auth/technicians`);
        if (!res.ok) {
          throw new Error('Failed to fetch technicians');
        }
        const data: Technician[] = await res.json();
        const techList = data.map(tech => ({
          email: tech.email,
          name: extractNameFromEmail(tech.email)
        }));
        setTechnicians(techList);
      } catch (err) {
        console.error('Error fetching technicians:', err);
        setError('Failed to load technicians');
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicians();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTechnician) {
      setError('Please select a technician');
      return;
    }

    onSubmit(selectedTechnician);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Forward Form</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-gray-600 mb-4">
            Select a technician to forward this form to
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="technician" className="block text-sm font-medium text-gray-700 mb-2">
                Technician <span className="text-red-600">*</span>
              </label>
              <select
                id="technician"
                value={selectedTechnician}
                onChange={(e) => {
                  setSelectedTechnician(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                disabled={loading}
              >
                <option value="">
                  {loading ? 'Loading technicians...' : 'Select a technician...'}
                </option>
                {technicians.map((tech) => (
                  <option key={tech.email} value={tech.email}>
                    {tech.name}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Forward
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
