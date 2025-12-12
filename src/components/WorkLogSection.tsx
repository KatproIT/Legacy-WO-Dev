import { Trash2, Plus } from 'lucide-react';
import { FormSubmission, TimeEntry } from '../types/form';

interface WorkLogSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

export function WorkLogSection({ formData, onChange, readOnly }: WorkLogSectionProps) {
  const timeEntries = formData.time_on_job || [];
  const tripCharge = formData.trip_charge || 0;
  const environmentalFee = formData.environmental_fee || 0;
  const consumables = formData.consumables || 0;
  const partsSupplies = formData.parts_supplies_used || [];

  const totalPartsCost = partsSupplies.reduce((sum, part) => {
    const cost = parseFloat(part.cost) || 0;
    return sum + cost;
  }, 0);

  const calculateTotalTime = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    if (end < start) return 0;

    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    return Math.round(diffHours * 100) / 100;
  };

  const calculateTotalDollar = (rate: string, totalTime: number): number => {
    const rateNum = parseFloat(rate) || 0;
    return Math.round(rateNum * totalTime * 100) / 100;
  };

  const totalLaborCost = timeEntries.reduce((sum, entry) => {
    const totalTime = calculateTotalTime(entry.startTime, entry.endTime);
    const totalDollar = calculateTotalDollar(entry.rate, totalTime);
    return sum + totalDollar;
  }, 0);

  const grandTotal = totalLaborCost + totalPartsCost + tripCharge + environmentalFee + consumables;

  const addTimeEntry = () => {
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      activity: `(${getOrdinal(timeEntries.length + 1)} DAY) TIME ON JOB`,
      date: '',
      rate: '',
      startTime: '00:00',
      endTime: '00:00'
    };
    onChange('time_on_job', [...timeEntries, newEntry]);
  };

  const removeTimeEntry = (id: string) => {
    const updated = timeEntries.filter(e => e.id !== id);
    const renumbered = updated.map((entry, index) => ({
      ...entry,
      activity: `(${getOrdinal(index + 1)} DAY) TIME ON JOB`
    }));
    onChange('time_on_job', renumbered);
  };

  const updateTimeEntry = (id: string, field: keyof TimeEntry, value: any) => {
    onChange('time_on_job', timeEntries.map(e =>
      e.id === id ? { ...e, [field]: value } : e
    ));
  };

  const getOrdinal = (n: number): string => {
    const suffixes = ['TH', 'ST', 'ND', 'RD'];
    const v = n % 100;
    return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="section-card" data-section="time-on-job">
        <h2 className="section-header">
          TIME ON JOB
        </h2>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-3 py-2 text-center">ACTIVITY</th>
                <th className="border border-gray-300 px-3 py-2 text-center">DATE</th>
                <th className="border border-gray-300 px-3 py-2 text-center">RATE</th>
                <th className="border border-gray-300 px-3 py-2 text-center">START TIME</th>
                <th className="border border-gray-300 px-3 py-2 text-center">END TIME</th>
                <th className="border border-gray-300 px-3 py-2 text-center">TOTAL TIME</th>
                <th className="border border-gray-300 px-3 py-2 text-center">TOTAL ($)</th>
                <th className="border border-gray-300 px-3 py-2 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {timeEntries.map((entry, index) => {
                const totalTime = calculateTotalTime(entry.startTime, entry.endTime);
                const totalDollar = calculateTotalDollar(entry.rate, totalTime);

                return (
                  <tr key={entry.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{entry.activity}</td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateTimeEntry(entry.id, 'date', e.target.value)}
                        disabled={readOnly}
                        placeholder="DD-MM-YYYY"
                        className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.rate}
                        onChange={(e) => updateTimeEntry(entry.id, 'rate', e.target.value)}
                        disabled={readOnly}
                        placeholder="$0.00"
                        className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateTimeEntry(entry.id, 'startTime', e.target.value)}
                        disabled={readOnly}
                        className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateTimeEntry(entry.id, 'endTime', e.target.value)}
                        disabled={readOnly}
                        className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      />
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                      {totalTime.toFixed(2)} HRS
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center font-medium">
                      ${totalDollar.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {!readOnly && (
                        <button
                          onClick={() => removeTimeEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
          {!readOnly && (
            <button
              onClick={addTimeEntry}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              ADD DAY
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="section-card" data-section="additional-charges">
          <div className="bg-blue-100 px-4 py-2 font-semibold border-b border-gray-300">
            ADDITIONAL CHARGES
          </div>
          <div className="p-4 space-y-3">
            <div>
              <label className="form-label">TRIP CHARGE</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.trip_charge ?? ''}
                onChange={(e) => onChange('trip_charge', e.target.value === '' ? null : parseFloat(e.target.value))}
                disabled={readOnly}
                placeholder="$0.00"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">ENVIRONMENTAL FEE</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.environmental_fee ?? ''}
                onChange={(e) => onChange('environmental_fee', e.target.value === '' ? null : parseFloat(e.target.value))}
                disabled={readOnly}
                placeholder="$0.00"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">CONSUMABLES</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.consumables ?? ''}
                onChange={(e) => onChange('consumables', e.target.value === '' ? null : parseFloat(e.target.value))}
                disabled={readOnly}
                placeholder="$0.00"
                className="form-input"
              />
            </div>
          </div>
        </div>

        <div className="section-card" data-section="totals">
          <div className="bg-blue-100 px-4 py-2 font-semibold border-b border-gray-300">
            TOTALS
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">LABOR COST:</span>
              <span className="text-lg font-semibold">${totalLaborCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">PARTS COST:</span>
              <span className="text-lg font-semibold">${totalPartsCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">TRIP CHARGE:</span>
              <span className="text-lg font-semibold">${tripCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">ENVIRONMENTAL FEE:</span>
              <span className="text-lg font-semibold">${environmentalFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">CONSUMABLES:</span>
              <span className="text-lg font-semibold">${consumables.toFixed(2)}</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-3 mt-3">
              <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                <span className="text-lg font-bold">TOTAL PARTS & LABOR</span>
                <span className="text-2xl font-bold">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card">
        <h2 className="section-header">
          WORK PERFORMED <span className="text-red-600">*</span>
        </h2>
        <div className="p-4">
          <textarea
            value={formData.work_performed || ''}
            onChange={(e) => onChange('work_performed', e.target.value)}
            disabled={readOnly}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-y"
            placeholder="DESCRIBE THE WORK PERFORMED..."
          />
        </div>
      </div>
    </div>
  );
}
