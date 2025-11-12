import { useState } from 'react';
import { FormSubmission, BatteryReading } from '../types/form';
import { ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { getInputClass } from '../utils/formValidation';

interface MaintenanceInfoSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

export function MaintenanceInfoSection({ formData, onChange, readOnly, hasValidationErrors }: MaintenanceInfoSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
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
        Maintenance Information
      </h2>

      {!isCollapsed && (
      <>
      <div className="bg-white border border-gray-300 shadow-sm mb-6">
        <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
          BATTERY INFORMATION <span className="text-white">*</span>
        </div>
        <div className="p-4 space-y-6">
          {batteryReadings.map((battery, index) => (
            <div key={battery.id}>
              {index > 0 && (
                <div className="mb-6 border-t-2 border-gray-300"></div>
              )}

              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-700">Battery {battery.battery}</h3>
                  {!readOnly && (
                    <button
                      onClick={() => removeBattery(battery.id)}
                      className="text-red-600 hover:text-red-800 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={18} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Battery Date</label>
                    <input
                      type="date"
                      value={battery.batteryDate || ''}
                      onChange={(e) => updateBattery(battery.id, 'batteryDate', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Battery Type</label>
                    <input
                      type="text"
                      value={battery.batteryType || ''}
                      onChange={(e) => updateBattery(battery.id, 'batteryType', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Battery Charger Volts</label>
                    <input
                      type="text"
                      value={battery.batteryChargerVolts || ''}
                      onChange={(e) => updateBattery(battery.id, 'batteryChargerVolts', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="border border-gray-300 px-3 py-2 text-center">Voltage</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">CCA Rating</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">CCA Tested</th>
                        <th className="border border-gray-300 px-3 py-2 text-center">Pass/Fail</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={battery.voltage}
                            onChange={(e) => updateBattery(battery.id, 'voltage', e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={battery.ccaRating}
                            onChange={(e) => updateBattery(battery.id, 'ccaRating', e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <input
                            type="text"
                            value={battery.ccaTested}
                            onChange={(e) => updateBattery(battery.id, 'ccaTested', e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </td>
                        <td className="border border-gray-300 px-2 py-2">
                          <select
                            value={battery.passFail}
                            onChange={(e) => updateBattery(battery.id, 'passFail', e.target.value)}
                            disabled={readOnly}
                            className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                          >
                            <option value="Pass">Pass</option>
                            <option value="Fail">Fail</option>
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
              Add Battery
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm">
        <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
          ATS EXERCISER
        </div>
        <div className="p-4">
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
            value={formData.exercise_time || ''}
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
        </div>
      </div>
      </>
      )}
    </div>
  );
}
