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
import { Printer, AlertCircle } from 'lucide-react';
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
  const { uniqueId } = useParams<{ uniqueId: string }>();
  const [formData, setFormData] = useState<FormSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const fetchForm = async () => {
      if (!uniqueId) {
        setError('Form ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`${API}/public/form/${uniqueId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Form not found or not accessible');
          }
          throw new Error('Failed to load form');
        }

        const rawData = await response.json();
        const unpacked = unpackForm(rawData);
        setFormData(unpacked);
      } catch (err: any) {
        setError(err.message || 'Failed to load form');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [uniqueId]);

  const handlePrintFacilityCopy = async () => {
    if (!formData) return;
    try {
      await generatePDF(formData, {
        includeFinancialData: true,
        filename: `facility_copy_${formData.job_po_number || 'form'}.pdf`
      });
    } catch (err) {
      console.error('Error generating facility copy:', err);
      alert('Failed to generate facility copy');
    }
  };

  const handlePrintCustomerCopy = async () => {
    if (!formData) return;
    try {
      await generatePDF(formData, {
        includeFinancialData: false,
        filename: `customer_copy_${formData.job_po_number || 'form'}.pdf`
      });
    } catch (err) {
      console.error('Error generating customer copy:', err);
      alert('Failed to generate customer copy');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading form...</div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-slate-600">{error || 'Form not found'}</p>
        </div>
      </div>
    );
  }

  const showAdditionalATS = hasAdditionalATSData(formData);
  const showLoadBank = hasLoadBankData(formData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Work Order Form - View Only
                </h1>
                <p className="text-blue-100 text-sm">
                  Job #{formData.job_po_number || 'N/A'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handlePrintFacilityCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                >
                  <Printer size={18} />
                  Print Facility Copy
                </button>
                <button
                  onClick={handlePrintCustomerCopy}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors font-medium"
                >
                  <Printer size={18} />
                  Print Customer Copy
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 print-container">
            <FormTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              showAdditionalATS={showAdditionalATS}
              showLoadBank={showLoadBank}
            />

            <div className="mt-6">
              {activeTab === 'general' && (
                <GeneralInfoSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}

              {activeTab === 'equipment' && (
                <EquipmentDetailsSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceInfoSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}

              {activeTab === 'system-checks' && (
                <SystemChecksSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}

              {activeTab === 'parts-and-time' && (
                <DynamicTablesSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}

              {activeTab === 'work-log' && (
                <WorkLogSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}

              {activeTab === 'additional-ats' && showAdditionalATS && (
                <AdditionalATSSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}

              {activeTab === 'load-bank' && showLoadBank && (
                <LoadBankReportSection
                  formData={formData}
                  onUpdate={() => {}}
                  readOnly={true}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
