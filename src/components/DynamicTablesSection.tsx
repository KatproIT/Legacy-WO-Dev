import { Trash2, Plus } from 'lucide-react';
import { FormSubmission, RecommendedPart, PartsSupply } from '../types/form';

interface DynamicTablesSectionProps {
  formData: FormSubmission;
  onChange: (field: string, value: any) => void;
  readOnly: boolean;
  hasValidationErrors: boolean;
}

export function DynamicTablesSection({ formData, onChange, readOnly }: DynamicTablesSectionProps) {
  const recommendedParts = formData.recommended_parts || [];
  const partsSupplies = formData.parts_supplies_used || [];

  const addRecommendedPart = () => {
    const newPart: RecommendedPart = {
      id: Date.now().toString(),
      qty: '',
      partNo: '',
      description: ''
    };
    onChange('recommended_parts', [...recommendedParts, newPart]);
  };

  const removeRecommendedPart = (id: string) => {
    onChange('recommended_parts', recommendedParts.filter(p => p.id !== id));
  };

  const updateRecommendedPart = (id: string, field: keyof RecommendedPart, value: any) => {
    const uppercasedValue = (field === 'partNo' || field === 'description') && typeof value === 'string' ? value.toUpperCase() : value;
    onChange('recommended_parts', recommendedParts.map(p =>
      p.id === id ? { ...p, [field]: uppercasedValue } : p
    ));
  };

  const addPartsSupply = () => {
    const newPart: PartsSupply = {
      id: Date.now().toString(),
      qty: '',
      partNo: '',
      description: '',
      cost: '',
      from: 'PURCHASED'
    };
    onChange('parts_supplies_used', [...partsSupplies, newPart]);
  };

  const removePartsSupply = (id: string) => {
    onChange('parts_supplies_used', partsSupplies.filter(p => p.id !== id));
  };

  const updatePartsSupply = (id: string, field: keyof PartsSupply, value: any) => {
    const uppercasedValue = (field === 'partNo' || field === 'description') && typeof value === 'string' ? value.toUpperCase() : value;
    onChange('parts_supplies_used', partsSupplies.map(p =>
      p.id === id ? { ...p, [field]: uppercasedValue } : p
    ));
  };

  const totalPartsCost = partsSupplies.reduce((sum, part) => {
    const qty = parseFloat(part.qty) || 0;
    const cost = parseFloat(part.cost) || 0;
    return sum + (qty * cost);
  }, 0);

  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white border border-gray-300 shadow-sm">
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
                { type: 'Coolant Flush', interval: 'Every 5 Years', field: 'service_coolant_flush_due' },
                { type: 'Batteries', interval: 'Every 3 Years', field: 'service_batteries_due' },
                { type: 'Belts', interval: 'Every 3 Years', field: 'service_belts_due' },
                { type: 'Hoses', interval: 'Every 3 Years', field: 'service_hoses_due' },
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

      <div className="bg-white border border-gray-300 shadow-sm">
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
                <th className="border border-gray-300 px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {recommendedParts.map((part, index) => (
                <tr key={part.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={part.qty}
                      onChange={(e) => updateRecommendedPart(part.id, 'qty', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="text"
                      value={part.partNo}
                      onChange={(e) => updateRecommendedPart(part.id, 'partNo', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="text"
                      value={part.description}
                      onChange={(e) => updateRecommendedPart(part.id, 'description', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {!readOnly && (
                      <button
                        onClick={() => removeRecommendedPart(part.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
          {!readOnly && (
            <button
              onClick={addRecommendedPart}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Part
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-300 shadow-sm" data-section="parts-supplies">
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
                <th className="border border-gray-300 px-3 py-2 text-center">FROM</th>
                <th className="border border-gray-300 px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {partsSupplies.map((part, index) => (
                <tr key={part.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={part.qty}
                      onChange={(e) => updatePartsSupply(part.id, 'qty', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="text"
                      value={part.partNo}
                      onChange={(e) => updatePartsSupply(part.id, 'partNo', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="text"
                      value={part.description}
                      onChange={(e) => updatePartsSupply(part.id, 'description', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={part.cost}
                      onChange={(e) => updatePartsSupply(part.id, 'cost', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    />
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <select
                      value={part.from}
                      onChange={(e) => updatePartsSupply(part.id, 'from', e.target.value)}
                      disabled={readOnly}
                      className="w-full px-2 py-1 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
                    >
                      <option value="PURCHASED">PURCHASED</option>
                      <option value="WAREHOUSE">WAREHOUSE</option>
                      <option value="CUSTOMER">CUSTOMER</option>
                    </select>
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-center">
                    {!readOnly && (
                      <button
                        onClick={() => removePartsSupply(part.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-100 font-bold">
                <td colSpan={3} className="border border-gray-300 px-4 py-2 text-right">TOTAL PARTS</td>
                <td className="border border-gray-300 px-4 py-2">${totalPartsCost.toFixed(2)}</td>
                <td colSpan={2} className="border border-gray-300"></td>
              </tr>
            </tbody>
            </table>
          </div>
          {!readOnly && (
            <button
              onClick={addPartsSupply}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              Add Item
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
