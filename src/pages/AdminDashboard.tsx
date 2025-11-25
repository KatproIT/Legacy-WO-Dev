import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSubmission } from '../types/form';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FileText, Clock, CheckCircle, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const API =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  "https://legacywobe.azurewebsites.net/api";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter] = useState<'all'>('all');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await authFetch(`${API}/forms`);
      if (!res.ok) throw new Error("Failed to load submissions");

      const data = await res.json();
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await authFetch(`${API}/forms/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("Failed to delete");

      setSubmissions(prev => prev.filter(s => s.id !== id));
      showToast('Form deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting form:', error);
      showToast('Error deleting form', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteClick = (submission: FormSubmission) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Form Submission?',
      message: `Are you sure you want to permanently delete the form for Job/PO # "${submission.job_po_number}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        await performDelete(submission.id!);
      }
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredSubmissions = submissions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-12 sm:h-20 object-contain"
              />
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
              onClick={() => navigate('/form/new')}
              className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
              New Form
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="section-card">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold rounded-lg bg-blue-600 text-white shadow-md">
              All ({submissions.length})
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-xl font-medium mb-6">No submissions found</p>
              <button
                onClick={() => navigate('/form/new')}
                className="btn-primary"
              >
                Create First Form
              </button>
            </div>
          ) : (
            <>
              {/* --- MOBILE LIST --- */}
              <div className="block md:hidden space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-gray-900 text-lg">
                          {submission.job_po_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          {submission.customer || '-'}
                        </div>
                      </div>

                      {submission.http_post_sent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded">
                          <CheckCircle size={14} />
                          Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-semibold rounded">
                          <Clock size={14} />
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-700 space-y-1 mb-3">
                      <div>Site: {submission.site_name || '-'}</div>
                      <div>Technician: {submission.technician || '-'}</div>
                      <div>Date: {submission.date || '-'}</div>
                      <div className="text-xs text-gray-500">Created: {formatDate(submission.created_at)}</div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/form/${submission.id}/${submission.job_po_number}`)}
                        className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1.5"
                      >
                        <ExternalLink size={14} />
                        Open
                      </button>
                      <button
                        onClick={() => handleDeleteClick(submission)}
                        disabled={deleting === submission.id}
                        className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deleting === submission.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* --- DESKTOP TABLE --- */}
              <div className="hidden md:block">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Job/PO #</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Site</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Technician</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Created</th>
                      <th className="px-6 py-4 text-center text-xs font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr key={submission.id} className="border-b hover:bg-blue-50 bg-white">
                        <td className="px-6 py-4">
                          {submission.http_post_sent ? (
                            <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg inline-flex items-center gap-1.5">
                              <CheckCircle size={16} />
                              Submitted
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold rounded-lg inline-flex items-center gap-1.5">
                              <Clock size={16} />
                              Pending
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 font-semibold">{submission.job_po_number}</td>
                        <td className="px-6 py-4">{submission.customer || '-'}</td>
                        <td className="px-6 py-4">{submission.site_name || '-'}</td>
                        <td className="px-6 py-4">{submission.technician || '-'}</td>
                        <td className="px-6 py-4">{submission.date || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{formatDate(submission.created_at)}</td>

                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/form/${submission.id}/${submission.job_po_number}`)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
                            >
                              <ExternalLink size={16} />
                              Open
                            </button>
                            <button
                              onClick={() => handleDeleteClick(submission)}
                              disabled={deleting === submission.id}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:opacity-50"
                            >
                              <Trash2 size={16} />
                              {deleting === submission.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="section-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{submissions.length}</p>
              </div>
              <FileText size={40} className="text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="section-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Not Submitted</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {submissions.filter(s => !s.http_post_sent).length}
                </p>
              </div>
              <Clock size={40} className="text-yellow-600 opacity-50" />
              {localStorage.getItem("userRole") === "superadmin" && (
  <button
    onClick={() => navigate('/admin/users')}
    className="btn-secondary"
  >
    Manage Users
  </button>
)}

            </div>
          </div>

          <div className="section-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Submitted to Power Automate</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {submissions.filter(s => s.http_post_sent).length}
                </p>
              </div>
              <CheckCircle size={40} className="text-green-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border-l-4 ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-500'
            : 'bg-red-50 text-red-800 border-red-500'
        }`}>
          <CheckCircle size={22} className="flex-shrink-0" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
