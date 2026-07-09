import { useState } from 'react';
import { FormSubmission, LoadBankEntry } from '../types/form';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { isLoadBankRequired, getInputClass } from '../utils/formValidation';

interface LoadBankReportSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

const LOAD_BANK_ROWS = 20;

function makeEmptyLoadBankEntry(index: number): LoadBankEntry {
  return {
    id: `loadbank-slot-${index}`,
    time: '00:00',
    kw: '',
    hertz: '',
    ab: '',
    bc: '',
    ca: '',
    amps_a: '',
    amps_b: '',
    amps_c: '',
    oil_pressure: '',
    water_temp: '',
    batt_charger_voltage: '',
  };
}

function isLoadBankEntryEmpty(entry: LoadBankEntry | undefined): boolean {
  if (!entry) return true;
  const noTime = !entry.time || entry.time === '00:00';
  return (
    noTime &&
    !entry.kw &&
    !entry.hertz &&
    !entry.ab &&
    !entry.bc &&
    !entry.ca &&
    !entry.amps_a &&
    !entry.amps_b &&
    !entry.amps_c &&
    !entry.oil_pressure &&
    !entry.water_temp &&
    !entry.batt_charger_voltage
  );
}

export function LoadBankReportSection({ formData, onChange, readOnly, hasValidationErrors }: LoadBankReportSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const entries = formData.load_bank_entries || [];
  const isRequired = isLoadBankRequired(formData);
  const isLoadBankChecked = (formData.type_of_service || '').includes('LOAD BANK');

  const updateEntryAt = (index: number, field: keyof LoadBankEntry, value: string) => {
    const padded: LoadBankEntry[] = [];
    for (let i = 0; i <= index; i++) {
      const existing = entries[i];
      if (existing) {
        padded.push(existing);
      } else {
        const empty = makeEmptyLoadBankEntry(i);
        empty.id = `${Date.now()}-lb-${i}`;
        padded.push(empty);
      }
    }
    for (let i = index + 1; i < entries.length; i++) {
      padded.push(entries[i]);
    }
    const upperCased = typeof value === 'string' && field !== 'time' ? value.toUpperCase() : value;
    padded[index] = { ...padded[index], [field]: upperCased };
    onChange('load_bank_entries', padded.slice(0, LOAD_BANK_ROWS));
  };

  return (
    <div className="space-y-6" data-print-section="load-bank-report">
      <div className="bg-blue-50 border border-blue-300 p-4">
        <h2
          className="text-xl font-bold cursor-pointer flex items-center gap-2 hover:bg-blue-100 -m-4 p-4 mb-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
          LOAD BANK TEST / TRANSFER TEST SECTION
        </h2>

        {!isCollapsed && (
        <div className="mt-4 space-y-6">

      <div className="bg-gray-50 p-4 border border-gray-300">
        <h3 className="font-semibold mb-3">LOAD BANK TEST INFORMATION</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">CUSTOMER{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_customer || ''}
                onChange={(e) => onChange('load_bank_customer', e.target.value.toUpperCase())}
                disabled={readOnly || isLoadBankChecked}
                className={getInputClass(formData.load_bank_customer, hasValidationErrors && isRequired, readOnly || isLoadBankChecked)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="form-label">RESISTIVE LOAD{isRequired && <span className="text-red-600"> *</span>}</label>
              <select
                value={formData.load_bank_resistive_load || ''}
                onChange={(e) => onChange('load_bank_resistive_load', e.target.value)}
                disabled={readOnly}
                className={getInputClass(formData.load_bank_resistive_load, hasValidationErrors && isRequired, readOnly)}
              >
                <option value="">SELECT</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">SITE NAME{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_site_name || ''}
                onChange={(e) => onChange('load_bank_site_name', e.target.value.toUpperCase())}
                disabled={readOnly || isLoadBankChecked}
                className={getInputClass(formData.load_bank_site_name, hasValidationErrors && isRequired, readOnly || isLoadBankChecked)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="form-label">BUILDING LOAD{isRequired && <span className="text-red-600"> *</span>}</label>
              <select
                value={formData.load_bank_reactive_load || ''}
                onChange={(e) => onChange('load_bank_reactive_load', e.target.value)}
                disabled={readOnly}
                className={getInputClass(formData.load_bank_reactive_load, hasValidationErrors && isRequired, readOnly)}
              >
                <option value="">SELECT</option>
                <option value="YES">YES</option>
                <option value="NO">NO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">SITE ADDRESS{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_site_address || ''}
                onChange={(e) => onChange('load_bank_site_address', e.target.value.toUpperCase())}
                disabled={readOnly || isLoadBankChecked}
                className={getInputClass(formData.load_bank_site_address, hasValidationErrors && isRequired, readOnly || isLoadBankChecked)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="form-label">AMBIENT AIR TEMP</label>
              <input
                type="text"
                value={formData.load_bank_ambient_air_temp || ''}
                onChange={(e) => onChange('load_bank_ambient_air_temp', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">MAKE{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_make || ''}
                onChange={(e) => onChange('load_bank_make', e.target.value.toUpperCase())}
                disabled={readOnly}
                className={getInputClass(formData.load_bank_make, hasValidationErrors && isRequired, readOnly)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="form-label">MODEL{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_model || ''}
                onChange={(e) => onChange('load_bank_model', e.target.value.toUpperCase())}
                disabled={readOnly}
                className={getInputClass(formData.load_bank_model, hasValidationErrors && isRequired, readOnly)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="form-label">S/N{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_sn || ''}
                onChange={(e) => onChange('load_bank_sn', e.target.value.toUpperCase())}
                disabled={readOnly}
                className={getInputClass(formData.load_bank_sn, hasValidationErrors && isRequired, readOnly)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold">LOAD BANK TEST ENTRIES</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse border border-gray-400 load-bank-table" data-table-type="load-bank" style={{ minWidth: '765px', width: 'max-content' }}>
          <thead>
            <tr className="bg-gray-200">
              <th rowSpan={2} className="border border-gray-400 p-1 font-bold text-[10px] align-middle whitespace-nowrap" style={{ width: '60px', minWidth: '60px', lineHeight: '1.2' }}>TIME</th>
              <th rowSpan={2} className="border border-gray-400 p-1 font-bold text-[10px] align-middle whitespace-nowrap" style={{ width: '45px', minWidth: '45px', lineHeight: '1.2' }}>KW</th>
              <th rowSpan={2} className="border border-gray-400 p-1 font-bold text-[10px] align-middle whitespace-nowrap" style={{ width: '40px', minWidth: '40px', lineHeight: '1.2' }}>HZ</th>
              <th colSpan={3} className="border border-gray-400 p-1 font-bold text-xs align-middle whitespace-nowrap" style={{ minWidth: '135px', lineHeight: '1.2' }}>VOLTS</th>
              <th colSpan={3} className="border border-gray-400 p-1 font-bold text-xs align-middle whitespace-nowrap" style={{ minWidth: '120px', lineHeight: '1.2' }}>AMPS</th>
              <th rowSpan={2} className="border border-gray-400 p-1 font-bold text-[10px] align-middle whitespace-nowrap" style={{ width: '60px', minWidth: '60px', lineHeight: '1.2' }}>OIL PSI</th>
              <th rowSpan={2} className="border border-gray-400 p-1 font-bold text-[10px] align-middle whitespace-nowrap" style={{ width: '60px', minWidth: '60px', lineHeight: '1.2' }}>H2O °F</th>
              <th rowSpan={2} className="border border-gray-400 p-1 font-bold text-[10px] align-middle whitespace-nowrap" style={{ width: '60px', minWidth: '60px', lineHeight: '1.2' }}>BATT V</th>
            </tr>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 px-0.5 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ width: '45px', minWidth: '45px', lineHeight: '1.1' }}>A/B</th>
              <th className="border border-gray-400 px-0.5 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ width: '45px', minWidth: '45px', lineHeight: '1.1' }}>B/C</th>
              <th className="border border-gray-400 px-0.5 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ width: '45px', minWidth: '45px', lineHeight: '1.1' }}>C/A</th>
              <th className="border border-gray-400 px-0.5 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ width: '40px', minWidth: '40px', lineHeight: '1.1' }}>A</th>
              <th className="border border-gray-400 px-0.5 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ width: '40px', minWidth: '40px', lineHeight: '1.1' }}>B</th>
              <th className="border border-gray-400 px-0.5 py-0.5 text-[10px] font-medium whitespace-nowrap" style={{ width: '40px', minWidth: '40px', lineHeight: '1.1' }}>C</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: LOAD_BANK_ROWS }, (_, index) => {
              const entry = entries[index] ?? makeEmptyLoadBankEntry(index);
              const empty = isLoadBankEntryEmpty(entries[index]);
              const rowBg = empty ? 'bg-gray-50' : 'bg-white';
              const cellBg = empty ? 'bg-gray-100' : '';
              return (
                <tr key={index} className={rowBg} style={{ height: '28px' }}>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '60px' }}>
                    <input
                      type="time"
                      value={entry.time || ''}
                      onChange={(e) => updateEntryAt(index, 'time', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '45px' }}>
                    <input
                      type="text"
                      value={entry.kw || ''}
                      onChange={(e) => updateEntryAt(index, 'kw', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '40px' }}>
                    <input
                      type="text"
                      value={entry.hertz || ''}
                      onChange={(e) => updateEntryAt(index, 'hertz', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '45px' }}>
                    <input
                      type="text"
                      value={entry.ab || ''}
                      onChange={(e) => updateEntryAt(index, 'ab', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '45px' }}>
                    <input
                      type="text"
                      value={entry.bc || ''}
                      onChange={(e) => updateEntryAt(index, 'bc', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '45px' }}>
                    <input
                      type="text"
                      value={entry.ca || ''}
                      onChange={(e) => updateEntryAt(index, 'ca', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '40px' }}>
                    <input
                      type="text"
                      value={entry.amps_a || ''}
                      onChange={(e) => updateEntryAt(index, 'amps_a', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '40px' }}>
                    <input
                      type="text"
                      value={entry.amps_b || ''}
                      onChange={(e) => updateEntryAt(index, 'amps_b', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '40px' }}>
                    <input
                      type="text"
                      value={entry.amps_c || ''}
                      onChange={(e) => updateEntryAt(index, 'amps_c', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '60px' }}>
                    <input
                      type="text"
                      value={entry.oil_pressure || ''}
                      onChange={(e) => updateEntryAt(index, 'oil_pressure', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '60px' }}>
                    <input
                      type="text"
                      value={entry.water_temp || ''}
                      onChange={(e) => updateEntryAt(index, 'water_temp', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                  <td className="border border-gray-400 p-0" style={{ minWidth: '60px' }}>
                    <input
                      type="text"
                      value={entry.batt_charger_voltage || ''}
                      onChange={(e) => updateEntryAt(index, 'batt_charger_voltage', e.target.value)}
                      disabled={readOnly}
                      className={`w-full h-7 px-0.5 py-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-[10px] text-center ${cellBg}`}
                      style={{ textTransform: 'uppercase', lineHeight: '1.2' }}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-gray-50 border border-gray-300 p-4 mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">ADDITIONAL COMMENTS</label>
        <textarea
          value={formData.load_bank_additional_comments || ''}
          onChange={(e) => onChange('load_bank_additional_comments', e.target.value)}
          disabled={readOnly}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>
      </div>
      )}
      </div>
    </div>
  );
}
