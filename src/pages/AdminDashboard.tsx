import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSubmission } from '../types/form';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FileText, Clock, CheckCircle, ExternalLink, Plus, Trash2, ChevronDown, ChevronUp, Search, Filter, Calendar, User, MapPin, Wrench, Battery, Zap, AlertCircle, Package, DollarSign, ClipboardList } from 'lucide-react';
import { authFetch } from '../utils/authFetch';

const API =
  (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) ||
  "https://legacywobe.azurewebsites.net/api";

export function AdminDashboard() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'pending'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      const res = await authFetch(`${API}/forms`);
      if (!res.ok) throw new Error("Failed to load submissions");

      const data = await res.json();
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const performDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await authFetch(`${API}/forms/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error("Failed to delete");

      setSubmissions(prev => prev.filter(s => s.id !== id));
      showToast('Form deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting form:', error);
      showToast('Error deleting form', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteClick = (submission: FormSubmission) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Form Submission?',
      message: `Are you sure you want to permanently delete the form for Job/PO # "${submission.job_po_number}"? This action cannot be undone.`,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, isOpen: false });
        await performDelete(submission.id!);
      }
    });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const filteredSubmissions = submissions.filter(sub => {
    const matchesSearch =
      sub.job_po_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.customer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.site_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.technician?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true :
      statusFilter === 'submitted' ? sub.http_post_sent :
      !sub.http_post_sent;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-md border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-4">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-14 object-contain"
              />
              <div className="hidden sm:block w-px h-12 bg-gray-300"></div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 leading-tight">Manage form submissions and reports</p>
              </div>
            </div>

            {/* Mobile Title */}
            <div className="sm:hidden flex-1 text-center">
              <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            </div>

            {/* Right Section - Action Button */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/form/new')}
                className="btn-primary flex items-center gap-2 px-4 py-2.5"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">New Form</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Search and Filter Bar */}
        <div className="section-card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Job #, Customer, Site, or Technician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All ({submissions.length})
              </button>
              <button
                onClick={() => setStatusFilter('submitted')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'submitted'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Submitted ({submissions.filter(s => s.http_post_sent).length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Pending ({submissions.filter(s => !s.http_post_sent).length})
              </button>
            </div>
          </div>
        </div>

        <div className="section-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-gray-600" />
              <span className="text-lg font-semibold text-gray-700">
                Showing {filteredSubmissions.length} of {submissions.length} forms
              </span>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16">
              <FileText size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600 text-xl font-medium mb-6">
                {searchTerm || statusFilter !== 'all' ? 'No matching forms found' : 'No submissions found'}
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => navigate('/form/new')}
                  className="btn-primary"
                >
                  Create First Form
                </button>
              )}
            </div>
          ) : (
            <>
              {/* --- SUBMISSIONS LIST --- */}
              <div className="space-y-3">
                {filteredSubmissions.map((submission) => {
                  const isExpanded = expandedRows.has(submission.id!);

                  return (
                    <div key={submission.id} className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                      {/* Main Row */}
                      <div className="p-4 sm:p-6 flex items-center justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
                          {/* Status */}
                          <div className="flex items-center gap-2">
                            {submission.http_post_sent ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-lg">
                                <CheckCircle size={16} />
                                Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold rounded-lg">
                                <Clock size={16} />
                                Pending
                              </span>
                            )}
                          </div>

                          {/* Job Number */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Job/PO #</div>
                            <div className="font-bold text-gray-900">{submission.job_po_number}</div>
                          </div>

                          {/* Customer */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Customer</div>
                            <div className="font-medium text-gray-800">{submission.customer || '-'}</div>
                          </div>

                          {/* Site */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Site</div>
                            <div className="font-medium text-gray-800">{submission.site_name || '-'}</div>
                          </div>

                          {/* Technician */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Technician</div>
                            <div className="font-medium text-gray-800">{submission.technician || '-'}</div>
                          </div>

                          {/* Date */}
                          <div>
                            <div className="text-xs text-gray-500 mb-1">Service Date</div>
                            <div className="font-medium text-gray-800">{submission.date || '-'}</div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleRow(submission.id!)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={isExpanded ? 'Collapse details' : 'Expand details'}
                          >
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </button>
                          <button
                            onClick={() => navigate(`/form/${submission.id}/${submission.job_po_number}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink size={16} />
                            Open
                          </button>
                          <button
                            onClick={() => handleDeleteClick(submission)}
                            disabled={deleting === submission.id}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2 hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            <Trash2 size={16} />
                            {deleting === submission.id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t-2 border-gray-200 bg-gray-50 p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">

                            {/* General Information */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <MapPin size={18} className="text-blue-600" />
                                <h3 className="font-bold text-gray-900">General Information</h3>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div><span className="text-gray-600">Address:</span> <span className="font-medium">{submission.site_address || '-'}</span></div>
                                <div><span className="text-gray-600">Service Type:</span> <span className="font-medium">{submission.type_of_service || '-'}</span></div>
                                <div><span className="text-gray-600">Contact:</span> <span className="font-medium">{submission.contact_name || '-'}</span></div>
                                <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{submission.contact_phone || '-'}</span></div>
                                <div><span className="text-gray-600">Email:</span> <span className="font-medium">{submission.contact_email || '-'}</span></div>
                                <div><span className="text-gray-600">Next Inspection:</span> <span className="font-medium">{submission.next_inspection_due || '-'}</span></div>
                                <div><span className="text-gray-600">Created:</span> <span className="font-medium">{formatDate(submission.created_at)}</span></div>
                              </div>
                            </div>

                            {/* Equipment Details */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <Wrench size={18} className="text-orange-600" />
                                <h3 className="font-bold text-gray-900">Equipment</h3>
                              </div>
                              <div className="space-y-3 text-sm">
                                {submission.equipment_generator && (
                                  <div className="border-l-2 border-orange-400 pl-3">
                                    <div className="font-semibold text-orange-700">Generator</div>
                                    <div className="text-gray-600">Make: {submission.equipment_generator.make || '-'}</div>
                                    <div className="text-gray-600">Model: {submission.equipment_generator.model || '-'}</div>
                                    <div className="text-gray-600">Serial: {submission.equipment_generator.serial || '-'}</div>
                                    <div className="text-gray-600">KW: {submission.equipment_generator.kw || '-'}</div>
                                    <div className="text-gray-600">Hours: {submission.equipment_generator.hours || '-'}</div>
                                  </div>
                                )}
                                {submission.equipment_engine && (
                                  <div className="border-l-2 border-blue-400 pl-3">
                                    <div className="font-semibold text-blue-700">Engine</div>
                                    <div className="text-gray-600">Make: {submission.equipment_engine.make || '-'}</div>
                                    <div className="text-gray-600">Model: {submission.equipment_engine.model || '-'}</div>
                                    <div className="text-gray-600">Serial: {submission.equipment_engine.serial || '-'}</div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Maintenance Info */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                              <div className="flex items-center gap-2 mb-3">
                                <Calendar size={18} className="text-purple-600" />
                                <h3 className="font-bold text-gray-900">Maintenance</h3>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div><span className="text-gray-600">Exercise Day:</span> <span className="font-medium">{submission.exercise_day || '-'}</span></div>
                                <div><span className="text-gray-600">Exercise Time:</span> <span className="font-medium">{submission.exercise_time || '-'}</span></div>
                                <div><span className="text-gray-600">With Load:</span> <span className="font-medium">{submission.with_load || '-'}</span></div>
                                <div><span className="text-gray-600">Last Oil Change:</span> <span className="font-medium">{submission.date_last_oil_change || '-'}</span></div>
                                <div><span className="text-gray-600">Battery Date:</span> <span className="font-medium">{submission.battery_date || '-'}</span></div>
                                <div><span className="text-gray-600">Battery Type:</span> <span className="font-medium">{submission.battery_type || '-'}</span></div>
                                <div><span className="text-gray-600">Fuel Type:</span> <span className="font-medium">{submission.fuel_type || '-'}</span></div>
                                <div><span className="text-gray-600">Fuel %:</span> <span className="font-medium">{submission.fuel_percentage ? `${submission.fuel_percentage}%` : '-'}</span></div>
                              </div>
                            </div>

                            {/* Service Intervals */}
                            {(submission.service_coolant_flush_due || submission.service_batteries_due || submission.service_belts_due || submission.service_hoses_due) && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <AlertCircle size={18} className="text-red-600" />
                                  <h3 className="font-bold text-gray-900">Service Intervals Due</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                  {submission.service_coolant_flush_due && (
                                    <div className="flex items-center gap-2 text-red-600">
                                      <CheckCircle size={16} />
                                      <span>Coolant Flush</span>
                                    </div>
                                  )}
                                  {submission.service_batteries_due && (
                                    <div className="flex items-center gap-2 text-red-600">
                                      <CheckCircle size={16} />
                                      <span>Batteries</span>
                                    </div>
                                  )}
                                  {submission.service_belts_due && (
                                    <div className="flex items-center gap-2 text-red-600">
                                      <CheckCircle size={16} />
                                      <span>Belts</span>
                                    </div>
                                  )}
                                  {submission.service_hoses_due && (
                                    <div className="flex items-center gap-2 text-red-600">
                                      <CheckCircle size={16} />
                                      <span>Hoses</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Battery Readings */}
                            {submission.battery_health_readings && submission.battery_health_readings.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Battery size={18} className="text-green-600" />
                                  <h3 className="font-bold text-gray-900">Battery Readings ({submission.battery_health_readings.length})</h3>
                                </div>
                                <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                                  {submission.battery_health_readings.map((battery, idx) => (
                                    <div key={battery.id} className="border-l-2 border-green-400 pl-2 py-1">
                                      <div className="font-semibold">Battery #{battery.battery}</div>
                                      <div className="text-gray-600">Voltage: {battery.voltage}V | CCA: {battery.ccaTested}/{battery.ccaRating}</div>
                                      <div className={`font-medium ${battery.passFail === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                                        {battery.passFail} ({battery.testedPercent}%)
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommended Parts */}
                            {submission.recommended_parts && submission.recommended_parts.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Package size={18} className="text-indigo-600" />
                                  <h3 className="font-bold text-gray-900">Recommended Parts ({submission.recommended_parts.length})</h3>
                                </div>
                                <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                                  {submission.recommended_parts.map((part) => (
                                    <div key={part.id} className="border-b border-gray-200 pb-2">
                                      <div className="font-semibold">Qty: {part.qty} | {part.partNo}</div>
                                      <div className="text-gray-600">{part.description}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Parts/Supplies Used */}
                            {submission.parts_supplies_used && submission.parts_supplies_used.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <DollarSign size={18} className="text-emerald-600" />
                                  <h3 className="font-bold text-gray-900">Parts Used ({submission.parts_supplies_used.length})</h3>
                                </div>
                                <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                                  {submission.parts_supplies_used.map((part) => (
                                    <div key={part.id} className="border-b border-gray-200 pb-2">
                                      <div className="font-semibold">Qty: {part.qty} | {part.partNo}</div>
                                      <div className="text-gray-600">{part.description}</div>
                                      <div className="text-emerald-700 font-medium">${part.cost} - From: {part.from}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Time Entries */}
                            {submission.time_on_job && submission.time_on_job.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Clock size={18} className="text-cyan-600" />
                                  <h3 className="font-bold text-gray-900">Time Entries ({submission.time_on_job.length})</h3>
                                </div>
                                <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                                  {submission.time_on_job.map((time) => (
                                    <div key={time.id} className="border-b border-gray-200 pb-2">
                                      <div className="font-semibold">{time.activity}</div>
                                      <div className="text-gray-600">{time.date} | {time.startTime} - {time.endTime}</div>
                                      <div className="text-cyan-700 font-medium">Rate: ${time.rate}/hr</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Load Bank Test */}
                            {submission.load_bank_entries && submission.load_bank_entries.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Zap size={18} className="text-yellow-600" />
                                  <h3 className="font-bold text-gray-900">Load Bank Test ({submission.load_bank_entries.length} readings)</h3>
                                </div>
                                <div className="text-xs space-y-1 mb-2">
                                  <div><span className="text-gray-600">Site:</span> <span className="font-medium">{submission.load_bank_site_name || '-'}</span></div>
                                  <div><span className="text-gray-600">Resistive Load:</span> <span className="font-medium">{submission.load_bank_resistive_load || '-'}</span></div>
                                  <div><span className="text-gray-600">Reactive Load:</span> <span className="font-medium">{submission.load_bank_reactive_load || '-'}</span></div>
                                </div>
                                <div className="text-xs text-gray-500 max-h-32 overflow-y-auto">
                                  {submission.load_bank_entries.length} test readings recorded
                                </div>
                              </div>
                            )}

                            {/* Additional ATS */}
                            {submission.additional_ats && submission.additional_ats.length > 0 && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <Zap size={18} className="text-pink-600" />
                                  <h3 className="font-bold text-gray-900">Additional ATS ({submission.additional_ats.length})</h3>
                                </div>
                                <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
                                  {submission.additional_ats.map((ats) => (
                                    <div key={ats.id} className="border-l-2 border-pink-400 pl-2 py-1">
                                      <div className="font-semibold">{ats.name}</div>
                                      <div className="text-gray-600">Make: {ats.make || '-'} | Model: {ats.model || '-'}</div>
                                      <div className="text-gray-600">Serial: {ats.serial || '-'} | Amp: {ats.amp || '-'}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Work Log */}
                            {submission.work_performed && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200 lg:col-span-2">
                                <div className="flex items-center gap-2 mb-3">
                                  <ClipboardList size={18} className="text-gray-600" />
                                  <h3 className="font-bold text-gray-900">Work Performed</h3>
                                </div>
                                <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-48 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                                  {submission.work_performed}
                                </div>
                              </div>
                            )}

                            {/* Costs */}
                            {(submission.trip_charge || submission.environmental_fee || submission.consumables) && (
                              <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center gap-2 mb-3">
                                  <DollarSign size={18} className="text-green-600" />
                                  <h3 className="font-bold text-gray-900">Additional Costs</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                  {submission.trip_charge && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Trip Charge:</span>
                                      <span className="font-semibold">${submission.trip_charge}</span>
                                    </div>
                                  )}
                                  {submission.environmental_fee && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Environmental Fee:</span>
                                      <span className="font-semibold">${submission.environmental_fee}</span>
                                    </div>
                                  )}
                                  {submission.consumables && (
                                    <div className="flex justify-between">
                                      <span className="text-gray-600">Consumables:</span>
                                      <span className="font-semibold">${submission.consumables}</span>
                                    </div>
                                  )}
                                  <div className="pt-2 border-t border-gray-300 flex justify-between font-bold text-green-700">
                                    <span>Total:</span>
                                    <span>${(submission.trip_charge || 0) + (submission.environmental_fee || 0) + (submission.consumables || 0)}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="section-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-700 text-sm font-medium">Total Submissions</p>
                <p className="text-4xl font-bold text-blue-900 mt-2">{submissions.length}</p>
              </div>
              <div className="bg-blue-200 p-3 rounded-full">
                <FileText size={32} className="text-blue-700" />
              </div>
            </div>
          </div>

          <div className="section-card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-700 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold text-yellow-900 mt-2">
                  {submissions.filter(s => !s.http_post_sent).length}
                </p>
              </div>
              <div className="bg-yellow-200 p-3 rounded-full">
                <Clock size={32} className="text-yellow-700" />
              </div>
            </div>
          </div>

          <div className="section-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-700 text-sm font-medium">Submitted</p>
                <p className="text-4xl font-bold text-green-900 mt-2">
                  {submissions.filter(s => s.http_post_sent).length}
                </p>
              </div>
              <div className="bg-green-200 p-3 rounded-full">
                <CheckCircle size={32} className="text-green-700" />
              </div>
            </div>
          </div>

          <div className="section-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-700 text-sm font-medium">Total Parts Used</p>
                <p className="text-4xl font-bold text-purple-900 mt-2">
                  {submissions.reduce((acc, s) => acc + (s.parts_supplies_used?.length || 0), 0)}
                </p>
              </div>
              <div className="bg-purple-200 p-3 rounded-full">
                <Package size={32} className="text-purple-700" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="section-card">
            <div className="flex items-center gap-3 mb-4">
              <Battery className="text-green-600" size={24} />
              <h3 className="font-bold text-gray-900">Battery Tests</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {submissions.reduce((acc, s) => acc + (s.battery_health_readings?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total battery readings recorded</p>
          </div>

          <div className="section-card">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="text-yellow-600" size={24} />
              <h3 className="font-bold text-gray-900">Load Bank Tests</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              {submissions.filter(s => s.load_bank_entries && s.load_bank_entries.length > 0).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Forms with load bank testing</p>
          </div>

          <div className="section-card">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-red-600" size={24} />
              <h3 className="font-bold text-gray-900">Service Due</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {submissions.filter(s =>
                s.service_coolant_flush_due ||
                s.service_batteries_due ||
                s.service_belts_due ||
                s.service_hoses_due
              ).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Units requiring service</p>
          </div>
        </div>

        {/* User Management Button */}
        {localStorage.getItem("userRole") === "superadmin" && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/admin/users')}
              className="btn-secondary w-full sm:w-auto flex items-center gap-2 justify-center"
            >
              <User size={18} />
              Manage Users
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border-l-4 ${
          toast.type === 'success'
            ? 'bg-green-50 text-green-800 border-green-500'
            : 'bg-red-50 text-red-800 border-red-500'
        }`}>
          <CheckCircle size={22} className="flex-shrink-0" />
          <span className="font-medium">{toast.message}</span>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
