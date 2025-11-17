import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiDelete } from "../lib/api";
import { FormSubmission } from "../types/form";
import { ConfirmDialog } from "../components/ConfirmDialog";
import {
  FileText,
  Clock,
  CheckCircle,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";

export function AdminDashboard() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // -----------------------------
  // LOAD ALL SUBMISSIONS (Azure API)
  // -----------------------------
  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const data = await apiGet("/forms");
      setSubmissions(data || []);
    } catch (error) {
      console.error("Error loading submissions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteClick = (submission: FormSubmission) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Form Submission?",
      message: `Are you sure you want to permanently delete Job/PO # "${submission.job_po_number}"?`,
      onConfirm: () => performDelete(submission.id!),
    });
  };

  // -----------------------------
  // DELETE FORM (Azure API)
  // -----------------------------
  const performDelete = async (id: string) => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    setDeleting(id);

    try:
      await apiDelete(`/forms/${id}`);

      setSubmissions((prev) => prev.filter((s) => s.id !== id));
      showToast("Form deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting form:", error);
      showToast("Error deleting form", "error");
    } finally {
      setDeleting(null);
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  if (loading)
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );

  const filtered = submissions;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <div className="bg-white shadow border-b">
        <div className="max-w-5xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/image.png" className="h-16" alt="Logo" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>

          <button
            onClick={() => navigate("/form/new")}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} /> New Form
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="section-card">
          {/* SUMMARY */}
          <div className="flex justify-between mb-6">
            <div className="font-semibold text-blue-700 bg-blue-100 px-4 py-2 rounded-lg">
              All ({filtered.length})
            </div>
          </div>

          {/* IF EMPTY */}
          {filtered.length === 0 && (
            <div className="text-center py-20">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-xl font-semibold">
                No submissions yet
              </p>

              <button
                onClick={() => navigate("/form/new")}
                className="btn-primary mt-6"
              >
                Create First Form
              </button>
            </div>
          )}

          {/* TABLE */}
          {filtered.length > 0 && (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="table-head">Status</th>
                    <th className="table-head">Job/PO #</th>
                    <th className="table-head">Customer</th>
                    <th className="table-head">Site</th>
                    <th className="table-head">Technician</th>
                    <th className="table-head">Date</th>
                    <th className="table-head">Created</th>
                    <th className="table-head text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-blue-50 bg-white border-b">
                      <td className="table-cell">
                        {s.http_post_sent ? (
                          <span className="status-success">
                            <CheckCircle size={16} /> Submitted
                          </span>
                        ) : (
                          <span className="status-warning">
                            <Clock size={16} /> Pending
                          </span>
                        )}
                      </td>

                      <td className="table-cell font-semibold">{s.job_po_number}</td>
                      <td className="table-cell">{s.customer || "-"}</td>
                      <td className="table-cell">{s.site_name || "-"}</td>
                      <td className="table-cell">{s.technician || "-"}</td>
                      <td className="table-cell">{s.date || "-"}</td>
                      <td className="table-cell text-sm text-gray-500">
                        {formatDate(s.created_at)}
                      </td>

                      <td className="table-cell text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/form/${s.job_po_number}`)
                            }
                            className="btn-primary-sm"
                          >
                            <ExternalLink size={15} /> Open
                          </button>

                          <button
                            onClick={() => handleDeleteClick(s)}
                            disabled={deleting === s.id}
                            className="btn-danger-sm disabled:opacity-50"
                          >
                            <Trash2 size={15} />
                            {deleting === s.id ? "..." : "Delete"}
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

        {/* SUMMARY STATS */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="summary-card">
            <p>Total Submissions</p>
            <h1>{submissions.length}</h1>
            <FileText size={40} className="summary-icon text-blue-500" />
          </div>

          <div className="summary-card">
            <p>Pending</p>
            <h1 className="text-yellow-600">
              {submissions.filter((s) => !s.http_post_sent).length}
            </h1>
            <Clock size={40} className="summary-icon text-yellow-500" />
          </div>

          <div className="summary-card">
            <p>Submitted</p>
            <h1 className="text-green-600">
              {submissions.filter((s) => s.http_post_sent).length}
            </h1>
            <CheckCircle size={40} className="summary-icon text-green-500" />
          </div>
        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-lg border-l-4 ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border-green-500"
              : "bg-red-50 text-red-700 border-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      />
    </div>
  );
}
