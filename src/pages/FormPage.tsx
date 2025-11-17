import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { apiGet, apiPost, apiPut } from "../lib/api"; // ✅ Azure API
import { FormSubmission } from "../types/form";

import { FormTabs } from "../components/FormTabs";
import { GeneralInfoSection } from "../components/GeneralInfoSection";
import { EquipmentDetailsSection } from "../components/EquipmentDetailsSection";
import { MaintenanceInfoSection } from "../components/MaintenanceInfoSection";
import { SystemChecksSection } from "../components/SystemChecksSection";
import { DynamicTablesSection } from "../components/DynamicTablesSection";
import { WorkLogSection } from "../components/WorkLogSection";
import { AdditionalATSSection } from "../components/AdditionalATSSection";
import { LoadBankReportSection } from "../components/LoadBankReportSection";

import EmailAuthModal from "../components/EmailAuthModal";
import RejectModal from "../components/RejectModal";
import ForwardModal from "../components/ForwardModal";
import { ConfirmDialog } from "../components/ConfirmDialog";

import {
  isPM,
  isTechnician,
  isAuthorizedUser,
  extractNameFromEmail,
} from "../utils/userRoles";

import {
  validateLoadBankReport,
  validateServiceReport,
} from "../utils/formValidation";

import {
  Save,
  CheckCircle,
  AlertCircle,
  Printer,
  Edit,
  Lock,
  XCircle,
  Forward,
} from "lucide-react";

// 🔥 Your Power Automate URLs
const POWER_AUTOMATE_URL = "REPLACE_WITH_YOUR_URL";
const REJECT_URL = "REPLACE";
const FORWARD_URL = "REPLACE";

