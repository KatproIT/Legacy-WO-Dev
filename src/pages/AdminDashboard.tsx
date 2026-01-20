import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormSubmission } from '../types/form';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FileText, Clock, CheckCircle, ExternalLink, Plus, Trash2, ChevronDown, ChevronUp, Search, Filter, Calendar, User, MapPin, Wrench, Battery, Zap, AlertCircle, Package, DollarSign, ClipboardList, XCircle } from 'lucide-react';
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [customerFilter, setCustomerFilter] = useState<string>('all');
  const [siteFilter, setSiteFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [poNumberFilter, setPONumberFilter] = useState<string>('');

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

  // Extract unique values for filters
  const uniqueTechnicians = Array.from(new Set(submissions.map(s => s.technician).filter(Boolean)));
  const uniqueCustomers = Array.from(new Set(submissions.map(s => s.customer).filter(Boolean)));
  const uniqueSites = Array.from(new Set(submissions.map(s => s.site_name).filter(Boolean)));
  const uniqueServiceTypes = Array.from(new Set(
    submissions.map(s => s.type_of_service).filter(Boolean).flatMap(s => s.split(',').map(t => t.trim()))
  ));

  const clearAllFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setTechnicianFilter('all');
    setCustomerFilter('all');
    setSiteFilter('all');
    setServiceTypeFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setPONumberFilter('');
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

    const matchesTechnician =
      technicianFilter === 'all' ? true :
      sub.technician === technicianFilter;

    const matchesCustomer =
      customerFilter === 'all' ? true :
      sub.customer === customerFilter;

    const matchesSite =
      siteFilter === 'all' ? true :
      sub.site_name === siteFilter;

    const matchesServiceType =
      serviceTypeFilter === 'all' ? true :
      sub.type_of_service?.includes(serviceTypeFilter);

    const matchesDateFrom =
      !dateFromFilter ? true :
      sub.date && sub.date >= dateFromFilter;

    const matchesDateTo =
      !dateToFilter ? true :
      sub.date && sub.date <= dateToFilter;

    const matchesPONumber =
      !poNumberFilter ? true :
      sub.job_po_number?.toLowerCase().includes(poNumberFilter.toLowerCase());

    return matchesSearch && matchesStatus && matchesTechnician &&
           matchesCustomer && matchesSite && matchesServiceType &&
           matchesDateFrom && matchesDateTo && matchesPONumber;
  });

  const activeFilterCount = [
    technicianFilter !== 'all',
    customerFilter !== 'all',
    siteFilter !== 'all',
    serviceTypeFilter !== 'all',
    dateFromFilter !== '',
    dateToFilter !== '',
    poNumberFilter !== '',
    statusFilter !== 'all'
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-900">Loading Dashboard...</p>
          <p className="text-sm text-gray-500 mt-1">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src="/image.png"
                alt="Legacy Power Systems"
                className="h-14 sm:h-16 object-contain"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-0.5">Manage and monitor all service submissions</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/form/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all duration-200 flex items-center gap-2 w-full sm:w-auto justify-center hover:shadow-md"
            >
              <Plus size={20} />
              New Submission
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* User Management Section */}
        {localStorage.getItem("userRole") === "superadmin" && (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">User Management</h3>
                <p className="text-sm text-gray-500">Add, edit, or remove user accounts and permissions</p>
              </div>
              <button
                onClick={() => navigate('/admin/users')}
                className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 hover:shadow-md"
              >
                <User size={18} />
                Manage Users
              </button>
            </div>
          </div>
        )}

        {/* Key Metrics Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{submissions.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FileText size={28} className="text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">
                  {submissions.filter(s => !s.http_post_sent).length}
                </p>
              </div>
              <div className="bg-amber-100 p-3 rounded-lg">
                <Clock size={28} className="text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Submitted</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {submissions.filter(s => s.http_post_sent).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle size={28} className="text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Service Due</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {submissions.filter(s =>
                    s.service_coolant_flush_due ||
                    s.service_batteries_due ||
                    s.service_belts_due ||
                    s.service_hoses_due
                  ).length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertCircle size={28} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          {/* Main Search and Status Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Quick search by Job #, Customer, Site, or Technician..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All <span className="ml-1 font-bold">({submissions.length})</span>
              </button>
              <button
                onClick={() => setStatusFilter('submitted')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'submitted'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Submitted <span className="ml-1 font-bold">({submissions.filter(s => s.http_post_sent).length})</span>
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-5 py-2.5 rounded-lg font-medium transition-all ${
                  statusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending <span className="ml-1 font-bold">({submissions.filter(s => !s.http_post_sent).length})</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
            >
              <Filter size={18} />
              <span>Advanced Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <XCircle size={16} />
                Clear All Filters
              </button>
            )}
          </div>

          {/* Advanced Filters Panel */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 pt-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* PO Number Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-gray-500" />
                    Job/PO Number
                  </label>
                  <input
                    type="text"
                    placeholder="Filter by PO #..."
                    value={poNumberFilter}
                    onChange={(e) => setPONumberFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                {/* Technician Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    Technician
                  </label>
                  <select
                    value={technicianFilter}
                    onChange={(e) => setTechnicianFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="all">All Technicians ({uniqueTechnicians.length})</option>
                    {uniqueTechnicians.sort().map((tech) => (
                      <option key={tech} value={tech}>
                        {tech} ({submissions.filter(s => s.technician === tech).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Customer Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-gray-500" />
                    Customer
                  </label>
                  <select
                    value={customerFilter}
                    onChange={(e) => setCustomerFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="all">All Customers ({uniqueCustomers.length})</option>
                    {uniqueCustomers.sort().map((customer) => (
                      <option key={customer} value={customer}>
                        {customer} ({submissions.filter(s => s.customer === customer).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Site Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    Site
                  </label>
                  <select
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="all">All Sites ({uniqueSites.length})</option>
                    {uniqueSites.sort().map((site) => (
                      <option key={site} value={site}>
                        {site} ({submissions.filter(s => s.site_name === site).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Service Type Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Wrench size={16} className="text-gray-500" />
                    Service Type
                  </label>
                  <select
                    value={serviceTypeFilter}
                    onChange={(e) => setServiceTypeFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  >
                    <option value="all">All Service Types</option>
                    {uniqueServiceTypes.sort().map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date From Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    Date From
                  </label>
                  <input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>

                {/* Date To Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    Date To
                  </label>
                  <input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                  />
                </div>
              </div>

              {/* Filter Summary */}
              {activeFilterCount > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Filter size={16} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Active Filters ({activeFilterCount}):</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {poNumberFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            PO: {poNumberFilter}
                          </span>
                        )}
                        {technicianFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            Tech: {technicianFilter}
                          </span>
                        )}
                        {customerFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            Customer: {customerFilter}
                          </span>
                        )}
                        {siteFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            Site: {siteFilter}
                          </span>
                        )}
                        {serviceTypeFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            Service: {serviceTypeFilter}
                          </span>
                        )}
                        {dateFromFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            From: {dateFromFilter}
                          </span>
                        )}
                        {dateToFilter && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            To: {dateToFilter}
                          </span>
                        )}
                        {statusFilter !== 'all' && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-blue-300 rounded text-xs font-medium text-blue-700">
                            Status: {statusFilter}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Submissions List Container */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-gray-500" />
                <span className="text-base font-semibold text-gray-900">
                  {filteredSubmissions.length} {filteredSubmissions.length === 1 ? 'Submission' : 'Submissions'}
                </span>
                {(searchTerm || statusFilter !== 'all') && (
                  <span className="text-sm text-gray-500">
                    (filtered from {submissions.length} total)
                  </span>
                )}
              </div>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText size={40} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchTerm || statusFilter !== 'all' ? 'No matching submissions found' : 'No submissions yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating your first service submission'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <button
                  onClick={() => navigate('/form/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create First Submission
                </button>
              )}
            </div>
          ) : (
            <>
              {/* --- SUBMISSIONS LIST --- */}
              <div className="divide-y divide-gray-200">
                {filteredSubmissions.map((submission) => {
                  const isExpanded = expandedRows.has(submission.id!);

                  return (
                    <div key={submission.id} className="hover:bg-gray-50 transition-colors">
                      {/* Main Row */}
                      <div className="p-6">
                        <div className="flex items-center justify-between gap-4 flex-wrap lg:flex-nowrap">
                          {/* Left Section: Status Badge */}
                          <div className="flex items-center gap-4 min-w-0 flex-shrink-0">
                            {submission.http_post_sent ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-300 text-green-700 text-xs font-bold rounded-md uppercase tracking-wide">
                                <CheckCircle size={14} />
                                Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-300 text-amber-700 text-xs font-bold rounded-md uppercase tracking-wide">
                                <Clock size={14} />
                                Pending
                              </span>
                            )}
                          </div>

                          {/* Middle Section: Info Grid */}
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 min-w-0">
                            {/* Job Number */}
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1">
                                <FileText size={12} />
                                Job/PO #
                              </div>
                              <div className="font-bold text-gray-900 truncate text-base">{submission.job_po_number}</div>
                            </div>

                            {/* Customer */}
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1">
                                <User size={12} />
                                Customer
                              </div>
                              <div className="font-semibold text-blue-700 truncate text-sm" title={submission.customer || 'Not specified'}>
                                {submission.customer || <span className="text-gray-400 italic">Not specified</span>}
                              </div>
                            </div>

                            {/* Site */}
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1">
                                <MapPin size={12} />
                                Site
                              </div>
                              <div className="font-semibold text-green-700 truncate text-sm" title={submission.site_name || 'Not specified'}>
                                {submission.site_name || <span className="text-gray-400 italic">Not specified</span>}
                              </div>
                            </div>

                            {/* Technician */}
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1">
                                <Wrench size={12} />
                                Technician
                              </div>
                              <div className="font-medium text-gray-800 truncate" title={submission.technician || 'Not specified'}>
                                {submission.technician || <span className="text-gray-400 italic">Not specified</span>}
                              </div>
                            </div>

                            {/* Date */}
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide flex items-center gap-1">
                                <Calendar size={12} />
                                Service Date
                              </div>
                              <div className="font-medium text-gray-800 truncate">{submission.date || <span className="text-gray-400 italic">Not specified</span>}</div>
                            </div>
                          </div>

                          {/* Right Section: Action Buttons */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => toggleRow(submission.id!)}
                              className="p-2 text-gray-600 hover:bg-gray-200 rounded-md transition-colors"
                              title={isExpanded ? 'Collapse details' : 'Expand details'}
                            >
                              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>
                            <button
                              onClick={() => navigate(`/form/${submission.id}/${submission.job_po_number}`)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors font-medium shadow-sm"
                            >
                              <ExternalLink size={16} />
                              <span className="hidden sm:inline">Open</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(submission)}
                              disabled={deleting === submission.id}
                              className="px-4 py-2 bg-red-600 text-white text-sm rounded-md flex items-center gap-2 hover:bg-red-700 disabled:opacity-50 transition-colors font-medium shadow-sm"
                            >
                              <Trash2 size={16} />
                              <span className="hidden sm:inline">{deleting === submission.id ? '...' : 'Delete'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-200 bg-gray-50 p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">

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

        {/* Additional Analytics */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <Package className="text-blue-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">Total Parts Used</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {submissions.reduce((acc, s) => acc + (s.parts_supplies_used?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Parts installed across all jobs</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-100 p-2.5 rounded-lg">
                <Battery className="text-green-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">Battery Tests</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {submissions.reduce((acc, s) => acc + (s.battery_health_readings?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Total battery readings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-lg">
                <Zap className="text-amber-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">Load Bank Tests</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {submissions.filter(s => s.load_bank_entries && s.load_bank_entries.length > 0).length}
            </p>
            <p className="text-sm text-gray-500 mt-2">Forms with load testing</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-slate-100 p-2.5 rounded-lg">
                <Clock className="text-slate-600" size={24} />
              </div>
              <h3 className="font-semibold text-gray-900">Time Entries</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {submissions.reduce((acc, s) => acc + (s.time_on_job?.length || 0), 0)}
            </p>
            <p className="text-sm text-gray-500 mt-2">Total time logs recorded</p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 px-5 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3 border-l-4 animate-slide-in ${
          toast.type === 'success'
            ? 'bg-white text-green-800 border-green-500'
            : 'bg-white text-red-800 border-red-500'
        }`}>
          {toast.type === 'success' ? (
            <CheckCircle size={20} className="flex-shrink-0 text-green-600" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0 text-red-600" />
          )}
          <span className="font-medium text-gray-900">{toast.message}</span>
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
