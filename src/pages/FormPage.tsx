// src/pages/FormPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormSubmission } from '../types/form';
import { FormTabs } from '../components/FormTabs';
import { GeneralInfoSection } from '../components/GeneralInfoSection';
import { EquipmentDetailsSection } from '../components/EquipmentDetailsSection';
import { MaintenanceInfoSection } from '../components/MaintenanceInfoSection';
import { SystemChecksSection } from '../components/SystemChecksSection';
import { DynamicTablesSection } from '../components/DynamicTablesSection';
import { WorkLogSection } from '../components/WorkLogSection';
import { AdditionalATSSection } from '../components/AdditionalATSSection';
import { LoadBankReportSection } from '../components/LoadBankReportSection';
import { ConfirmDialog } from '../components/ConfirmDialog';
import RejectModal from '../components/RejectModal';
import ForwardModal from '../components/ForwardModal';
import { extractNameFromEmail } from '../utils/userRoles';
import { validateLoadBankReport, validateServiceReport } from '../utils/formValidation';
import { Save, CheckCircle, AlertCircle, Printer, Edit, Lock, XCircle, Forward } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

/**
 * API base URL (trim and fallback)
 */
const API =
  (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL as string).trim()) ||
  'https://legacy-wo-backend-agefgdh7eec7esag.southindia-01.azurewebsites.net/api';

/**
 * Reserved top-level keys which should remain outside `data` column when writing to backend
 */
const RESERVED_TOP_LEVEL_KEYS = new Set([
  'id',
  'job_po_number',
  'status',
  'submitted_at',
  'created_at',
  'updated_at',
  'date',
  'technician',
  'customer',
  'site_name',
  'site_address',
  'type_of_service',
  'contact_name',
  'contact_phone',
  'contact_email',
  'next_inspection_due',
  'http_post_sent',
  'is_rejected',
  'is_forwarded',
  'rejection_note',
  'forwarded_to_email',
  'workflow_timestamp'
]);

function deepMerge(target: any, source: any) {
  if (!source) return target;
  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = target[key];

    if (sVal && typeof sVal === 'object' && !Array.isArray(sVal)) {
      if (!tVal || typeof tVal !== 'object' || Array.isArray(tVal)) {
        target[key] = {};
      }
      deepMerge(target[key], sVal);
    } else {
      target[key] = sVal;
    }
  }
  return target;
}

function unpackForm(raw: any): FormSubmission {
  if (!raw) return {} as FormSubmission;

  const dataPart = raw.data && typeof raw.data === 'object' ? raw.data : {};
  const base = { ...raw };
  delete (base as any).data;

  const merged = deepMerge(base, dataPart);
  delete (merged as any).data;
  return merged as FormSubmission;
}

function packForm(form: FormSubmission): any {
  const topLevel: any = {};
  const data: any = {};

  Object.keys(form).forEach((k) => {
    const v = (form as any)[k];
    if (typeof v === 'undefined') return;

    if (RESERVED_TOP_LEVEL_KEYS.has(k)) {
      topLevel[k] = v;
    } else {
      data[k] = v;
    }
  });

  if (!topLevel.job_po_number && (form as any).job_po_number) {
    topLevel.job_po_number = (form as any).job_po_number;
  }

  topLevel.data = data;
  return topLevel;
}

function setByPath(obj: any, path: string, value: any) {
  if (!path) return obj;
  if (typeof value === 'object' && value !== null && !Array.isArray(value) && path.indexOf('.') === -1) {
    obj[path] = value;
    return obj;
  }

  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (typeof cur[k] !== 'object' || cur[k] === null || Array.isArray(cur[k])) {
      cur[k] = {};
    }
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
  return obj;
}

