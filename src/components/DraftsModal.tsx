import { useEffect, useState } from 'react';
import { X, Trash2, FileText } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const API =
  (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL as string).trim()) ||
  'https://legacywobe.azurewebsites.net/api';

interface Draft {
  id: string;
  job_po_number: string;
  customer: string;
  created_at: string;
  updated_at: string;
}

interface DraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draftId: string) => void;
  userEmail: string;
}

export function DraftsModal({ isOpen, onClose, onLoadDraft, userEmail }: DraftsModalProps) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
    }
  }, [isOpen]);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(`${API}/forms/drafts?email=${encodeURIComponent(userEmail)}`);
      if (!res.ok) {
        throw new Error('Failed to load drafts');
      }

      const data = await res.json();
      setDrafts(data);
    } catch (err) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const res = await authFetch(`${API}/forms/${draftId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete draft');
      }

      setDrafts(drafts.filter(d => d.id !== draftId));
    } catch (err) {
      console.error('Error deleting draft:', err);
      alert('Failed to delete draft');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">MY DRAFTS</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="text-center py-8 text-gray-500">
              LOADING DRAFTS...
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-red-600">
              {error}
            </div>
          )}

          {!loading && !error && drafts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>NO DRAFTS FOUND</p>
            </div>
          )}

          {!loading && !error && drafts.length > 0 && (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {draft.job_po_number || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Customer: {draft.customer || 'Not specified'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last saved: {formatDate(draft.updated_at)}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => onLoadDraft(draft.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(draft.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete draft"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
