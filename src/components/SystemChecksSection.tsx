import { useState } from 'react';
import { FormSubmission, BatteryReading } from '../types/form';
import { ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';

interface SystemChecksSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

const statusOptions = ['GOOD', 'REPLACED', 'SEE NOTES', 'N/A'];
const coolantLevelOptions = ['ADDED', 'FULL'];
const tempOptions = [
  '-50°F', '-45°F', '-40°F', '-35°F', '-30°F', '-25°F', '-20°F', '-15°F', '-10°F', '-5°F',
  '0°F', '5°F', '10°F', '15°F', '20°F'
];

export function SystemChecksSection({ formData, onChange, readOnly }: SystemChecksSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const batteryReadings = formData.battery_health_readings || [];

  const addBattery = () => {
    const newBattery: BatteryReading = {
      id: Date.now().toString(),
      battery: batteryReadings.length + 1,
      batteryDate: '',
      batteryType: '',
      batteryChargerVolts: '',
      voltage: '',
      ccaRating: '',
      ccaTested: '',
      testedPercent: '',
      passFail: 'Pass'
    };
    onChange('battery_health_readings', [...batteryReadings, newBattery]);
  };

  const removeBattery = (id: string) => {
    onChange('battery_health_readings', batteryReadings.filter(b => b.id !== id));
  };

  const updateBattery = (id: string, field: keyof BatteryReading, value: any) => {
    onChange('battery_health_readings', batteryReadings.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
  };

  return (
    <div className="section-card">
      <h2
        className="section-header cursor-pointer flex items-center gap-2 hover:bg-gray-50"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
        MAINTENANCE INFORMATION
      </h2>

      {!isCollapsed && (
      <div className="p-4 space-y-4">
        <div className="bg-gray-50 p-4 border border-gray-300">
          <h3 className="font-semibold mb-3">FUEL INFORMATION</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <label className="form-label">FUEL CAPACITY <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.full_caps || ''}
                onChange={(e) => onChange('full_caps', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
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
          <h3 className="font-semibold mb-3">OIL INFORMATION</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">OIL TYPE <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.oil_type || ''}
                onChange={(e) => onChange('oil_type', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            <div>
              <label className="form-label">OIL CAPACITY <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.oil_cap || ''}
                onChange={(e) => onChange('oil_cap', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
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
                onChange={(e) => onChange('oil_psi', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-300">
          <h3 className="font-semibold mb-3">FILTER INFORMATION</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">OIL FILTER P/N <span className="text-red-600">*</span></label>
              <input
                type="text"
                value={formData.oil_filter_pn || ''}
                onChange={(e) => onChange('oil_filter_pn', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
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
                onChange={(e) => onChange('fuel_filter_pn', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
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
                onChange={(e) => onChange('coolant_filter_pn', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
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
                onChange={(e) => onChange('air_filter_pn', e.target.value.toUpperCase())}
                disabled={readOnly}
                className="form-input"
                style={{ textTransform: 'uppercase' }}
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
          <h3 className="font-semibold mb-3">SYSTEM CHECKS</h3>

          <div className="mb-3">
            <label className="form-label">COOLANT LEVEL / PROTECTION <span className="text-red-600">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={formData.coolant_level_field1 || ''}
                onChange={(e) => onChange('coolant_level_field1', e.target.value)}
                disabled={readOnly}
                className="form-input"
              >
                <option value="">SELECT LEVEL</option>
                {coolantLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { field: 'hoses_belts_cooling_fins', label: 'HOSES / BELTS / COOLING FINS', options: statusOptions },
              { field: 'block_heater_status', label: 'BLOCK HEATER STATUS', options: statusOptions },
              { field: 'ignition_system_status', label: 'IGNITION SYSTEM STATUS', options: statusOptions },
              { field: 'governor_system', label: 'GOVERNOR SYSTEM', options: statusOptions },
              { field: 'fuel_system_day_tank', label: 'FUEL SYSTEM / DAY TANK', options: statusOptions },
              { field: 'fuel_line', label: 'FUEL LINE', options: statusOptions },
              { field: 'check_all_systems_for_leaks', label: 'CHECK ALL SYSTEMS FOR LEAKS', options: statusOptions },
              { field: 'exhaust_system', label: 'EXHAUST SYSTEM', options: statusOptions },
              { field: 'charging_starting_system', label: 'CHARGING / STARTING SYSTEM', options: statusOptions },
              { field: 'instruments_lamps_wiring', label: 'INSTRUMENTS / LAMPS / WIRING', options: statusOptions },
              { field: 'generator_controls_safeties', label: 'GENERATOR CONTROLS / SAFETIES', options: statusOptions },
              { field: 'enclosure_condition', label: 'ENCLOSURE CONDITION', options: statusOptions },
              { field: 'ats_control_battery', label: 'ATS CONTROL BATTERY', options: statusOptions },
              { field: 'ats_contactor', label: 'ATS CONTACTOR', options: statusOptions },
              { field: 'unit_in_auto_breakers_on', label: 'UNIT IN AUTO / BREAKERS ON', options: statusOptions },
              { field: 'recommend_generator_be_replaced', label: 'RECOMMEND GENERATOR BE REPLACED', options: ['YES', 'NO'] },
            ].map(({ field, label, options }) => (
              <div key={field}>
                <label className="form-label text-sm">{label}</label>
                <select
                  value={(formData as any)[field] || ''}
                  onChange={(e) => onChange(field, e.target.value)}
                  disabled={readOnly}
                  className="form-input"
                >
                  <option value="">SELECT {field === 'recommend_generator_be_replaced' ? '' : 'STATUS'}</option>
                  {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="form-label text-sm">TRANSFER TIME</label>
              <input
                type="time"
                step="1"
                value={(formData as any).transfer_time || '00:00:00'}
                onChange={(e) => onChange('transfer_time', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label text-sm">RE-TRANSFER TIME</label>
              <input
                type="time"
                step="1"
                value={(formData as any).re_transfer_time || '00:00:00'}
                onChange={(e) => onChange('re_transfer_time', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label text-sm">COOLDOWN</label>
              <input
                type="time"
                step="1"
                value={(formData as any).cooldown || '00:00:00'}
                onChange={(e) => onChange('cooldown', e.target.value)}
                disabled={readOnly}
                className="form-input"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">OIL / COOLANT FILL CAP <span className="text-red-600">*</span></label>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold mb-3">ELECTRICAL READINGS</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">A-B <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_ab || ''}
                    onChange={(e) => onChange('electrical_ab', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="form-label">B-C <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_bc || ''}
                    onChange={(e) => onChange('electrical_bc', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="form-label">A-C <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_ca || ''}
                    onChange={(e) => onChange('electrical_ca', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="form-label">FREQUENCY <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.frequency || ''}
                    onChange={(e) => onChange('frequency', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3 invisible">SPACER</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">A-N <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_an || ''}
                    onChange={(e) => onChange('electrical_an', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="form-label">B-N <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_bn || ''}
                    onChange={(e) => onChange('electrical_bn', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="form-label">C-N <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.electrical_cn || ''}
                    onChange={(e) => onChange('electrical_cn', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">CURRENT</h3>
              <div className="space-y-3">
                <div>
                  <label className="form-label">A <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.voltage_a || ''}
                    onChange={(e) => onChange('voltage_a', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="form-label">B <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.voltage_b || ''}
                    onChange={(e) => onChange('voltage_b', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div>
                  <label className="form-label">C <span className="text-red-600">*</span></label>
                  <input
                    type="text"
                    value={formData.voltage_c || ''}
                    onChange={(e) => onChange('voltage_c', e.target.value.toUpperCase())}
                    disabled={readOnly}
                    className="form-input"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 border border-gray-300">
          <h3 className="font-semibold mb-3">BATTERY INFORMATION <span className="text-red-600">*</span></h3>
          <div className="space-y-6">
            {batteryReadings.map((battery, index) => (
              <div key={battery.id}>
                {index > 0 && (
                  <div className="mb-6 border-t-2 border-gray-300"></div>
                )}

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-700">BATTERY {battery.battery}</h3>
                    {!readOnly && (
                      <button
                        onClick={() => removeBattery(battery.id)}
                        className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={18} />
                        REMOVE
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="form-label">BATTERY DATE</label>
                      <input
                        type="date"
                        value={battery.batteryDate || ''}
                        onChange={(e) => updateBattery(battery.id, 'batteryDate', e.target.value)}
                        disabled={readOnly}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="form-label">BATTERY TYPE</label>
                      <input
                        type="text"
                        value={battery.batteryType || ''}
                        onChange={(e) => updateBattery(battery.id, 'batteryType', e.target.value.toUpperCase())}
                        disabled={readOnly}
                        className="form-input"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div>
                      <label className="form-label">BATTERY CHARGER VOLTS</label>
                      <input
                        type="text"
                        value={battery.batteryChargerVolts || ''}
                        onChange={(e) => updateBattery(battery.id, 'batteryChargerVolts', e.target.value.toUpperCase())}
                        disabled={readOnly}
                        className="form-input"
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="border border-gray-300 px-3 py-2 text-center">VOLTAGE</th>
                          <th className="border border-gray-300 px-3 py-2 text-center">CCA RATING</th>
                          <th className="border border-gray-300 px-3 py-2 text-center">CCA TESTED</th>
                          <th className="border border-gray-300 px-3 py-2 text-center">PASS/FAIL</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="border border-gray-300 px-2 py-2">
                            <input
                              type="text"
                              value={battery.voltage}
                              onChange={(e) => updateBattery(battery.id, 'voltage', e.target.value.toUpperCase())}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              style={{ textTransform: 'uppercase' }}
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-2">
                            <input
                              type="text"
                              value={battery.ccaRating}
                              onChange={(e) => updateBattery(battery.id, 'ccaRating', e.target.value.toUpperCase())}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              style={{ textTransform: 'uppercase' }}
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-2">
                            <input
                              type="text"
                              value={battery.ccaTested}
                              onChange={(e) => updateBattery(battery.id, 'ccaTested', e.target.value.toUpperCase())}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                              style={{ textTransform: 'uppercase' }}
                            />
                          </td>
                          <td className="border border-gray-300 px-2 py-2">
                            <select
                              value={battery.passFail}
                              onChange={(e) => updateBattery(battery.id, 'passFail', e.target.value)}
                              disabled={readOnly}
                              className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                            >
                              <option value="Pass">PASS</option>
                              <option value="Fail">FAIL</option>
                            </select>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ))}

            {!readOnly && (
              <button
                onClick={addBattery}
                className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                ADD BATTERY
              </button>
            )}
          </div>
        </div>

      </div>
      )}
    </div>
  );
}
