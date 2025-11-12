import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
import EmailAuthModal from '../components/EmailAuthModal';
import RejectModal from '../components/RejectModal';
import ForwardModal from '../components/ForwardModal';
import { isPM, isTechnician, isAuthorizedUser, extractNameFromEmail } from '../utils/userRoles';
import { validateLoadBankReport, validateServiceReport } from '../utils/formValidation';
import { Save, CheckCircle, AlertCircle, Printer, Edit, Lock, XCircle, Forward } from 'lucide-react';

const POWER_AUTOMATE_URL = 'https://default3596b7c39b4b4ef89dde39825373af.28.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/27b381b86bdb439ab4a1c21c7e91b4ca/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=T7l_jnyAgqcepy0O9s1qRoETtbiQ-_hNeqYIt9D0hRg';

const REJECT_URL = 'https://default3596b7c39b4b4ef89dde39825373af.28.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/c8c955439781483da47a26e4f8b0a9f8/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=d9sGvuhHfJre8BA5uSNPJiSvrA7o7nhS0tagqS6mh9k';

const FORWARD_URL = 'https://default3596b7c39b4b4ef89dde39825373af.28.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/78e08f8b26154239a6c728bcb8f03738/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=OolUtQrJfdW6u_rtE_7oKBrntwEO4Q-GY2D336QTack';

export function FormPage() {
  const { jobNumber } = useParams();
  const navigate = useNavigate();

  const getTodayDate = () => {
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<FormSubmission>({
    job_po_number: jobNumber || '',
    status: 'submitted'
  });
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
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [isUserPM, setIsUserPM] = useState(false);
  const [hasServiceReportErrors, setHasServiceReportErrors] = useState(false);
  const [hasLoadBankErrors, setHasLoadBankErrors] = useState(false);

  useEffect(() => {
    if (userEmail) {
      if (jobNumber && jobNumber !== 'new') {
        loadFormData(jobNumber);
        setIsNewForm(false);
      } else {
        setIsNewForm(true);
        setIsReadOnly(false);
      }
    }
  }, [jobNumber, userEmail]);

  const handleEmailSubmit = (email: string) => {
    if (!isAuthorizedUser(email)) {
      showToast('You are not authorized to access this form', 'error');
      return;
    }

    setUserEmail(email);
    setIsUserPM(isPM(email));
    setShowEmailModal(false);

    if (isTechnician(email)) {
      const technicianName = extractNameFromEmail(email);
      setFormData(prev => ({
        ...prev,
        technician: technicianName,
        submitted_by_email: email
      }));
    }
  };


  const loadFormData = async (jobNumber: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('job_po_number', jobNumber)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        let updatedData = { ...data };

        if (userEmail && isTechnician(userEmail)) {
          const technicianName = extractNameFromEmail(userEmail);
          updatedData = {
            ...updatedData,
            technician: technicianName,
            submitted_by_email: userEmail
          };
        }

        setFormData(updatedData);
        setIsReadOnly(data.is_rejected || data.is_forwarded || false);
      } else {
        showToast('Form not found', 'error');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading form:', error);
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
      const submissionData: FormSubmission = {
        ...formData,
        status: 'draft',
        submitted_by_email: userEmail || formData.submitted_by_email
      };

      let savedData;

      if (formData.id) {
        const { data, error } = await supabase
          .from('form_submissions')
          .update(submissionData)
          .eq('id', formData.id)
          .select()
          .single();

        if (error) throw error;
        savedData = data;
      } else {
        const { data: existingForm } = await supabase
          .from('form_submissions')
          .select('id')
          .eq('job_po_number', submissionData.job_po_number)
          .maybeSingle();

        if (existingForm) {
          showToast(`Job/PO # "${submissionData.job_po_number}" already exists. Please use a different number.`, 'error');
          setSaving(false);
          return;
        }

        const { data, error } = await supabase
          .from('form_submissions')
          .insert([submissionData])
          .select()
          .single();

        if (error) throw error;
        savedData = data;
      }

      setFormData(savedData);

      if (!jobNumber || jobNumber === 'new') {
        navigate(`/form/${savedData.job_po_number}`, { replace: true });
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
      const submissionData: FormSubmission = {
        ...formData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        submitted_by_email: userEmail || formData.submitted_by_email
      };

      let savedData;

      if (formData.id) {
        const { data, error } = await supabase
          .from('form_submissions')
          .update(submissionData)
          .eq('id', formData.id)
          .select()
          .single();

        if (error) throw error;
        savedData = data;
      } else {
        const { data: existingForm } = await supabase
          .from('form_submissions')
          .select('id')
          .eq('job_po_number', submissionData.job_po_number)
          .maybeSingle();

        if (existingForm) {
          showToast(`Job/PO # "${submissionData.job_po_number}" already exists. Please use a different number.`, 'error');
          setSaving(false);
          return;
        }

        const { data, error } = await supabase
          .from('form_submissions')
          .insert([submissionData])
          .select()
          .single();

        if (error) throw error;
        savedData = data;
        setIsNewForm(false);
      }

      if (savedData && savedData.is_first_submission) {
        await sendPowerAutomateRequest(savedData);
        await supabase
          .from('form_submissions')
          .update({ is_first_submission: false })
          .eq('id', savedData.id);
      }

      setFormData(savedData);

      if (!jobNumber || jobNumber === 'new') {
        navigate(`/form/${savedData.job_po_number}`, { replace: true });
      }

      showToast('WO submitted successfully', 'success');
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Error submitting form', 'error');
    } finally {
      setSaving(false);
    }
  };

  const sendPowerAutomateRequest = async (data: FormSubmission) => {
    try {
      const editLink = `${window.location.origin}/form/${data.job_po_number}`;

      const payload = {
        date: data.date,
        jobNumber: data.job_po_number,
        technician: data.technician,
        editLink: editLink
      };

      const response = await fetch(POWER_AUTOMATE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await supabase
          .from('form_submissions')
          .update({ http_post_sent: true })
          .eq('id', data.id);
      }
    } catch (error) {
      console.error('Error sending Power Automate request:', error);
    }
  };

  const handleFieldChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

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

  const handleReject = async (note: string) => {
    try {
      setSaving(true);
      setShowRejectModal(false);

      const formLink = `${window.location.origin}/form/${formData.job_po_number}`;

      const payload = {
        to: formData.submitted_by_email || '',
        note,
        formLink,
        jobPO: formData.job_po_number
      };

      await fetch(REJECT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      await supabase
        .from('form_submissions')
        .update({
          is_rejected: true,
          rejection_note: note,
          workflow_timestamp: new Date().toISOString()
        })
        .eq('id', formData.id);

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

  const handleForward = async (technicianEmail: string) => {
    try {
      setSaving(true);
      setShowForwardModal(false);

      const formLink = `${window.location.origin}/form/${formData.job_po_number}`;

      const payload = {
        to: technicianEmail,
        formLink,
        jobPO: formData.job_po_number
      };

      await fetch(FORWARD_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      await supabase
        .from('form_submissions')
        .update({
          is_forwarded: true,
          forwarded_to_email: technicianEmail,
          workflow_timestamp: new Date().toISOString()
        })
        .eq('id', formData.id);

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

  if (!userEmail) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        {showEmailModal && (
          <EmailAuthModal onEmailSubmit={handleEmailSubmit} />
        )}
      </div>
    );
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
              {formData.id && formData.http_post_sent && (
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

                  {!formData.id && !formData.http_post_sent && (
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
              <MaintenanceInfoSection
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
