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
    onChange(equipment, { ...current, [field]: value.toUpperCase() });
  };

  // Check if LOAD BANK is selected - if so, equipment details are not mandatory
  const isLoadBankChecked = (formData.type_of_service || '').includes('LOAD BANK');
  const isEquipmentRequired = !isLoadBankChecked;

  const getTableInputClass = (value: any, isRequired: boolean = true) => {
    if (!hasValidationErrors || readOnly || !isRequired) return 'w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';
    return !value || value === '' ? 'w-full px-2 py-1 border-2 border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100' : 'w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100';
  };

  return (
    <div className="section-card">
      <h2
        className="section-header cursor-pointer flex items-center gap-2 hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        EQUIPMENT DETAILS
      </h2>

      {!isCollapsed && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold text-left">FIELD</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">GENERATOR</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">ENGINE</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">ATS 1</th>
                <th className="border border-gray-300 px-3 py-2 text-sm font-semibold">ATS 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">MAKE {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.make || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'make', e.target.value)}
                    disabled={readOnly}
                    tabIndex={1}
                    className={getTableInputClass(formData.equipment_generator?.make, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.make || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'make', e.target.value)}
                    disabled={readOnly}
                    tabIndex={11}
                    className={getTableInputClass(formData.equipment_engine?.make, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.make || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'make', e.target.value)}
                    disabled={readOnly}
                    tabIndex={15}
                    className={getTableInputClass(formData.equipment_ats1?.make, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.make || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'make', e.target.value)}
                    disabled={readOnly}
                    tabIndex={22}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">MODEL {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.model || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'model', e.target.value)}
                    disabled={readOnly}
                    tabIndex={2}
                    className={getTableInputClass(formData.equipment_generator?.model, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.model || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'model', e.target.value)}
                    disabled={readOnly}
                    tabIndex={12}
                    className={getTableInputClass(formData.equipment_engine?.model, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.model || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'model', e.target.value)}
                    disabled={readOnly}
                    tabIndex={16}
                    className={getTableInputClass(formData.equipment_ats1?.model, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.model || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'model', e.target.value)}
                    disabled={readOnly}
                    tabIndex={23}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">SERIAL {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'serial', e.target.value)}
                    disabled={readOnly}
                    tabIndex={3}
                    className={getTableInputClass(formData.equipment_generator?.serial, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'serial', e.target.value)}
                    disabled={readOnly}
                    tabIndex={13}
                    className={getTableInputClass(formData.equipment_engine?.serial, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'serial', e.target.value)}
                    disabled={readOnly}
                    tabIndex={17}
                    className={getTableInputClass(formData.equipment_ats1?.serial, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.serial || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'serial', e.target.value)}
                    disabled={readOnly}
                    tabIndex={24}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">SPEC {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'spec', e.target.value)}
                    disabled={readOnly}
                    tabIndex={4}
                    className={getTableInputClass(formData.equipment_generator?.spec, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_engine?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_engine', 'spec', e.target.value)}
                    disabled={readOnly}
                    tabIndex={14}
                    className={getTableInputClass(formData.equipment_engine?.spec, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'spec', e.target.value)}
                    disabled={readOnly}
                    tabIndex={18}
                    className={getTableInputClass(formData.equipment_ats1?.spec, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.spec || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'spec', e.target.value)}
                    disabled={readOnly}
                    tabIndex={25}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">PHASE {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_generator?.phase || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'phase', e.target.value)}
                    disabled={readOnly}
                    tabIndex={5}
                    className={getTableInputClass(formData.equipment_generator?.phase, isEquipmentRequired)}
                  >
                    <option value="">SELECT</option>
                    <option value="1P">1P</option>
                    <option value="3P">3P</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats1?.phase || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'phase', e.target.value)}
                    disabled={readOnly}
                    tabIndex={19}
                    className={getTableInputClass(formData.equipment_ats1?.phase, isEquipmentRequired)}
                  >
                    <option value="">SELECT</option>
                    <option value="1P">1P</option>
                    <option value="3P">3P</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats2?.phase || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'phase', e.target.value)}
                    disabled={readOnly}
                    tabIndex={26}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">SELECT</option>
                    <option value="1P">1P</option>
                    <option value="3P">3P</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">VOLTAGE {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_generator?.voltage || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'voltage', e.target.value)}
                    disabled={readOnly}
                    tabIndex={6}
                    className={getTableInputClass(formData.equipment_generator?.voltage, isEquipmentRequired)}
                  >
                    <option value="">SELECT</option>
                    <option value="208">208</option>
                    <option value="240">240</option>
                    <option value="480">480</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats1?.voltage || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'voltage', e.target.value)}
                    disabled={readOnly}
                    tabIndex={20}
                    className={getTableInputClass(formData.equipment_ats1?.voltage, isEquipmentRequired)}
                  >
                    <option value="">SELECT</option>
                    <option value="208">208</option>
                    <option value="240">240</option>
                    <option value="480">480</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-1">
                  <select
                    value={formData.equipment_ats2?.voltage || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'voltage', e.target.value)}
                    disabled={readOnly}
                    tabIndex={27}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">SELECT</option>
                    <option value="208">208</option>
                    <option value="240">240</option>
                    <option value="480">480</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">AMP {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.genAmp || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'genAmp', e.target.value)}
                    disabled={readOnly}
                    tabIndex={7}
                    className={getTableInputClass(formData.equipment_generator?.genAmp, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats1?.ats1Amp || ''}
                    onChange={(e) => updateEquipment('equipment_ats1', 'ats1Amp', e.target.value)}
                    disabled={readOnly}
                    tabIndex={21}
                    className={getTableInputClass(formData.equipment_ats1?.ats1Amp, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_ats2?.ats2Amp || ''}
                    onChange={(e) => updateEquipment('equipment_ats2', 'ats2Amp', e.target.value)}
                    disabled={readOnly}
                    tabIndex={28}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">KW {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.kw || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'kw', e.target.value)}
                    disabled={readOnly}
                    tabIndex={8}
                    className={getTableInputClass(formData.equipment_generator?.kw, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
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
                    tabIndex={9}
                    className="w-full px-2 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
                <td className="border border-gray-300 p-1 bg-gray-100"></td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-3 py-2 font-medium bg-gray-50">HOURS {isEquipmentRequired && <span className="text-red-600">*</span>}</td>
                <td className="border border-gray-300 p-1">
                  <input
                    type="text"
                    value={formData.equipment_generator?.hours || ''}
                    onChange={(e) => updateEquipment('equipment_generator', 'hours', e.target.value)}
                    disabled={readOnly}
                    tabIndex={10}
                    className={getTableInputClass(formData.equipment_generator?.hours, isEquipmentRequired)}
                    style={{ textTransform: 'uppercase' }}
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
