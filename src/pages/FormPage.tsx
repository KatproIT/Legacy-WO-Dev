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
import { DraftsModal } from '../components/DraftsModal';
import { extractNameFromEmail } from '../utils/userRoles';
import { validateLoadBankReport, validateServiceReport } from '../utils/formValidation';
import { Save, CheckCircle, AlertCircle, Printer, Edit, Lock, XCircle, Forward, Download, FileText, Plus, Home, Copy } from 'lucide-react';
import { authFetch } from '../utils/authFetch';
import { generatePDF, hasAdditionalATSData, hasLoadBankData } from '../utils/printUtils';

const API =
  (import.meta.env.VITE_API_URL && (import.meta.env.VITE_API_URL as string).trim()) ||
  'https://legacywobe.azurewebsites.net/api';

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
  'workflow_timestamp',
  'submitted_by_email',
  'is_draft',
  'is_first_submission'
]);
function normalizeDate(val: any) {
  if (!val) return val;
  if (typeof val === "string" && val.includes("T")) {
    return val.substring(0, 10);
  }
  return val;
}


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

  // FIX: Convert ISO date to yyyy-MM-dd for html input
  if (merged.date && typeof merged.date === 'string') {
    merged.date = merged.date.substring(0, 10);
  }
  if (merged.next_inspection_due && typeof merged.next_inspection_due === 'string') {
    merged.next_inspection_due = merged.next_inspection_due.substring(0, 10);
  }

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
  const { uniqueId, jobNumber } = useParams();
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
    onDiscard?: () => void;
    type?: 'warning' | 'info' | 'danger';
    confirmText?: string;
    discardText?: string;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [isUserPM, setIsUserPM] = useState(false);
  const [isUserTechnician, setIsUserTechnician] = useState(false);
  const [hasServiceReportErrors, setHasServiceReportErrors] = useState(false);
  const [hasLoadBankErrors, setHasLoadBankErrors] = useState(false);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [initialFormData, setInitialFormData] = useState<FormSubmission | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showDuplicateConfirm, setShowDuplicateConfirm] = useState(false);

  // ✔ FIX: prevent navigate inside rendering
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    if (!email) navigate('/login');
  }, [navigate]);

  // Initialize user info and load form
  useEffect(() => {
    const email = localStorage.getItem('userEmail');
    const role = localStorage.getItem('userRole');
    if (!email) return;

    setUserEmail(email);
    setUserRole(role);

    const isPMRole = role === 'pm' || role === 'admin' || role === 'superadmin';
    const isTech = role === 'technician';
    setIsUserPM(isPMRole);
    setIsUserTechnician(isTech);

    if (uniqueId && uniqueId !== 'new') {
      loadFormData(uniqueId, email, role);
      setIsNewForm(false);
    } else {
      setIsNewForm(true);
      setIsReadOnly(false);

      // Check if there's duplicated form data in localStorage
      const duplicatedData = localStorage.getItem('duplicatedFormData');
      let newFormData: FormSubmission;

      if (duplicatedData) {
        try {
          newFormData = JSON.parse(duplicatedData);
          // Remove id and submission-related fields
          delete (newFormData as any).id;
          delete (newFormData as any).submitted_at;
          delete (newFormData as any).created_at;
          delete (newFormData as any).updated_at;
          delete (newFormData as any).http_post_sent;
          delete (newFormData as any).is_rejected;
          delete (newFormData as any).is_forwarded;
          delete (newFormData as any).rejection_note;
          delete (newFormData as any).forwarded_to_email;
          delete (newFormData as any).workflow_timestamp;
          delete (newFormData as any).is_draft;
          newFormData.status = 'submitted';

          // Clear the localStorage after using it
          localStorage.removeItem('duplicatedFormData');
        } catch (error) {
          console.error('Error parsing duplicated form data:', error);
          newFormData = {
            job_po_number: jobNumber || '',
            status: 'submitted',
            transfer_time: '00:00:00',
            re_transfer_time: '00:00:00',
            cooldown: '00:00:00'
          } as FormSubmission;
        }
      } else {
        newFormData = {
          job_po_number: jobNumber || '',
          status: 'submitted',
          transfer_time: '00:00:00',
          re_transfer_time: '00:00:00',
          cooldown: '00:00:00'
        } as FormSubmission;
      }

      if (isTech) {
        const techName = extractNameFromEmail(email);
        newFormData.technician = techName;
        newFormData.submitted_by_email = email;
      }
      setFormData(newFormData);
      setInitialFormData(JSON.parse(JSON.stringify(newFormData)));
    }
  }, [uniqueId]);

  const loadFormData = async (formId: string, email?: string | null, role?: string | null) => {
    try {
      setLoading(true);

      const res = await authFetch(`${API}/forms/${encodeURIComponent(formId)}`, { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) {
          showToast('Form not found', 'error');
          navigate('/');
          return;
        }
        if (res.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Failed to load form');
      }

      const raw = await res.json();
      const unpacked = unpackForm(raw);
      unpacked.date = normalizeDate(unpacked.date);
      unpacked.next_inspection_due = normalizeDate(unpacked.next_inspection_due);


      if (role === 'technician' && email) {
        unpacked.technician = extractNameFromEmail(email);
        unpacked.submitted_by_email = email;
      }

      setFormData(unpacked);
      setInitialFormData(JSON.parse(JSON.stringify(unpacked)));
      setIsReadOnly(Boolean(raw.is_rejected || raw.is_forwarded));
    } catch (error) {
      showToast('Error loading form', 'error');
    } finally {
      setLoading(false);
    }
  };

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
        if (!res.ok) throw new Error('Failed to update');
        savedData = await res.json();
      } else {
        const res = await authFetch(`${API}/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });
        if (!res.ok) throw new Error('Failed to create');
        savedData = await res.json();
      }

      const unpacked = unpackForm(savedData);
      setFormData(unpacked);

      if (!uniqueId || uniqueId === 'new') {
        navigate(`/form/${unpacked.id}/${unpacked.job_po_number}`, { replace: true });
      }

      setIsReadOnly(true);
      showToast('Form saved successfully!', 'success');
    } catch (error) {
      showToast('Error saving form', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
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
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
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
        is_draft: false,
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

        if (!res.ok) throw new Error('Failed to create before submit');
        savedData = await res.json();
        setIsNewForm(false);
      }

      const wf = await authFetch(`${API}/workflow/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: savedData!.id })
      });

      if (!wf.ok) {
        console.error('Workflow submit failed', await wf.text());
      }

      if (savedData) {
        const refreshRes = await authFetch(`${API}/forms/${savedData.id}`);
        if (refreshRes.ok) {
          const refreshedRaw = await refreshRes.json();
          const refreshed = unpackForm(refreshedRaw);
          setFormData(refreshed);
        }
      }

      if (!uniqueId || uniqueId === 'new') {
        navigate(`/form/${savedData!.id}/${savedData!.job_po_number}`, { replace: true });
      }

      showToast('WO submitted successfully', 'success');
      setIsReadOnly(true);
    } catch (error) {
      showToast('Error submitting form', 'error');
    } finally {
      setSaving(false);
    }
  };

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

      await handleSaveForm();
      setIsReadOnly(true);
      showToast('Form rejected successfully', 'success');
    } catch (error) {
      showToast('Error rejecting form', 'error');
    } finally {
      setSaving(false);
    }
  };

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
      showToast('Error forwarding form', 'error');
    } finally {
      setSaving(false);
    }
  };

