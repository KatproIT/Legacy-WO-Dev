import { useState } from 'react';
import { FormSubmission } from '../types/form';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SystemChecksSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
}

const statusOptions = ['GOOD', 'REPLACED', 'SEE NOTES', 'N/A'];
const tempOptions = ['30°F', '25°F', '20°F', '15°F', '10°F', '5°F', '0°F', '-5°F'];

export function SystemChecksSection({ formData, onChange, readOnly }: SystemChecksSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="section-card">
      <h2
        className="section-header cursor-pointer flex items-center gap-2 hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        LOAD BANK TEST / TRANSFER TEST SECTION
      </h2>

      {!isCollapsed && (
      <div className="p-4 space-y-4">
        <div className="bg-gray-50 p-4 border border-gray-300">
          <h3 className="font-semibold mb-3">Fuel Information</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="form-label">FUEL TYPE <span className="text-red-600">*</span></label>
              <select
                value={formData.fuel_type || ''}
                onChange={(e) => onChange('fuel_type', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT FUEL TYPE</option>
                <option value="DIESEL">DIESEL</option>
                <option value="LP">LP</option>
                <option value="VP">VP</option>
                <option value="NG">NG</option>
                <option value="GASOLINE">GASOLINE</option>
              </select>
            </div>
            <div>
              <label className="form-label">Fuel Capacity <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.full_caps || ''}
                onChange={(e) => onChange('full_caps', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">FUEL ADDED</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.fuel_added ?? ''}
                onChange={(e) => onChange('fuel_added', e.target.value === '' ? null : parseFloat(e.target.value))}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">FUEL (%) <span className="text-red-600">*</span></label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                value={formData.fuel_percentage ?? ''}
                onChange={(e) => onChange('fuel_percentage', e.target.value === '' ? null : parseFloat(e.target.value))}
                disabled={readOnly}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-300">
          <h3 className="font-semibold mb-3">Oil Information</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="form-label">OIL TYPE <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.oil_type || ''}
                onChange={(e) => onChange('oil_type', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">OIL CAP <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.oil_cap || ''}
                onChange={(e) => onChange('oil_cap', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">DATE LAST OIL CHANGE <span className="text-red-600">*</span></label>
              <input
                type="date"
                value={formData.date_last_oil_change || ''}
                onChange={(e) => onChange('date_last_oil_change', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">OIL PSI <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.oil_psi || ''}
                onChange={(e) => onChange('oil_psi', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-300">
          <h3 className="font-semibold mb-3">Filter Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">OIL FILTER P/N <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.oil_filter_pn || ''}
                onChange={(e) => onChange('oil_filter_pn', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">STATUS <span className="text-red-600">*</span></label>
              <select
                value={formData.oil_filter_status || ''}
                onChange={(e) => onChange('oil_filter_status', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT STATUS</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">FUEL FILTER P/N <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.fuel_filter_pn || ''}
                onChange={(e) => onChange('fuel_filter_pn', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">STATUS <span className="text-red-600">*</span></label>
              <select
                value={formData.fuel_filter_status || ''}
                onChange={(e) => onChange('fuel_filter_status', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT STATUS</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">COOLANT FILTER P/N <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.coolant_filter_pn || ''}
                onChange={(e) => onChange('coolant_filter_pn', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">STATUS <span className="text-red-600">*</span></label>
              <select
                value={formData.coolant_filter_status || ''}
                onChange={(e) => onChange('coolant_filter_status', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT STATUS</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">AIR FILTER P/N <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.air_filter_pn || ''}
                onChange={(e) => onChange('air_filter_pn', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">STATUS <span className="text-red-600">*</span></label>
              <select
                value={formData.air_filter_status || ''}
                onChange={(e) => onChange('air_filter_status', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT STATUS</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-300">
          <h3 className="font-semibold mb-3">System Checks</h3>

          <div className="mb-3">
            <label className="form-label">COOLANT LEVEL / PROTECTION <span className="text-red-600">*</span></label>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={formData.coolant_level_field1 || ''}
                onChange={(e) => onChange('coolant_level_field1', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
              <select
                value={formData.coolant_level_field2 || ''}
                onChange={(e) => onChange('coolant_level_field2', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT TEMPERATURE</option>
                {tempOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
              <select
                value={formData.coolant_level_field3 || ''}
                onChange={(e) => onChange('coolant_level_field3', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT STATUS</option>
                {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-x-4 gap-y-3">
            {[
              { field: 'hoses_belts_cooling_fins', label: 'HOSES / BELTS / COOLING FINS' },
              { field: 'block_heater_status', label: 'BLOCK HEATER STATUS' },
              { field: 'ignition_system_status', label: 'IGNITION SYSTEM STATUS' },
              { field: 'governor_system', label: 'GOVERNOR SYSTEM' },
              { field: 'fuel_system_day_tank', label: 'FUEL SYSTEM / DAY TANK' },
              { field: 'fuel_line', label: 'FUEL LINE' },
              { field: 'check_all_systems_for_leaks', label: 'CHECK ALL SYSTEMS FOR LEAKS' },
              { field: 'exhaust_system', label: 'EXHAUST SYSTEM' },
              { field: 'charging_starting_system', label: 'CHARGING / STARTING SYSTEM' },
              { field: 'instruments_lamps_wiring', label: 'INSTRUMENTS / LAMPS / WIRING' },
              { field: 'generator_controls_safeties', label: 'GENERATOR CONTROLS / SAFETIES' },
              { field: 'enclosure_condition', label: 'ENCLOSURE CONDITION' },
              { field: 'ats_control_battery', label: 'ATS CONTROL BATTERY' },
              { field: 'ats_contactor', label: 'ATS CONTACTOR' },
              { field: 'transfer_time', label: 'TRANSFER TIME' },
              { field: 're_transfer_time', label: 'RE-TRANSFER TIME' },
              { field: 'cooldown', label: 'COOLDOWN' },
              { field: 'unit_in_auto_breakers_on', label: 'UNIT IN AUTO / BREAKERS ON' },
              { field: 'recommend_generator_be_replaced', label: 'RECOMMEND GENERATOR BE REPLACED' },
            ].map(({ field, label }) => (
              <div key={field} className="col-span-2">
                <label className="form-label text-xs">{label}</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={(formData as any)[`${field}_text`] || ''}
                    onChange={(e) => onChange(`${field}_text`, e.target.value)}
                    disabled={readOnly}
                    placeholder="Notes..."
                    className="form-input flex-[65]"
                  />
                  <select
                    value={(formData as any)[field] || ''}
                    onChange={(e) => onChange(field, e.target.value)}
                    disabled={readOnly}
                    className="form-input flex-[35]"
                  >
                    <option value="">STATUS</option>
                    {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3">
            <label className="form-label">OIL / Coolant Fill capacity <span className="text-red-600">*</span></label>
            <select
              value={formData.fill_caps || ''}
              onChange={(e) => onChange('fill_caps', e.target.value)}
              disabled={readOnly}
              className="form-input"
            >
              <option value="">SELECT STATUS</option>
              <option value="ON">ON</option>
              <option value="N/A">N/A</option>
            </select>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-300">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-3">Electrical Readings</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">A-B <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_ab || ''}
                    onChange={(e) => onChange('electrical_ab', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">B-C <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_bc || ''}
                    onChange={(e) => onChange('electrical_bc', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">A-C <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_ca || ''}
                    onChange={(e) => onChange('electrical_ca', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">FREQUENCY <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.frequency || ''}
                    onChange={(e) => onChange('frequency', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 invisible">Spacer</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">A-N <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_an || ''}
                    onChange={(e) => onChange('electrical_an', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">B-N <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_bn || ''}
                    onChange={(e) => onChange('electrical_bn', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">C-N <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_cn || ''}
                    onChange={(e) => onChange('electrical_cn', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Current</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">A <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.voltage_a || ''}
                    onChange={(e) => onChange('voltage_a', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">B <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.voltage_b || ''}
                    onChange={(e) => onChange('voltage_b', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">C <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.voltage_c || ''}
                    onChange={(e) => onChange('voltage_c', e.target.value)}
                    disabled={readOnly}
                    className="form-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
