import { useState } from 'react';
import { FormSubmission, LoadBankEntry } from '../types/form';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { isLoadBankRequired, getInputClass } from '../utils/formValidation';

interface LoadBankReportSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

export function LoadBankReportSection({ formData, onChange, readOnly, hasValidationErrors }: LoadBankReportSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const entries = formData.load_bank_entries || [];
  const isRequired = isLoadBankRequired(formData);

  const addEntry = () => {
    const newEntry: LoadBankEntry = {
      id: Math.random().toString(36).substr(2, 9),
      time: '00:00',
      kw: '',
      hertz: '',
      ab: '',
      bc: '',
      ca: '',
      an: '',
      bn: '',
      cn: '',
      amps_a: '',
      amps_b: '',
      amps_c: '',
      oil_pressure: '',
      water_temp: '',
      batt_charger_voltage: ''
    };
    onChange('load_bank_entries', [...entries, newEntry]);
  };

  const removeEntry = (id: string) => {
    onChange('load_bank_entries', entries.filter((entry: LoadBankEntry) => entry.id !== id));
  };

  const updateEntry = (id: string, field: string, value: string) => {
    onChange(
      'load_bank_entries',
      entries.map((entry: LoadBankEntry) =>
        entry.id === id ? { ...entry, [field]: value.toUpperCase() } : entry
      )
    );
  };

  return (
    <div className="space-y-6">
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
        <h3 className="font-semibold mb-3">Load Bank Test Information</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">CUSTOMER{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_customer || ''}
                onChange={(e) => onChange('load_bank_customer', e.target.value.toUpperCase())}
                disabled={readOnly}
                className={getInputClass(formData.load_bank_customer, hasValidationErrors && isRequired, readOnly)}
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
                disabled={readOnly}
                className={getInputClass(formData.load_bank_site_name, hasValidationErrors && isRequired, readOnly)}
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
                disabled={readOnly}
                className={getInputClass(formData.load_bank_site_address, hasValidationErrors && isRequired, readOnly)}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="form-label">AMBIENT AIR TEMP{isRequired && <span className="text-red-600"> *</span>}</label>
              <input
                type="text"
                value={formData.load_bank_ambient_air_temp || ''}
                onChange={(e) => onChange('load_bank_ambient_air_temp', e.target.value.toUpperCase())}
                disabled={readOnly}
                className={getInputClass(formData.load_bank_ambient_air_temp, hasValidationErrors && isRequired, readOnly)}
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
        <h3 className="text-lg font-semibold">Load Bank Test Entries</h3>
        {!readOnly && (
          <button
            type="button"
            onClick={addEntry}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Entry
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="bg-gray-50 border border-gray-300 p-8 text-center text-gray-500">
          No load bank test entries added. Click "Add Entry" to add one.
        </div>
      ) : (
        <div className="overflow-x-auto lg:overflow-visible">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-200">
                <th rowSpan={2} className="border border-gray-300  font-semibold text-xs">TIME</th>
                <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-xs">KW</th>
                <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-xs">HZ</th>
                <th colSpan={6} className="border border-gray-300 px-2 py-2 font-semibold text-xs">VOLTS</th>
                <th colSpan={3} className="border border-gray-300 px-2 py-2 font-semibold text-xs">AMPS</th>
                <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-xs">OIL PSI</th>
                <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-xs">H2O °F</th>
                <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-xs">BATT V</th>
                {!readOnly && (
                  <th rowSpan={2} className="border border-gray-300 px-2 py-2 font-semibold text-xs">DEL</th>
                )}
              </tr>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 text-xs font-medium">A/B</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">B/C</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">C/A</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">A/N</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">B/N</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">C/N</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">A</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">B</th>
                <th className="border border-gray-300 px-1 py-1 text-xs font-medium">C</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry: LoadBankEntry) => (
                <tr key={entry.id}>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="time"
                      value={entry.time || ''}
                      onChange={(e) => updateEntry(entry.id, 'time', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.kw || ''}
                      onChange={(e) => updateEntry(entry.id, 'kw', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.hertz || ''}
                      onChange={(e) => updateEntry(entry.id, 'hertz', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.ab || ''}
                      onChange={(e) => updateEntry(entry.id, 'ab', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.bc || ''}
                      onChange={(e) => updateEntry(entry.id, 'bc', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.ca || ''}
                      onChange={(e) => updateEntry(entry.id, 'ca', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.an || ''}
                      onChange={(e) => updateEntry(entry.id, 'an', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.bn || ''}
                      onChange={(e) => updateEntry(entry.id, 'bn', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.cn || ''}
                      onChange={(e) => updateEntry(entry.id, 'cn', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.amps_a || ''}
                      onChange={(e) => updateEntry(entry.id, 'amps_a', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.amps_b || ''}
                      onChange={(e) => updateEntry(entry.id, 'amps_b', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.amps_c || ''}
                      onChange={(e) => updateEntry(entry.id, 'amps_c', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.oil_pressure || ''}
                      onChange={(e) => updateEntry(entry.id, 'oil_pressure', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.water_temp || ''}
                      onChange={(e) => updateEntry(entry.id, 'water_temp', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 p-0">
                    <input
                      type="text"
                      value={entry.batt_charger_voltage || ''}
                      onChange={(e) => updateEntry(entry.id, 'batt_charger_voltage', e.target.value)}
                      disabled={readOnly}
                      className="w-full p-0 border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 text-xs"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  {!readOnly && (
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