const handleFieldChange = useCallback((field: string, value: any) => {
  // 🩹 FIX: Normalize ISO datetime to yyyy-MM-dd
  if (
    field.toLowerCase().includes("date") ||
    field.toLowerCase().includes("due")
  ) {
    value = normalizeDate(value);
  }

  setFormData(prev => {
    const updated = { ...prev };
    setByPath(updated, field, value);

    const wasLoadBankChecked = (prev.type_of_service || '').includes('LOAD BANK');
    const isLoadBankChecked = (updated.type_of_service || '').includes('LOAD BANK');

    if (field === 'type_of_service') {
      if (isLoadBankChecked && !wasLoadBankChecked) {
        updated.load_bank_customer = updated.customer || '';
        updated.load_bank_site_name = updated.site_name || '';
        updated.load_bank_site_address = updated.site_address || '';
      }
    }

    if (isLoadBankChecked) {
      if (field === 'customer') {
        updated.load_bank_customer = value;
      } else if (field === 'site_name') {
        updated.load_bank_site_name = value;
      } else if (field === 'site_address') {
        updated.load_bank_site_address = value;
      }
    }

    return updated;
  });

  if (validationErrors.length > 0) {
    validateForm();
  }
}, [validationErrors]);


  const getFieldError = (value: any): boolean => {
    if (validationErrors.length === 0) return false;
    return !value || value === '' || (Array.isArray(value) && value.length === 0);
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrint = async () => {
    try {
      const filename = `Work_Order_${formData.job_po_number || 'draft'}.pdf`;
      await generatePDF(formData, {
        includeFinancialData: true,
        filename
      });
    } catch (error) {
      showToast('Error generating PDF', 'error');
      console.error(error);
    }
  };

  const handleCustomerCopy = async () => {
    try {
      const filename = `Work_Order_${formData.job_po_number || 'draft'}_Customer_Copy.pdf`;
      await generatePDF(formData, {
        includeFinancialData: false,
        filename
      });
    } catch (error) {
      showToast('Error generating Customer Copy', 'error');
      console.error(error);
    }
  };

  const handleEnableEdit = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Enable Edit Mode?',
      message: 'You are about to edit this form. Make sure to save your changes when done.',
      type: 'info',
      onConfirm: () => {
        setIsReadOnly(false);
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        showToast('Edit mode enabled', 'success');
      }
    });
  };

  const handleSaveChanges = async () => {
    if (!formData.id) {
      showToast('Cannot save changes without a form ID', 'error');
      return;
    }

    setSaving(true);

    try {
      const submissionPayload = packForm({
        ...formData,
        submitted_by_email: userEmail || (formData as any).submitted_by_email
      });

      const res = await authFetch(`${API}/forms/${formData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionPayload)
      });

      if (!res.ok) throw new Error('Failed to update form');
      const savedData = await res.json();

      const unpacked = unpackForm(savedData);
      setFormData(unpacked);
      setInitialFormData(JSON.parse(JSON.stringify(unpacked)));

      showToast('Changes saved successfully!', 'success');
    } catch (error) {
      showToast('Error saving changes', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!formData.job_po_number?.trim()) {
      setConfirmDialog({
        isOpen: true,
        title: 'Save as Draft?',
        message: 'Do you want to save this as a draft? The Job/PO Number field is required for drafts.',
        type: 'warning',
        onConfirm: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      });
      return;
    }

    setSaving(true);

    try {
      const submissionPayload = packForm({
        ...formData,
        status: 'draft',
        is_draft: true,
        submitted_by_email: userEmail || (formData as any).submitted_by_email
      });

      let savedData: any = null;

      if (formData.id) {
        const res = await authFetch(`${API}/forms/${formData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });
        if (!res.ok) throw new Error('Failed to update draft');
        savedData = await res.json();
      } else {
        const res = await authFetch(`${API}/forms`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionPayload)
        });
        if (!res.ok) throw new Error('Failed to create draft');
        savedData = await res.json();
      }

      const unpacked = unpackForm(savedData);
      setFormData(unpacked);
      setInitialFormData(JSON.parse(JSON.stringify(unpacked)));

      showToast('Draft saved! All saved drafts are available in the My Drafts button.', 'success');
    } catch (error) {
      showToast('Error saving draft', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLoadDraft = async (draftId: string) => {
    try {
      setLoading(true);
      const res = await authFetch(`${API}/forms/${draftId}`);
      if (!res.ok) {
        throw new Error('Failed to load draft');
      }

      const raw = await res.json();
      const unpacked = unpackForm(raw);
      setFormData(unpacked);
      setInitialFormData(JSON.parse(JSON.stringify(unpacked)));
      setIsNewForm(false);
      setIsReadOnly(false);

      setShowDraftsModal(false);
      showToast('Draft loaded successfully', 'success');
    } catch (error) {
      showToast('Error loading draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Track form changes
  useEffect(() => {
    if (!initialFormData) return;

    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);
    setHasUnsavedChanges(hasChanges);
  }, [formData, initialFormData]);

  const checkUnsavedChanges = (): { hasChanges: boolean; isDraft: boolean; hasNewData: boolean } => {
    if (!initialFormData) {
      return { hasChanges: false, isDraft: false, hasNewData: false };
    }

    const isDraft = (formData as any).is_draft === true;
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData);

    return {
      hasChanges,
      isDraft,
      hasNewData: hasChanges && isDraft
    };
  };

  const handleNewFormClick = () => {
    const { hasChanges, isDraft } = checkUnsavedChanges();

    // Case 1: Draft with no changes - go directly to new form
    if (isDraft && !hasChanges) {
      navigate('/form/new');
      return;
    }

    // Case 2: Has unsaved changes (new form or draft with changes)
    if (hasChanges) {
      setConfirmDialog({
        isOpen: true,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Would you like to save this as a draft before creating a new form?',
        type: 'warning',
        confirmText: 'Yes, Save as Draft',
        discardText: 'No, Discard Changes',
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await handleSaveDraft();
          navigate('/form/new');
        },
        onDiscard: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          navigate('/form/new');
        }
      });
      return;
    }

    // Case 3: No changes, safe to navigate
    navigate('/form/new');
  };

  const handleDashboardClick = () => {
    const { hasChanges } = checkUnsavedChanges();

    if (hasChanges && !isReadOnly) {
      setConfirmDialog({
        isOpen: true,
        title: 'Unsaved Changes',
        message: 'You have unsaved changes. Would you like to save this as a draft before leaving?',
        type: 'warning',
        confirmText: 'Yes, Save as Draft',
        discardText: 'No, Discard Changes',
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          await handleSaveDraft();
          navigate('/');
        },
        onDiscard: () => {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
          navigate('/');
        }
      });
      return;
    }

    navigate('/');
  };

  const handleDuplicate = () => {
    setShowDuplicateConfirm(true);
  };

  const confirmDuplicate = () => {
    setShowDuplicateConfirm(false);

    // Store form data in localStorage
    localStorage.setItem('duplicatedFormData', JSON.stringify(formData));

    // Open new tab with /form/new
    window.open('/form/new', '_blank');

    showToast('Form duplicated! Opening in new tab...', 'success');
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
      <div className="bg-white shadow-md border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Row: Logo and Navigation */}
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-14 sm:h-16 object-contain"
              />
              <div className="flex items-center gap-3">
                {isReadOnly && (
                  <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-md flex items-center gap-1.5">
                    <Lock size={14} />
                    <span className="hidden sm:inline">Read-Only</span>
                  </span>
                )}
                {formData.id && (formData as any).http_post_sent && (
                  <span className="px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-md flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span className="hidden sm:inline">Submitted</span>
                  </span>
                )}
                {hasUnsavedChanges && !isReadOnly && (
                  <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-md">
                    Unsaved Changes
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleNewFormClick}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">NEW FORM</span>
              </button>
            </div>
          </div>

          {/* Bottom Row: Actions */}
          <div className="py-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Print & Export */}
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-sm"
              >
                <Printer size={16} />
                <span>PRINT</span>
              </button>
              <button
                onClick={handleCustomerCopy}
                className="px-3 py-1.5 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-sm"
              >
                <Download size={16} />
                <span>CUSTOMER COPY</span>
              </button>

              {/* Duplicate Button - Show only for existing forms */}
              {formData.id && (
                <button
                  onClick={handleDuplicate}
                  className="px-3 py-1.5 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-sm"
                >
                  <Copy size={16} />
                  <span>DUPLICATE</span>
                </button>
              )}

              {/* Divider */}
              <div className="h-6 w-px bg-gray-300 mx-1"></div>

              {/* Draft Actions */}
              {!isReadOnly && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={saving}
                    className="px-3 py-1.5 text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-sm disabled:opacity-50"
                  >
                    <Save size={16} />
                    <span>SAVE DRAFT</span>
                  </button>
                  <button
                    onClick={() => setShowDraftsModal(true)}
                    className="px-3 py-1.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-sm"
                  >
                    <FileText size={16} />
                    <span>MY DRAFT</span>
                  </button>
                </>
              )}

              {/* PM Actions */}
              {isUserPM && !isReadOnly && formData.id && (
                <>
                  <div className="h-6 w-px bg-gray-300 mx-1"></div>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={saving}
                    className="px-3 py-1.5 text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-sm"
                  >
                    <XCircle size={16} />
                    <span>REJECT</span>
                  </button>
                  <button
                    onClick={() => setShowForwardModal(true)}
                    disabled={saving}
                    className="px-3 py-1.5 text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors font-medium flex items-center gap-1.5 text-sm"
                  >
                    <Forward size={16} />
                    <span>FORWARD</span>
                  </button>
                </>
              )}

              {/* Spacer */}
              <div className="flex-1"></div>

              {/* Primary Actions */}
              {isReadOnly ? (
                <button
                  onClick={handleEnableEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
                >
                  <Edit size={16} />
                  <span>ENABLE EDIT</span>
                </button>
              ) : (
                <>
                  {(formData as any).http_post_sent ? (
                    <button
                      onClick={handleSaveChanges}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
                    >
                      <Save size={16} />
                      <span>{saving ? 'Saving...' : 'SAVE CHANGES'}</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={saving}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      <span>{saving ? 'Submitting...' : 'SUBMIT WORK ORDER'}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 px-4 py-3 sm:px-6 sm:py-4 rounded-lg sm:rounded-xl shadow-2xl z-50 flex items-center gap-2 sm:gap-3 border-l-4 no-print max-w-[calc(100%-2rem)] sm:max-w-md ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-500'
              : 'bg-red-50 text-red-800 border-red-500'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} className="sm:w-[22px] sm:h-[22px] flex-shrink-0" />
          ) : (
            <AlertCircle size={18} className="sm:w-[22px] sm:h-[22px] flex-shrink-0" />
          )}
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
                    ... and {validationErrors.length - 5} more field
                    {validationErrors.length - 5 !== 1 ? 's' : ''}
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
          <div className={activeTab !== 0 ? 'hidden print-all-tabs' : 'print-all-tabs'}>
            <div className="space-y-6">
              <GeneralInfoSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
                isExistingForm={(formData as any).http_post_sent === true}
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

          <div className={activeTab !== 1 ? 'hidden print:block' : ''} data-section="additional-ats">
            <div className="section-card">
              <AdditionalATSSection
                formData={formData}
                onChange={handleFieldChange}
                readOnly={isReadOnly}
                hasValidationErrors={validationErrors.length > 0}
              />
            </div>
          </div>

          <div className={activeTab !== 2 ? 'hidden print:block' : ''} data-section="load-bank">
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
        onDiscard={confirmDialog.onDiscard}
        confirmText={confirmDialog.confirmText || "Confirm"}
        discardText={confirmDialog.discardText}
        cancelText="Cancel"
      />

      {showRejectModal && (
        <RejectModal onClose={() => setShowRejectModal(false)} onSubmit={handleReject} />
      )}

      {showForwardModal && (
        <ForwardModal onClose={() => setShowForwardModal(false)} onSubmit={handleForward} />
      )}

      <DraftsModal
        isOpen={showDraftsModal}
        onClose={() => setShowDraftsModal(false)}
        onLoadDraft={handleLoadDraft}
        userEmail={userEmail || ''}
      />

      {/* Duplicate Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDuplicateConfirm}
        title="Duplicate Form?"
        message="This will create a copy of this form with all data (including Job/PO Number) pre-filled in a new tab. You can then modify any field before submitting."
        type="info"
        onConfirm={confirmDuplicate}
        onCancel={() => setShowDuplicateConfirm(false)}
        confirmText="Duplicate"
        cancelText="Cancel"
      />
    </div>
  );
}