export function FormPage() {
  const { jobNumber } = useParams();
  const navigate = useNavigate();

  // -----------------------------
  // STATE
  // -----------------------------
  const [formData, setFormData] = useState<FormSubmission>({
    job_po_number: jobNumber || "",
    status: "submitted",
  });

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isNewForm, setIsNewForm] = useState(true);

  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info" as "info" | "warning" | "danger",
  });

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(true);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showForwardModal, setShowForwardModal] = useState(false);

  const [isUserPM, setIsUserPM] = useState(false);
  const [hasServiceReportErrors, setHasServiceReportErrors] = useState(false);
  const [hasLoadBankErrors, setHasLoadBankErrors] = useState(false);

  // -----------------------------
  // ON LOAD — after email verified
  // -----------------------------
  useEffect(() => {
    if (userEmail) {
      if (jobNumber && jobNumber !== "new") {
        loadFormData(jobNumber);
        setIsNewForm(false);
      } else {
        setIsNewForm(true);
        setIsReadOnly(false);
      }
    }
  }, [jobNumber, userEmail]);

  // -----------------------------
  // EMAIL SUBMISSION
  // -----------------------------
  const handleEmailSubmit = (email: string) => {
    if (!isAuthorizedUser(email)) {
      showToast("You are not authorized", "error");
      return;
    }

    setUserEmail(email);
    setIsUserPM(isPM(email));
    setShowEmailModal(false);

    if (isTechnician(email)) {
      setFormData((prev) => ({
        ...prev,
        technician: extractNameFromEmail(email),
        submitted_by_email: email,
      }));
    }
  };

  // -----------------------------
  // LOAD FORM DATA (Azure API)
  // -----------------------------
  const loadFormData = async (jobNumber: string) => {
    try {
      setLoading(true);

      const data = await apiGet(`/forms/${jobNumber}`);

      if (data) {
        let updated = { ...data };

        if (userEmail && isTechnician(userEmail)) {
          updated.technician = extractNameFromEmail(userEmail);
          updated.submitted_by_email = userEmail;
        }

        setFormData(updated);
        setIsReadOnly(updated.is_rejected || updated.is_forwarded || false);
      } else {
        showToast("Form not found", "error");
        navigate("/");
      }
    } catch (err) {
      showToast("Error loading form", "error");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const validateForm = (): boolean => {
    const errors: string[] = [];

    const sr = validateServiceReport(formData);
    if (!sr.isValid) {
      errors.push(...sr.errors);
      setHasServiceReportErrors(true);
    } else setHasServiceReportErrors(false);

    const lb = validateLoadBankReport(formData);
    if (!lb.isValid) {
      errors.push(...lb.errors);
      setHasLoadBankErrors(true);
    } else setHasLoadBankErrors(false);

    setValidationErrors(errors);
    return errors.length === 0;
  };

  // -----------------------------
  // SAVE (DRAFT)
  // -----------------------------
  const handleSaveForm = async () => {
    if (!validateForm()) {
      showToast("Please fix validation errors", "error");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        ...formData,
        status: "draft",
        submitted_by_email: userEmail || formData.submitted_by_email,
      };

      let saved;

      if (formData.id) {
        saved = await apiPut(`/forms/${formData.id}`, payload);
      } else {
        saved = await apiPost(`/forms`, payload);
      }

      setFormData(saved);
      setIsReadOnly(true);

      if (!jobNumber || jobNumber === "new") {
        navigate(`/form/${saved.job_po_number}`, { replace: true });
      }

      showToast("Form saved", "success");
    } catch (err) {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // SUBMIT FORM
  // -----------------------------
  const handleSubmit = () => {
    if (!validateForm()) {
      showToast("Fix validation errors first", "error");
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: "Submit Work Order?",
      message: "Are you sure?",
      type: "warning",
      onConfirm: performSubmit,
    });
  };

  const performSubmit = async () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    setSaving(true);

    try {
      const payload = {
        ...formData,
        status: "submitted",
        submitted_at: new Date().toISOString(),
        submitted_by_email: userEmail || formData.submitted_by_email,
      };

      const saved = formData.id
        ? await apiPut(`/forms/${formData.id}`, payload)
        : await apiPost(`/forms`, payload);

      setFormData(saved);
      navigate(`/form/${saved.job_po_number}`);

      showToast("Submitted!", "success");
    } catch {
      showToast("Submission failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // REJECT FORM
  // -----------------------------
  const handleReject = async (note: string) => {
    setShowRejectModal(false);
    setSaving(true);

    try {
      await apiPut(`/forms/${formData.id}`, {
        is_rejected: true,
        rejection_note: note,
      });

      showToast("Form rejected", "success");
      setIsReadOnly(true);
    } catch {
      showToast("Reject failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // FORWARD FORM
  // -----------------------------
  const handleForward = async (technicianEmail: string) => {
    setShowForwardModal(false);
    setSaving(true);

    try {
      await apiPut(`/forms/${formData.id}`, {
        is_forwarded: true,
        forwarded_to_email: technicianEmail,
      });

      showToast("Forwarded successfully", "success");
      setIsReadOnly(true);
    } catch {
      showToast("Forward failed", "error");
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Helper UI Functions
  // -----------------------------
  const handleFieldChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (validationErrors.length) validateForm();
    },
    [validationErrors]
  );

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const handlePrint = () => window.print();

  const handleEnableEdit = () => {
    setConfirmDialog({
      isOpen: true,
      title: "Enable Editing?",
      message: "You can now edit this form.",
      type: "info",
      onConfirm: () => {
        setIsReadOnly(false);
        setConfirmDialog({ ...confirmDialog, isOpen: false });
      },
    });
  };

  // -----------------------------
  // UI RENDER
  // -----------------------------
  if (!userEmail)
    return (
      <div className="min-h-screen flex items-center justify-center">
        {showEmailModal && <EmailAuthModal onEmailSubmit={handleEmailSubmit} />}
      </div>
    );

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER BAR */}
      <div className="bg-white shadow border-b p-4 flex justify-between items-center">
        <img src="/image.png" className="h-12" />
        {isReadOnly && (
          <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg flex items-center gap-2">
            <Lock size={16} /> Read-Only
          </span>
        )}
      </div>

      {/* ERROR TOAST */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-3 rounded-lg shadow-lg border-l-4 ${
            toast.type === "success"
              ? "bg-green-50 text-green-700 border-green-600"
              : "bg-red-50 text-red-700 border-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* TABS */}
      <FormTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasServiceReportErrors={hasServiceReportErrors}
        hasLoadBankErrors={hasLoadBankErrors}
      />

      <div className="max-w-5xl mx-auto p-6">
        {/* TAB CONTENT */}
        {activeTab === 0 && (
          <>
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
          </>
        )}

        {activeTab === 1 && (
          <AdditionalATSSection
            formData={formData}
            onChange={handleFieldChange}
            readOnly={isReadOnly}
            hasValidationErrors={validationErrors.length > 0}
          />
        )}

        {activeTab === 2 && (
          <LoadBankReportSection
            formData={formData}
            onChange={handleFieldChange}
            readOnly={isReadOnly}
            hasValidationErrors={validationErrors.length > 0}
          />
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="p-6 flex gap-4 justify-end bg-white border-t">
        <button className="btn-secondary" onClick={handlePrint}>
          <Printer size={16} /> Print
        </button>

        {!isReadOnly && formData.id && (
          <button className="btn-primary" onClick={handleSaveForm}>
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        )}

        {!isReadOnly && !formData.id && (
          <button className="btn-success" onClick={handleSubmit}>
            <CheckCircle size={16} />
            {saving ? "Submitting..." : "Submit"}
          </button>
        )}

        {isReadOnly && (
          <button className="btn-primary" onClick={handleEnableEdit}>
            <Edit size={16} /> Enable Edit
          </button>
        )}

        {isUserPM && formData.id && !isReadOnly && (
          <>
            <button
              className="btn-danger"
              onClick={() => setShowRejectModal(true)}
            >
              <XCircle size={16} /> Reject
            </button>

            <button
              className="btn-primary"
              onClick={() => setShowForwardModal(true)}
            >
              <Forward size={16} /> Forward
            </button>
          </>
        )}
      </div>

      {/* MODALS */}
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

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() =>
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      />
    </div>
  );
}
