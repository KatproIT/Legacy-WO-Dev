import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { Printer, Download, AlertCircle } from 'lucide-react';
import { generatePDF } from '../utils/printUtils';
import { supabase } from '../lib/supabase';

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

  if (merged.date && typeof merged.date === 'string') {
    merged.date = merged.date.substring(0, 10);
  }
  if (merged.next_inspection_due && typeof merged.next_inspection_due === 'string') {
    merged.next_inspection_due = merged.next_inspection_due.substring(0, 10);
  }

  return merged as FormSubmission;
}

export function ViewFormPage() {
  const { uniqueId } = useParams();
  const [formData, setFormData] = useState<FormSubmission>({} as FormSubmission);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (uniqueId) {
      loadFormData(uniqueId);
    }
  }, [uniqueId]);

  const loadFormData = async (formId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('id', formId)
        .eq('is_draft', false)
        .maybeSingle();

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data) {
        setError('Form not found or not available for viewing');
        return;
      }

      const unpacked = unpackForm(data);
      unpacked.date = normalizeDate(unpacked.date);
      unpacked.next_inspection_due = normalizeDate(unpacked.next_inspection_due);

      setFormData(unpacked);
    } catch (error) {
      console.error('Error loading form:', error);
      setError('Failed to load form. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrint = async () => {
    try {
      const filename = `Work_Order_${formData.job_po_number || 'form'}.pdf`;
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
      const filename = `Work_Order_${formData.job_po_number || 'form'}_Customer_Copy.pdf`;
      await generatePDF(formData, {
        includeFinancialData: false,
        filename
      });
    } catch (error) {
      showToast('Error generating Customer Copy', 'error');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading form...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-start gap-3">
            <AlertCircle size={24} className="text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Form</h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-md border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-6">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-14 sm:h-16 object-contain"
              />
              <span className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold rounded-md">
                View Only
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
              >
                <Printer size={18} />
                <span>Print Facility Copy</span>
              </button>
              <button
                onClick={handleCustomerCopy}
                className="px-4 py-2 text-green-700 bg-green-100 hover:bg-green-200 rounded-lg transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
              >
                <Download size={18} />
                <span>Print Customer Copy</span>
              </button>
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
          <span className="font-medium text-sm sm:text-base">{toast.message}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-8 print-container">
        <div className="no-print">
          <FormTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            hasServiceReportErrors={false}
            hasLoadBankErrors={false}
          />
        </div>

        <div className="mt-8">
          <div className={activeTab !== 0 ? 'hidden print-all-tabs' : 'print-all-tabs'}>
            <div className="space-y-6">
              <GeneralInfoSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
                isExistingForm={true}
              />
              <EquipmentDetailsSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
              />
              <SystemChecksSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
              />
              <MaintenanceInfoSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
              />
              <DynamicTablesSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
              />
              <WorkLogSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
              />
            </div>
          </div>

          <div className={activeTab !== 1 ? 'hidden print:block' : ''} data-section="additional-ats">
            <div className="section-card">
              <AdditionalATSSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
              />
            </div>
          </div>

          <div className={activeTab !== 2 ? 'hidden print:block' : ''} data-section="load-bank">
            <div className="section-card">
              <LoadBankReportSection
                formData={formData}
                onChange={() => {}}
                readOnly={true}
                hasValidationErrors={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
