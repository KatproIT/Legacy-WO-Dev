import { useEffect, useState } from 'react';
import { X, CheckCircle, XCircle, Forward, FileText, Clock } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const API =
  (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL as string).trim()) ||
  'https://legacywobe.azurewebsites.net/api';

interface HistoryEntry {
  id: number;
  form_id: string;
  action: string;
  actor_email: string;
  note?: string;
  forwarded_to_email?: string;
  created_at: string;
}

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: string;
}

const actionConfig: Record<string, { icon: any; color: string; label: string }> = {
  submitted: { icon: FileText, color: 'text-blue-600', label: 'Submitted' },
  resubmitted: { icon: FileText, color: 'text-blue-600', label: 'Resubmitted' },
  rejected: { icon: XCircle, color: 'text-red-600', label: 'Rejected' },
  forwarded: { icon: Forward, color: 'text-purple-600', label: 'Forwarded' },
  approved: { icon: CheckCircle, color: 'text-green-600', label: 'Approved' }
};

export function HistoryModal({ isOpen, onClose, formId }: HistoryModalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && formId) {
      loadHistory();
    }
  }, [isOpen, formId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await authFetch(`${API}/workflow/history/${formId}`);
      if (!res.ok) {
        throw new Error('Failed to load history');
      }

      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError('Failed to load workflow history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const extractNameFromEmail = (email: string) => {
    const localPart = email.split('@')[0];
    const parts = localPart.split('.');
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const lastName = parts[1] ? parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase() : '';
    return lastName ? `${firstName} ${lastName}` : firstName;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Work Order History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-500">Loading history...</div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && history.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <Clock size={48} className="mb-4 text-gray-300" />
              <p>No workflow history available</p>
            </div>
          )}

          {!loading && !error && history.length > 0 && (
            <div className="space-y-4">
              {history.map((entry, index) => {
                const config = actionConfig[entry.action] || {
                  icon: FileText,
                  color: 'text-gray-600',
                  label: entry.action
                };
                const Icon = config.icon;

                return (
                  <div
                    key={entry.id}
                    className="relative pl-8 pb-6 border-l-2 border-gray-200 last:border-l-0 last:pb-0"
                  >
                    <div
                      className={`absolute left-0 top-0 -translate-x-[9px] w-5 h-5 rounded-full bg-white border-2 flex items-center justify-center ${
                        entry.action === 'approved' ? 'border-green-500' :
                        entry.action === 'rejected' ? 'border-red-500' :
                        entry.action === 'forwarded' ? 'border-purple-500' :
                        'border-blue-500'
                      }`}
                    >
                      <Icon size={12} className={config.color} />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Icon size={18} className={config.color} />
                          <span className="font-semibold text-gray-900">{config.label}</span>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(entry.created_at)}</span>
                      </div>

                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          <span className="text-gray-500">By:</span>{' '}
                          <span className="font-medium">{extractNameFromEmail(entry.actor_email)}</span>
                          {' '}
                          <span className="text-gray-400">({entry.actor_email})</span>
                        </p>

                        {entry.note && (
                          <p>
                            <span className="text-gray-500">Note:</span>{' '}
                            <span className="italic text-gray-700">"{entry.note}"</span>
                          </p>
                        )}

                        {entry.forwarded_to_email && (
                          <p>
                            <span className="text-gray-500">Forwarded to:</span>{' '}
                            <span className="font-medium">{extractNameFromEmail(entry.forwarded_to_email)}</span>
                            {' '}
                            <span className="text-gray-400">({entry.forwarded_to_email})</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
