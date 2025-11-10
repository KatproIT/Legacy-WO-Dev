import { useState } from 'react';
import { FormSubmission } from '../types/form';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getInputClass } from '../utils/formValidation';

interface MaintenanceInfoSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

export function MaintenanceInfoSection({ formData, onChange, readOnly, hasValidationErrors }: MaintenanceInfoSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="section-card">
      <h2
        className="section-header cursor-pointer flex items-center gap-2 hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        Maintenance Information
      </h2>

      {!isCollapsed && (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <label className="form-label">Exercise Day <span className="text-red-600">*</span></label>
          <select
            value={formData.exercise_day || ''}
            onChange={(e) => onChange('exercise_day', e.target.value)}
            disabled={readOnly}
            className={getInputClass(formData.exercise_day, hasValidationErrors, readOnly)}
          >
            <option value="">SELECT EXERCISE DAY</option>
            <option value="MONDAY">MONDAY</option>
            <option value="TUESDAY">TUESDAY</option>
            <option value="WEDNESDAY">WEDNESDAY</option>
            <option value="THURSDAY">THURSDAY</option>
            <option value="FRIDAY">FRIDAY</option>
            <option value="SATURDAY">SATURDAY</option>
            <option value="SUNDAY">SUNDAY</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </div>
        <div>
          <label className="form-label">With Load <span className="text-red-600">*</span></label>
          <select
            value={formData.with_load || ''}
            onChange={(e) => onChange('with_load', e.target.value)}
            disabled={readOnly}
            className={getInputClass(formData.with_load, hasValidationErrors, readOnly)}
          >
            <option value="">SELECT WITH LOAD</option>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
            <option value="N/A">N/A</option>
          </select>
        </div>
        <div>
          <label className="form-label">Time <span className="text-red-600">*</span></label>
          <input
            type="time"
            value={formData.exercise_time || '00:00'}
            onChange={(e) => onChange('exercise_time', e.target.value)}
            disabled={readOnly}
            className={getInputClass(formData.exercise_time, hasValidationErrors, readOnly)}
          />
        </div>
        <div>
          <label className="form-label">Exercise Interval <span className="text-red-600">*</span></label>
          <select
            value={formData.exercise_interval || ''}
            onChange={(e) => onChange('exercise_interval', e.target.value)}
            disabled={readOnly}
            className={getInputClass(formData.exercise_interval, hasValidationErrors, readOnly)}
          >
            <option value="">SELECT EXERCISE INTERVAL</option>
            <option value="WEEKLY">WEEKLY</option>
            <option value="BIWEEKLY">BIWEEKLY</option>
            <option value="MONTHLY">MONTHLY</option>
            <option value="UNKNOWN">UNKNOWN</option>
          </select>
        </div>
        <div>
          <label className="form-label">Load Bank Test <span className="text-red-600">*</span></label>
          <select
            value={formData.load_bank_test || ''}
            onChange={(e) => onChange('load_bank_test', e.target.value)}
            disabled={readOnly}
            className={getInputClass(formData.load_bank_test, hasValidationErrors, readOnly)}
          >
            <option value="">SELECT LOAD BANK TEST</option>
            <option value="1 HR">1 HR</option>
            <option value="2 HR">2 HR</option>
            <option value="4 HR">4 HR</option>
            <option value="N/A">N/A</option>
          </select>
        </div>
        <div>
          <label className="form-label">Transfer Test <span className="text-red-600">*</span></label>
          <select
            value={formData.transfer_test || ''}
            onChange={(e) => onChange('transfer_test', e.target.value)}
            disabled={readOnly}
            className={getInputClass(formData.transfer_test, hasValidationErrors, readOnly)}
          >
            <option value="">SELECT TRANSFER TEST</option>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
        </div>
      </div>
      )}
    </div>
  );
}
