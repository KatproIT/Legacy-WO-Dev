import { useState } from 'react';
import { FormSubmission, EquipmentDetails } from '../types/form';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getInputClass } from '../utils/formValidation';

interface EquipmentDetailsSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

export function EquipmentDetailsSection({ formData, onChange, readOnly, hasValidationErrors }: EquipmentDetailsSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  const updateEquipment = (equipment: 'equipment_generator' | 'equipment_engine' | 'equipment_ats1' | 'equipment_ats2', field: keyof EquipmentDetails, value: string) => {
    const current = formData[equipment] || {};
    onChange(equipment, { ...current, [field]: value });
  };

  const getTableInputClass = (value: any) => {
    if (!hasValidationErrors || readOnly) return 'w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';
    return !value || value === '' ? 'w-full px-2 py-1 border-2 border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100' : 'w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';
  };

  return (
    <div className="section-card">
      <h2
        className="section-header cursor-pointer flex items-center gap-2 hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        Equipment Details
      </h2>

      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-left">Field</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">Generator</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">Engine</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">ATS 1</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">ATS 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">MAKE <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.make || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'make', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.make)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.make || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'make', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_engine?.make)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.make || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'make', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_ats1?.make)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.make || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'make', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">MODEL <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.model || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'model', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.model)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.model || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'model', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_engine?.model)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.model || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'model', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_ats1?.model)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.model || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'model', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">SERIAL <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'serial', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.serial)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'serial', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_engine?.serial)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'serial', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_ats1?.serial)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'serial', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">SPEC <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'spec', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.spec)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'spec', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_engine?.spec)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'spec', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_ats1?.spec)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'spec', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">PHASE <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_generator?.phase || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'phase', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.phase)}
                  >
                    <option value="">SELECT</option>
                    <option value="1P">1P</option>
                    <option value="3P">3P</option>
                    <option value="MULTI">MULTI</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats1?.phase || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'phase', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_ats1?.phase)}
                  >
                    <option value="">SELECT</option>
                    <option value="1P">1P</option>
                    <option value="3P">3P</option>
                    <option value="MULTI">MULTI</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats2?.phase || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'phase', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">SELECT</option>
                    <option value="1P">1P</option>
                    <option value="3P">3P</option>
                    <option value="MULTI">MULTI</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">VOLTAGE <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_generator?.voltage || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'voltage', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.voltage)}
                  >
                    <option value="">SELECT</option>
                    <option value="208">208</option>
                    <option value="240">240</option>
                    <option value="480">480</option>
                    <option value="MULTI">MULTI</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats1?.voltage || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'voltage', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_ats1?.voltage)}
                  >
                    <option value="">SELECT</option>
                    <option value="208">208</option>
                    <option value="240">240</option>
                    <option value="480">480</option>
                    <option value="MULTI">MULTI</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats2?.voltage || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'voltage', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">SELECT</option>
                    <option value="208">208</option>
                    <option value="240">240</option>
                    <option value="480">480</option>
                    <option value="MULTI">MULTI</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">AMP <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.genAmp || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'genAmp', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.genAmp)}
                  />
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.ats1Amp || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'ats1Amp', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_ats1?.ats1Amp)}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.ats2Amp || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'ats2Amp', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">KW <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.kw || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'kw', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.kw)}
                  />
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">DOM</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.dom || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'dom', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">HOURS <span className="text-red-600">*</span></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.hours || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'hours', e.target.value)}
                    disabled={readOnly}
                    className={getTableInputClass(formData.equipment_generator?.hours)}
                  />
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
