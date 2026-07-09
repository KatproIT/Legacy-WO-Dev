import { FormSubmission, RecommendedPart, PartsSupply } from '../types/form';

interface DynamicTablesSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

const RECOMMENDED_PARTS_ROWS = 5;
const PARTS_SUPPLIES_ROWS = 10;

function makeEmptyRecommendedPart(index: number): RecommendedPart {
  return {
    id: `recommended-slot-${index}`,
    qty: '',
    partNo: '',
    description: '',
  };
}

function makeEmptyPartsSupply(index: number): PartsSupply {
  return {
    id: `parts-slot-${index}`,
    qty: '',
    partNo: '',
    description: '',
    cost: '',
    from: 'PURCHASED',
  };
}

function isRecommendedPartEmpty(p: RecommendedPart | undefined): boolean {
  if (!p) return true;
  return !p.qty && !p.partNo && !p.description;
}

function isPartsSupplyEmpty(p: PartsSupply | undefined): boolean {
  if (!p) return true;
  return !p.qty && !p.partNo && !p.description && !p.cost;
}

export function DynamicTablesSection({ formData, onChange, readOnly, hasValidationErrors }: DynamicTablesSectionProps) {
  const recommendedParts = formData.recommended_parts || [];
  const partsSupplies = formData.parts_supplies_used || [];

  const updateRecommendedPartAt = (index: number, field: keyof RecommendedPart, value: any) => {
    const uppercasedValue = (field === 'partNo' || field === 'description') && typeof value === 'string' ? value.toUpperCase() : value;
    const padded: RecommendedPart[] = [];
    for (let i = 0; i <= index; i++) {
      const existing = recommendedParts[i];
      if (existing) {
        padded.push(existing);
      } else {
        const empty = makeEmptyRecommendedPart(i);
        empty.id = `${Date.now()}-r-${i}`;
        padded.push(empty);
      }
    }
    for (let i = index + 1; i < recommendedParts.length; i++) {
      padded.push(recommendedParts[i]);
    }
    padded[index] = { ...padded[index], [field]: uppercasedValue };
    onChange('recommended_parts', padded.slice(0, RECOMMENDED_PARTS_ROWS));
  };

  const updatePartsSupplyAt = (index: number, field: keyof PartsSupply, value: any) => {
    const uppercasedValue = (field === 'partNo' || field === 'description') && typeof value === 'string' ? value.toUpperCase() : value;
    const padded: PartsSupply[] = [];
    for (let i = 0; i <= index; i++) {
      const existing = partsSupplies[i];
      if (existing) {
        padded.push(existing);
      } else {
        const empty = makeEmptyPartsSupply(i);
        empty.id = `${Date.now()}-p-${i}`;
        padded.push(empty);
      }
    }
    for (let i = index + 1; i < partsSupplies.length; i++) {
      padded.push(partsSupplies[i]);
    }
    padded[index] = { ...padded[index], [field]: uppercasedValue };
    onChange('parts_supplies_used', padded.slice(0, PARTS_SUPPLIES_ROWS));
  };

  const totalPartsCost = partsSupplies.reduce((sum, part) => {
    const qty = parseFloat(part.qty) || 0;
    const cost = parseFloat(part.cost) || 0;
    return sum + (qty * cost);
  }, 0);

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white border border-gray-300 shadow-sm" data-print-section="service-interval">
        <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
          MANUFACTURE - FACTORY RECOMMENDED SERVICE INTERVAL
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">SERVICE TYPE</th>
                <th className="border border-gray-300 px-4 py-2 text-left">SERVICE INTERVAL</th>
                <th className="border border-gray-300 px-4 py-2 text-center">DUE</th>
              </tr>
            </thead>
            <tbody>
              {[
                { type: 'COOLANT FLUSH', interval: 'EVERY 5 YEARS', field: 'service_coolant_flush_due' },
                { type: 'BATTERIES', interval: 'EVERY 3 YEARS', field: 'service_batteries_due' },
                { type: 'BELTS', interval: 'EVERY 3 YEARS', field: 'service_belts_due' },
                { type: 'HOSES', interval: 'EVERY 3 YEARS', field: 'service_hoses_due' },
              ].map((item, index) => (
                <tr key={item.type} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-4 py-2">{item.type}</td>
                  <td className="border border-gray-300 px-4 py-2">{item.interval}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={formData[item.field as keyof FormSubmission] as boolean || false}
                      onChange={(e) => onChange(item.field, e.target.checked)}
                      disabled={readOnly}
                      className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm" data-print-section="recommended-parts">
        <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
          RECOMMENDED PARTS REPLACEMENT
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-3 py-2 text-center">QTY</th>
                <th className="border border-gray-300 px-3 py-2 text-center">PART NO.</th>
                <th className="border border-gray-300 px-3 py-2 text-center">DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: RECOMMENDED_PARTS_ROWS }, (_, index) => {
                const part = recommendedParts[index] ?? makeEmptyRecommendedPart(index);
                const empty = isRecommendedPartEmpty(recommendedParts[index]);
                const rowBg = empty ? 'bg-gray-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
                const cellBg = empty ? 'bg-gray-100' : '';
                return (
                  <tr key={index} className={rowBg}>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={part.qty}
                        onChange={(e) => updateRecommendedPartAt(index, 'qty', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={part.partNo}
                        onChange={(e) => updateRecommendedPartAt(index, 'partNo', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={part.description}
                        onChange={(e) => updateRecommendedPartAt(index, 'description', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="section-card" data-print-section="work-performed">
        <h2 className="section-header">
          WORK PERFORMED <span className="text-red-600">*</span>
        </h2>
        <div className="p-4">
          <textarea
            value={formData.work_performed || ''}
            onChange={(e) => onChange('work_performed', e.target.value)}
            disabled={readOnly}
            rows={16}
            spellCheck={true}
            style={{ minHeight: '450px' }}
            className={`w-full px-3 py-2 focus:outline-none disabled:bg-gray-100 resize-y ${
              hasValidationErrors && (!formData.work_performed || formData.work_performed === '')
                ? 'border-2 border-red-500 bg-red-50 focus:ring-2 focus:ring-red-500'
                : 'border border-gray-300 focus:ring-2 focus:ring-blue-500'
            }`}
            placeholder="Describe the work performed..."
          />
        </div>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm" data-section="parts-supplies" data-print-section="parts-supplies">
        <div className="bg-blue-600 text-white px-4 py-2 font-semibold">
          PARTS & SUPPLIES USED
        </div>
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-blue-100">
                <th className="border border-gray-300 px-3 py-2 text-center">QTY</th>
                <th className="border border-gray-300 px-3 py-2 text-center">PART NO.</th>
                <th className="border border-gray-300 px-3 py-2 text-center">DESCRIPTION</th>
                <th className="border border-gray-300 px-3 py-2 text-center">COST</th>
                <th className="border border-gray-300 px-3 py-2 text-center">LINE ITEM TOTAL</th>
                <th className="border border-gray-300 px-3 py-2 text-center">FROM</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: PARTS_SUPPLIES_ROWS }, (_, index) => {
                const part = partsSupplies[index] ?? makeEmptyPartsSupply(index);
                const empty = isPartsSupplyEmpty(partsSupplies[index]);
                const rowBg = empty ? 'bg-gray-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50');
                const cellBg = empty ? 'bg-gray-100' : '';
                return (
                  <tr key={index} className={rowBg}>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={part.qty}
                        onChange={(e) => updatePartsSupplyAt(index, 'qty', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={part.partNo}
                        onChange={(e) => updatePartsSupplyAt(index, 'partNo', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="text"
                        value={part.description}
                        onChange={(e) => updatePartsSupplyAt(index, 'description', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={part.cost}
                        onChange={(e) => updatePartsSupplyAt(index, 'cost', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      />
                    </td>
                    <td className="border border-gray-300 px-2 py-2 bg-gray-100 text-center font-medium">
                      ${((parseFloat(part.qty) || 0) * (parseFloat(part.cost) || 0)).toFixed(2)}
                    </td>
                    <td className="border border-gray-300 px-2 py-2">
                      <select
                        value={part.from}
                        onChange={(e) => updatePartsSupplyAt(index, 'from', e.target.value)}
                        disabled={readOnly}
                        className={`w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 ${cellBg}`}
                      >
                        <option value="PURCHASED">PURCHASED</option>
                        <option value="WAREHOUSE">WAREHOUSE</option>
                        <option value="CUSTOMER">CUSTOMER</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-blue-100 font-bold">
                <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right">TOTAL PARTS</td>
                <td className="border border-gray-300 px-4 py-2">${totalPartsCost.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 bg-gray-100 text-center font-bold">${totalPartsCost.toFixed(2)}</td>
                <td className="border border-gray-300"></td>
              </tr>
            </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
