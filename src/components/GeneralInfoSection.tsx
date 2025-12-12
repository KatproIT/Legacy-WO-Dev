import { FormSubmission } from '../types/form';
import { getInputClass } from '../utils/formValidation';

interface GeneralInfoSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
  isExistingForm?: boolean;
}

export function GeneralInfoSection({ formData, onChange, readOnly, hasValidationErrors, isExistingForm = false }: GeneralInfoSectionProps) {
  // Job number can be edited in drafts, but locked after submission
  const isJobNumberLocked = readOnly || isExistingForm;
  return (
    <div className="section-card">
      <h2 className="section-header">
        FIELD SERVICE REPORT - WORK ORDER
      </h2>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">
              DATE <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.date || ''}
              onChange={(e) => onChange('date', e.target.value)}
              disabled={readOnly}
              className={getInputClass(formData.date, hasValidationErrors, readOnly)}
            />
          </div>
          <div>
            <label className="form-label">
              JOB/PO # <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.job_po_number || ''}
              onChange={(e) => {
                let rawValue = e.target.value.replace(/[^0-9]/g, '');
                let formatted = '';

                if (rawValue.length > 0) {
                  formatted = rawValue.slice(0, 2);

                  if (rawValue.length > 2) {
                    formatted += '-' + rawValue.slice(2, 4);
                  }

                  if (rawValue.length > 4) {
                    formatted += '-' + rawValue.slice(4, 8);
                  }
                }

                onChange('job_po_number', formatted);
              }}
              disabled={isJobNumberLocked}
              className={getInputClass(formData.job_po_number, hasValidationErrors, isJobNumberLocked)}
              placeholder="XX-XX-XXXX"
              maxLength={10}
              required
            />
    
            {formData.job_po_number && (() => {
              const parts = formData.job_po_number.split('-');
              const middleValue = parts[1];
              const isValid = middleValue === '23' || middleValue === '29' || middleValue === '42';

              return parts.length === 3 && middleValue && !isValid ? (
                <p className="text-xs text-amber-700 mt-1 font-medium">
                  ⚠️ Invalid Job/PO number
                </p>
              ) : null;
            })()}
          </div>
          <div>
            <label className="form-label">
              TECHNICIAN <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.technician || ''}
              onChange={(e) => onChange('technician', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={getInputClass(formData.technician, hasValidationErrors, readOnly)}
              style={{ textTransform: 'uppercase' }}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">
              CUSTOMER <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.customer || ''}
              onChange={(e) => onChange('customer', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={getInputClass(formData.customer, hasValidationErrors, readOnly)}
              style={{ textTransform: 'uppercase' }}
              required
            />
          </div>
          <div>
            <label className="form-label">
              CONTACT NAME <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.contact_name || ''}
              onChange={(e) => onChange('contact_name', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={getInputClass(formData.contact_name, hasValidationErrors, readOnly)}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div>
            <label className="form-label">
              SITE NAME <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.site_name || ''}
              onChange={(e) => onChange('site_name', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={getInputClass(formData.site_name, hasValidationErrors, readOnly)}
              style={{ textTransform: 'uppercase' }}
              required
            />
          </div>
          <div>
            <label className="form-label">
              CONTACT PHONE
            </label>
            <input
              type="tel"
              value={formData.contact_phone || ''}
              onChange={(e) => onChange('contact_phone', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={getInputClass(formData.contact_phone, hasValidationErrors, readOnly)}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div>
            <label className="form-label">
              SITE ADDRESS <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.site_address || ''}
              onChange={(e) => onChange('site_address', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={getInputClass(formData.site_address, hasValidationErrors, readOnly)}
              style={{ textTransform: 'uppercase' }}
              required
            />
          </div>
          <div>
            <label className="form-label">
              CONTACT EMAIL
            </label>
            <input
              type="email"
              value={formData.contact_email || ''}
              onChange={(e) => onChange('contact_email', e.target.value.toUpperCase())}
              disabled={readOnly}
              className={getInputClass(formData.contact_email, hasValidationErrors, readOnly)}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          <div className="md:col-span-2">
            <label className="form-label">
              TYPE OF SERVICE <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {[
                'PREVENTATIVE MAINTENANCE',
                'INSPECTION',
                'SERVICE CALL/REPAIR',
                'STARTUP/WARRANTY',
                'LOAD BANK'
              ].map((service) => {
                const services = (formData.type_of_service || '').split(',').map(s => s.trim()).filter(Boolean);
                const isChecked = services.includes(service);

                return (
                  <label key={service} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        let newServices = [...services];
                        if (e.target.checked) {
                          newServices.push(service);
                        } else {
                          newServices = newServices.filter(s => s !== service);
                        }
                        onChange('type_of_service', newServices.join(', '));
                      }}
                      disabled={readOnly}
                      className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="form-label">
              NEXT INSPECTION DUE <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={formData.next_inspection_due || ''}
              onChange={(e) => onChange('next_inspection_due', e.target.value)}
              disabled={readOnly}
              className={getInputClass(formData.next_inspection_due, hasValidationErrors, readOnly)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
