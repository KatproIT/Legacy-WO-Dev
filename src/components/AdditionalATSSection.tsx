import { FormSubmission, AdditionalATS } from '../types/form';
import { Plus, Trash2 } from 'lucide-react';

interface AdditionalATSSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

export function AdditionalATSSection({ formData, onChange, readOnly }: AdditionalATSSectionProps) {
  const additionalATS = formData.additional_ats || [];

  const addATS = () => {
    const newATS: AdditionalATS = {
      id: Math.random().toString(36).substr(2, 9),
      name: `ATS ${additionalATS.length + 3}`,
      make: '',
      model: '',
      serial: '',
      spec: '',
      phase: '',
      voltage: '',
      amp: ''
    };
    onChange('additional_ats', [...additionalATS, newATS]);
  };

  const removeATS = (id: string) => {
    onChange('additional_ats', additionalATS.filter((ats: AdditionalATS) => ats.id !== id));
  };

  const updateATS = (id: string, field: string, value: string) => {
    onChange(
      'additional_ats',
      additionalATS.map((ats: AdditionalATS) =>
        ats.id === id ? { ...ats, [field]: value.toUpperCase() } : ats
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Additional ATS Units (ATS 3-6)</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={addATS}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add ATS Unit
          </button>
        )}
      </div>

      {additionalATS.length === 0 ? (
        <div className="bg-gray-50 border border-gray-300 p-8 text-center text-gray-500">
          No additional ATS units added. Click "Add ATS Unit" to add one.
        </div>
      ) : (
        <div className="space-y-6">
          {additionalATS.map((ats: AdditionalATS, index: number) => (
            <div key={ats.id} className="bg-white border border-gray-300 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{ats.name}</h3>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => removeATS(ats.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MAKE</label>
                  <input
                    type="text"
                    value={ats.make || ''}
                    onChange={(e) => updateATS(ats.id, 'make', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MODEL</label>
                  <input
                    type="text"
                    value={ats.model || ''}
                    onChange={(e) => updateATS(ats.id, 'model', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SERIAL</label>
                  <input
                    type="text"
                    value={ats.serial || ''}
                    onChange={(e) => updateATS(ats.id, 'serial', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SPEC</label>
                  <input
                    type="text"
                    value={ats.spec || ''}
                    onChange={(e) => updateATS(ats.id, 'spec', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PHASE</label>
                  <select
                    value={ats.phase || ''}
                    onChange={(e) => updateATS(ats.id, 'phase', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">SELECT</option>
                    <option value="1P">1P</option>
                    <option value="3P">3P</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VOLTAGE</label>
                  <select
                    value={ats.voltage || ''}
                    onChange={(e) => updateATS(ats.id, 'voltage', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">SELECT</option>
                    <option value="208">208</option>
                    <option value="240">240</option>
                    <option value="480">480</option>
                    <option value="MULTI">MULTI</option>
                    <option value="N/A">N/A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AMP</label>
                  <input
                    type="text"
                    value={ats.amp || ''}
                    onChange={(e) => updateATS(ats.id, 'amp', e.target.value)}
                    disabled={readOnly}
                    className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
