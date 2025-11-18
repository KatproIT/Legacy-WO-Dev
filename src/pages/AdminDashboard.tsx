import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FormSubmission } from '../types/form';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FileText, Clock, CheckCircle, ExternalLink, Plus, Trash2 } from 'lucide-react';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  // filter state removed as it's not used; keep simple dashboard for now
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
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions;

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

  const performDelete = async (id: string) => {
    setDeleting(id);
    try {
      const { error } = await supabase
        .from('form_submissions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSubmissions(prev => prev.filter(s => s.id !== id));
      showToast('Form deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting form:', error);
      showToast('Error deleting form', 'error');
    } finally {
      setDeleting(null);
    }
  };

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
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="px-3 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-semibold rounded-lg transition-all bg-blue-600 hover:bg-green-600 text-white shadow-md">
                All ({submissions.length})
              </div>
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
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg mb-1">
                          {submission.job_po_number || '-'}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
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
                    <div className="space-y-1 text-sm mb-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Site:</span>
                        <span className="text-gray-900">{submission.site_name || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Technician:</span>
                        <span className="text-gray-900">{submission.technician || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date:</span>
                        <span className="text-gray-900">{submission.date || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Created:</span>
                        <span className="text-gray-900 text-xs">{formatDate(submission.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/form/${submission.job_po_number}`)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded-lg font-medium text-sm"
                      >
                        <ExternalLink size={14} />
                        Open
                      </button>
                      <button
                        onClick={() => handleDeleteClick(submission)}
                        disabled={deleting === submission.id}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 text-white hover:bg-red-700 transition-all rounded-lg font-medium text-sm disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        {deleting === submission.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block table-wrapper">
                <table className="w-full border-collapse">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job/PO #</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Site Name</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Technician</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                      <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-gray-200 hover:bg-blue-50 transition-colors bg-white"
                      >
                        <td className="px-4 lg:px-6 py-3 lg:py-4">
                          {submission.http_post_sent ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg">
                              <CheckCircle size={16} />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold rounded-lg">
                              <Clock size={16} />
                              Not Submitted
                            </span>
                          )}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 font-semibold text-gray-900">{submission.job_po_number || '-'}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">{submission.customer || '-'}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">{submission.site_name || '-'}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">{submission.technician || '-'}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-gray-700">{submission.date || '-'}</td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm text-gray-500">
                          {formatDate(submission.created_at)}
                        </td>
                        <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/form/${submission.job_po_number}`)}
                              className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded-lg font-medium text-sm"
                            >
                              <ExternalLink size={16} />
                              Open
                            </button>
                            <button
                              onClick={() => handleDeleteClick(submission)}
                              disabled={deleting === submission.id}
                              className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-all rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="section-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">{submissions.length}</p>
              </div>
              <FileText size={40} className="text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Not Submitted</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {submissions.filter(s => !s.http_post_sent).length}
                </p>
              </div>
              <Clock size={40} className="text-yellow-600 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Submitted to Power Automate</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {submissions.filter(s => s.http_post_sent === true).length}
                </p>
              </div>
              <CheckCircle size={40} className="text-green-600 opacity-50" />
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border-l-4 ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-500'
            : 'bg-red-50 text-red-800 border-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={22} className="flex-shrink-0" /> : <FileText size={22} className="flex-shrink-0" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

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
