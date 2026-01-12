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
import { generatePDF } from '../utils/printUtils';

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
  const { uniqueId, jobNumber } = useParams<{ uniqueId: string; jobNumber: string }>();
  const [formData, setFormData] = useState<FormSubmission>({
    job_po_number: jobNumber || '',
    status: 'submitted'
  } as FormSubmission);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          },
          cache: 'no-store'
        });

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Form not found or not accessible');
          }
          throw new Error('Failed to load form');
        }

        const raw = await response.json();
        const unpacked = unpackForm(raw);
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <AlertCircle size={24} />
            <h2 className="text-xl font-semibold">Error</h2>
          </div>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-md border-b border-gray-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center gap-6">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-14 sm:h-16 object-contain"
              />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Field Service Report</h1>
                <p className="text-sm text-gray-600">Job #{formData.job_po_number || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintFacilityCopy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
              >
                <Printer size={18} />
                <span className="hidden sm:inline">Print</span>
              </button>
              <button
                onClick={handlePrintCustomerCopy}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 text-sm shadow-sm"
              >
                <Printer size={18} />
                <span className="hidden sm:inline">Customer Copy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

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
