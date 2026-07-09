import { FormSubmission, TimeEntry } from '../types/form';

interface WorkLogSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

const TIME_ENTRY_ROWS = 10;

function getOrdinal(n: number): string {
  const suffixes = ['TH', 'ST', 'ND', 'RD'];
  const v = n % 100;
  return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
}

function makeEmptyTimeEntry(index: number): TimeEntry {
  return {
    id: `time-slot-${index}`,
    activity: `(${getOrdinal(index + 1)} DAY) TIME ON JOB`,
    date: '',
    rate: '',
    startTime: '00:00',
    endTime: '00:00',
  };
}

function isTimeEntryEmpty(entry: TimeEntry | undefined): boolean {
  if (!entry) return true;
  const bothTimesZero = (!entry.startTime || entry.startTime === '00:00') && (!entry.endTime || entry.endTime === '00:00');
  return !entry.date && !entry.rate && bothTimesZero;
}

export function WorkLogSection({ formData, onChange, readOnly }: WorkLogSectionProps) {
  const timeEntries = formData.time_on_job || [];
  const tripCharge = formData.trip_charge || 0;
  const environmentalFee = formData.environmental_fee || 0;
  const consumables = formData.consumables || 0;
  const partsSupplies = formData.parts_supplies_used || [];

  const totalPartsCost = partsSupplies.reduce((sum, part) => {
    const qty = parseFloat(part.qty) || 0;
    const cost = parseFloat(part.cost) || 0;
    return sum + (qty * cost);
  }, 0);

  const calculateTotalTime = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;

    const start = new Date(`2000-01-01T${startTime}`);
    let end = new Date(`2000-01-01T${endTime}`);

    if (end < start) {
      end = new Date(`2000-01-02T${endTime}`);
    }

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

  const updateTimeEntryAt = (index: number, field: keyof TimeEntry, value: any) => {
    const padded: TimeEntry[] = [];
    for (let i = 0; i <= index; i++) {
      const existing = timeEntries[i];
      if (existing) {
        padded.push({ ...existing, activity: `(${getOrdinal(i + 1)} DAY) TIME ON JOB` });
      } else {
        const empty = makeEmptyTimeEntry(i);
        empty.id = `${Date.now()}-t-${i}`;
        padded.push(empty);
      }
    }
    for (let i = index + 1; i < timeEntries.length; i++) {
      padded.push({ ...timeEntries[i], activity: `(${getOrdinal(i + 1)} DAY) TIME ON JOB` });
    }
    padded[index] = { ...padded[index], [field]: value };
    onChange('time_on_job', padded.slice(0, TIME_ENTRY_ROWS));
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="section-card" data-section="time-on-job" data-print-section="time-on-job">
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
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: TIME_ENTRY_ROWS }, (_, index) => {
                const entry = timeEntries[index] ?? makeEmptyTimeEntry(index);
                const empty = isTimeEntryEmpty(timeEntries[index]);
                const totalTime = calculateTotalTime(entry.startTime, entry.endTime);
                const totalDollar = calculateTotalDollar(entry.rate, totalTime);
                const rowBg = empty ? 'bg-gray-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
                const cellBg = empty ? 'bg-gray-100' : '';

                return (
                  <tr key={index} className={rowBg}>
                    <td className={`border border-gray-300 px-3 py-2 font-medium ${empty ? 'text-gray-400' : ''}`}>{`(${getOrdinal(index + 1)} DAY) TIME ON JOB`}</td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="date"
                        value={entry.date}
                        onChange={(e) => updateTimeEntryAt(index, 'date', e.target.value)}
                        disabled={readOnly}
                        placeholder="DD-MM-YYYY"
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={entry.rate}
                        onChange={(e) => updateTimeEntryAt(index, 'rate', e.target.value)}
                        disabled={readOnly}
                        placeholder="$0.00"
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => updateTimeEntryAt(index, 'startTime', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => updateTimeEntryAt(index, 'endTime', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      />
                    </td>
                    <td className={`border border-gray-300 px-3 py-2 text-center font-medium ${empty ? 'text-gray-400' : ''}`}>
                      {totalTime.toFixed(2)} HRS
                    </td>
                    <td className={`border border-gray-300 px-3 py-2 text-center font-medium ${empty ? 'text-gray-400' : ''}`}>
                      ${totalDollar.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-print-section="charges-totals">
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
    </div>
  );
}