export function FormPage() {
  const { jobNumber } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormSubmission>({
    job_po_number: jobNumber || '',
    status: 'submitted'
  } as FormSubmission);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isNewForm, setIsNewForm] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'warning' | 'info' | 'danger';
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [isUserPM, setIsUserPM] = useState(false);
  const [isUserTechnician, setIsUserTechnician] = useState(false);
  const [hasServiceReportErrors, setHasServiceReportErrors] = useState(false);
  const [hasLoadBankErrors, setHasLoadBankErrors] = useState(false);

  // Initialize user info from localStorage and load form if needed
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    if (!email) {
      // Not logged in — redirect to login
      navigate('/login');
      return;
    }
    setUserEmail(email);
    setUserRole(role);

    const isPMRole = role === 'pm' || role === 'admin' || role === 'superadmin';
    const isTech = role === 'technician';
    setIsUserPM(isPMRole);
    setIsUserTechnician(isTech);

    if (email) {
      // If opening an existing form, load it
      if (jobNumber && jobNumber !== 'new') {
        loadFormData(jobNumber, email, role);
        setIsNewForm(false);
      } else {
        setIsNewForm(true);
        setIsReadOnly(false);
        // if creating new and technician, prefill technician fields
        if (isTech) {
          const techName = extractNameFromEmail(email);
          setFormData(prev => ({ ...prev, technician: techName, submitted_by_email: email }));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobNumber, navigate]);

  // ---------- Load form ----------
  const loadFormData = async (jobNum: string, email?: string | null, role?: string | null) => {
    try {
      setLoading(true);

      const res = await authFetch(`${API}/forms/job/${encodeURIComponent(jobNum)}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          showToast('Form not found', 'error');
          navigate('/');
          return;
        }
        if (res.status === 401) {
          // Unauthorized — probably token expired
          localStorage.removeItem('token');
          localStorage.removeItem('userEmail');
          localStorage.removeItem('userRole');
          navigate('/login');
          return;
        }
        throw new Error('Failed to load form');
      }

      const raw = await res.json();
      const unpacked = unpackForm(raw);

      // If user is a technician, override some fields
      const roleToCheck = role || localStorage.getItem('userRole');
      const emailToCheck = email || localStorage.getItem('userEmail');
      if (roleToCheck === 'technician' && emailToCheck) {
        const technicianName = extractNameFromEmail(emailToCheck);
        unpacked.technician = technicianName;
        unpacked.submitted_by_email = emailToCheck;
      }

      setFormData(unpacked);
      setIsReadOnly(Boolean((raw as any).is_rejected || (raw as any).is_forwarded));
    } catch (error) {
      console.error('Error loading form:', error);
      showToast('Error loading form', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Validation ----------
  const validateForm = (): boolean => {
    const errors: string[] = [];

    const serviceReportValidation = validateServiceReport(formData);
    if (!serviceReportValidation.isValid) {
      errors.push(...serviceReportValidation.errors);
      setHasServiceReportErrors(true);
    } else {
      setHasServiceReportErrors(false);
    }

    const loadBankValidation = validateLoadBankReport(formData);
    if (!loadBankValidation.isValid) {
      errors.push(...loadBankValidation.errors);
      setHasLoadBankErrors(true);
    } else {
      setHasLoadBankErrors(false);
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // ---------- Save (create or update) ----------
  const handleSaveForm = async () => {
    if (!validateForm()) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    setSaving(true);

    try {
      const submissionPayload = packForm({
        ...formData,
        status: 'draft',
        submitted_by_email: userEmail || (formData as any).submitted_by_email
      });

      let savedData: any = null;

      if (formData.id) {
        const res = await authFetch(`${API}/forms/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Failed to update');
        }

        savedData = await res.json();
      } else {
        const res = await authFetch(`${API}/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });

        if (res.status === 409) {
          showToast(`Job/PO # "${submissionPayload.job_po_number}" already exists. Please use a different number.`, 'error');
          setSaving(false);
          return;
        }

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Failed to create');
        }

        savedData = await res.json();
      }

      const unpacked = unpackForm(savedData);
      setFormData(unpacked);

      if (!jobNumber || jobNumber === 'new') {
        navigate(`/form/${(unpacked as FormSubmission).job_po_number}`, { replace: true });
      }

      setIsReadOnly(true);
      showToast('Form saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving form:', error);
      showToast('Error saving form', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Submit flow ----------
  const handleSubmit = async () => {
    if (!validateForm()) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Submit to Work Order?',
      message: 'Are you sure you want to submit this form?.',
      type: 'warning',
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        await performSubmit();
      }
    });
  };

  const performSubmit = async () => {
    if (!validateForm()) {
      showToast('Please complete all required fields', 'error');
      return;
    }

    setSaving(true);

    try {
      const submissionPayload = packForm({
        ...formData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        submitted_by_email: userEmail || (formData as any).submitted_by_email
      });

      let savedData: any = null;

      if (formData.id) {
        const res = await authFetch(`${API}/forms/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });

        if (!res.ok) throw new Error('Failed to update before submit');
        savedData = await res.json();
      } else {
        const res = await authFetch(`${API}/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });

        if (res.status === 409) {
          showToast(`Job/PO # "${submissionPayload.job_po_number}" already exists. Please use a different number.`, 'error');
          setSaving(false);
          return;
        }
        if (!res.ok) throw new Error('Failed to create before submit');
        savedData = await res.json();
        setIsNewForm(false);
      }

      // call backend workflow submit
      const wf = await authFetch(`${API}/workflow/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedData!.id })
      });

      if (!wf.ok) {
        console.error('Workflow submit failed', await wf.text());
      }

      // Refresh saved data
      if (savedData) {
        const refreshRes = await authFetch(`${API}/forms/${savedData.id}`);
        if (refreshRes.ok) {
          const refreshedRaw = await refreshRes.json();
          const refreshed = unpackForm(refreshedRaw);
          setFormData(refreshed);
        }
      }

      if (!jobNumber || jobNumber === 'new') {
        navigate(`/form/${savedData!.job_po_number}`, { replace: true });
      }

      showToast('WO submitted successfully', 'success');
      setIsReadOnly(true);
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Error submitting form', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Reject ----------
  const handleReject = async (note: string) => {
    try {
      setSaving(true);
      setShowRejectModal(false);

      const payload = { id: formData.id, note };
      const res = await authFetch(`${API}/workflow/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Reject failed');
      }

      if (formData.id) {
        const refreshRes = await authFetch(`${API}/forms/${formData.id}`);
        if (refreshRes.ok) {
          const refreshedRaw = await refreshRes.json();
          const refreshed = unpackForm(refreshedRaw);
          setFormData(refreshed);
        }
      }

      // Persist any changes
      await handleSaveForm();

      setIsReadOnly(true);
      showToast('Form rejected successfully', 'success');
    } catch (error) {
      console.error('Error rejecting form:', error);
      showToast('Error rejecting form', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Forward ----------
  const handleForward = async (technicianEmail: string) => {
    try {
      setSaving(true);
      setShowForwardModal(false);

      const payload = { id: formData.id, to: technicianEmail };
      const res = await authFetch(`${API}/workflow/forward`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Forward failed');
      }

      // Refresh form
      if (formData.id) {
        const refreshRes = await authFetch(`${API}/forms/${formData.id}`);
        if (refreshRes.ok) {
          const refreshedRaw = await refreshRes.json();
          const refreshed = unpackForm(refreshedRaw);
          setFormData(refreshed);
        }
      }

      await handleSaveForm();
      setIsReadOnly(true);
      showToast('Form forwarded successfully', 'success');
    } catch (error) {
      console.error('Error forwarding form:', error);
      showToast('Error forwarding form', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Helpers ----------
  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => {
      const updated = { ...prev };
      setByPath(updated, field, value);
      return updated;
    });

    if (validationErrors.length > 0) {
      validateForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [validationErrors]);

  const getFieldError = (value: any): boolean => {
    if (validationErrors.length === 0) return false;
    return !value || value === '' || (Array.isArray(value) && value.length === 0);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEnableEdit = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Enable Edit Mode?',
      message: 'You are about to edit this form. Make sure to save your changes when done.',
      type: 'info',
      onConfirm: () => {
        setIsReadOnly(false);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        showToast('Edit mode enabled', 'success');
      }
    });
  };

  // ---------- UI ----------
  if (!userEmail) {
    // Fallback: if userEmail is missing redirect to login
    navigate('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-lg border-b border-gray-200 no-print">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-6">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-12 sm:h-20 object-contain"
              />
              {isReadOnly && (
                <span className="px-2 py-1 sm:px-4 sm:py-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold rounded-lg flex items-center gap-1 sm:gap-2">
                  <Lock size={14} className="sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Read-Only Mode</span>
                  <span className="sm:hidden">Read-Only</span>
                </span>
              )}
              {formData.id && (formData as any).http_post_sent && (
                <span className="px-2 py-1 sm:px-4 sm:py-2 bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-semibold rounded-lg">
                  ✓ <span className="hidden sm:inline">Submitted to Power Automate</span>
                  <span className="sm:hidden">Submitted</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={handlePrint}
                className="btn-secondary flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center"
              >
                <Printer size={16} className="sm:w-[18px] sm:h-[18px]" />
                <span className="text-sm sm:text-base">Print</span>
              </button>

              {isUserPM && !isReadOnly && formData.id && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={saving}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center"
                  >
                    <XCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Reject
                  </button>
                  <button
                    onClick={() => setShowForwardModal(true)}
                    disabled={saving}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base flex-1 sm:flex-initial justify-center"
                  >
                    <Forward size={16} className="sm:w-[18px] sm:h-[18px]" />
                    Forward
                  </button>
                </>
              )}

              {isReadOnly ? (
                <button
                  onClick={handleEnableEdit}
                  className="btn-primary flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center"
                >
                  <Edit size={16} className="sm:w-[18px] sm:h-[18px]" />
                  <span className="text-sm sm:text-base">Enable Edit</span>
                </button>
              ) : (
                <>
                  {formData.id && (
                    <button
                      onClick={handleSaveForm}
                      disabled={saving || isReadOnly}
                      className="btn-primary flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center"
                    >
                      <Save size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="text-sm sm:text-base">{saving ? 'Saving...' : 'Save Form'}</span>
                    </button>
                  )}

                  {!formData.id && !((formData as any).http_post_sent) && (
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="btn-success flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center"
                    >
                      <CheckCircle size={16} className="sm:w-[18px] sm:h-[18px]" />
                      <span className="text-sm sm:text-base">{saving ? 'Submitting...' : 'Submit Work Order'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed top-4 right-4 sm:top-6 sm:right-6 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl shadow-2xl z-50 flex items-center gap-2 sm:gap-3 border-l-4 no-print max-w-[calc(100%-2rem)] sm:max-w-md ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-500'
            : 'bg-red-50 text-red-800 border-red-500'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} className="sm:w-[22px] sm:h-[22px] flex-shrink-0" /> : <AlertCircle size={18} className="sm:w-[22px] sm:h-[22px] flex-shrink-0" />}
          <span className="font-medium text-sm sm:text-base">{toast.message}</span>
        </div>
      )}

      {validationErrors.length > 0 && (
        <div className="max-w-5xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6 no-print">
          <div className="bg-amber-50 border-l-4 border-amber-500 rounded-lg shadow p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 text-base mb-2">
                  Please complete the following required fields:
                </h3>
                <ul className="space-y-1">
                  {validationErrors.slice(0, 5).map((error, index) => (
                    <li key={index} className="text-amber-800 text-sm flex items-start gap-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
                {validationErrors.length > 5 && (
                  <p className="text-amber-700 text-sm mt-2 font-medium">
                    ... and {validationErrors.length - 5} more field{validationErrors.length - 5 !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 print-container">
        <div className="no-print">
          <FormTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasServiceReportErrors={hasServiceReportErrors}
            hasLoadBankErrors={hasLoadBankErrors}
          />
        </div>

        <div className="mt-8">
          <div className={activeTab !== 0 ? 'hidden print:block' : ''}>
            <div className="space-y-6">
              <GeneralInfoSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
                isExistingForm={!isNewForm}
              />
              <EquipmentDetailsSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
              <SystemChecksSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
              <MaintenanceInfoSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
              <DynamicTablesSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
              <WorkLogSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
            </div>
          </div>

          <div className={activeTab !== 1 ? 'hidden print:block' : ''}>
            <div className="section-card">
              <AdditionalATSSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
            </div>
          </div>

          <div className={activeTab !== 2 ? 'hidden print:block' : ''}>
            <div className="section-card">
              <LoadBankReportSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Confirm"
        cancelText="Cancel"
      />

      {showRejectModal && (
        <RejectModal
          onClose={() => setShowRejectModal(false)}
          onSubmit={handleReject}
        />
      )}

      {showForwardModal && (
        <ForwardModal
          onClose={() => setShowForwardModal(false)}
          onSubmit={handleForward}
        />
      )}
    </div>
  );
}
