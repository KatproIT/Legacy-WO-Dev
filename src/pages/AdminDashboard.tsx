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
  const [filter, setFilter] = useState<'all' | 'submitted' | 'not_submitted'>('all');
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

  const filteredSubmissions = submissions.filter(sub => {
    if (filter === 'all') return true;
    if (filter === 'submitted') return sub.http_post_sent === true;
    if (filter === 'not_submitted') return !sub.http_post_sent;
    return true;
  });

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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-20 object-contain"
              />
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            <button
              onClick={() => navigate('/form/new')}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Form
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="section-card">
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2.5 font-semibold rounded-lg transition-all ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setFilter('not_submitted')}
                className={`px-6 py-2.5 font-semibold rounded-lg transition-all ${
                  filter === 'not_submitted'
                    ? 'bg-yellow-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Not Submitted ({submissions.filter(s => !s.http_post_sent).length})
              </button>
              <button
                onClick={() => setFilter('submitted')}
                className={`px-6 py-2.5 font-semibold rounded-lg transition-all ${
                  filter === 'submitted'
                    ? 'bg-green-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Submitted to PA ({submissions.filter(s => s.http_post_sent === true).length})
              </button>
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
            <div className="table-wrapper">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job/PO #</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Site Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Technician</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission, index) => (
                    <tr
                      key={submission.id}
                      className="border-b border-gray-200 hover:bg-blue-50 transition-colors bg-white"
                    >
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4 font-semibold text-gray-900">{submission.job_po_number || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{submission.customer || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{submission.site_name || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{submission.technician || '-'}</td>
                      <td className="px-6 py-4 text-gray-700">{submission.date || '-'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(submission.created_at)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/form/${submission.job_po_number}`)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-all rounded-lg font-medium"
                          >
                            <ExternalLink size={16} />
                            Open
                          </button>
                          <button
                            onClick={() => handleDeleteClick(submission)}
                            disabled={deleting === submission.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-all rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
