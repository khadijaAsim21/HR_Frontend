import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Clock, Calendar } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const API_URL = 'http://localhost:3000/api/leaves';

const Leaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    leave_type: 'sick_leave',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    reason: '',
    status: 'pending',
    notes: ''
  });

  const [filters, setFilters] = useState({
    employee_id: '',
    status: '',
    leave_type: ''
  });

  const leaveTypes = [
    { value: 'sick_leave', label: 'Sick Leave' },
    { value: 'casual_leave', label: 'Casual Leave' },
    { value: 'annual_leave', label: 'Annual Leave' },
    { value: 'maternity_leave', label: 'Maternity Leave' },
    { value: 'paternity_leave', label: 'Paternity Leave' },
    { value: 'unpaid_leave', label: 'Unpaid Leave' },
    { value: 'emergency_leave', label: 'Emergency Leave' },
    { value: 'study_leave', label: 'Study Leave' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const statusIcons = {
    pending: Clock,
    approved: CheckCircle,
    rejected: XCircle,
    cancelled: XCircle
  };

  // Fetch leave applications
  const fetchLeaves = async () => {
    console.log('🔄 FETCHING LEAVES...');
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.leave_type) queryParams.append('leave_type', filters.leave_type);

      const response = await fetch(`${API_URL}?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Found ${data.data.length} leave applications`);
        setLeaves(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ FETCH ERROR:', err);
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/employees');
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard`);
      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchLeaves();
    fetchEmployees();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [filters]);

  // Calculate total days
  const calculateTotalDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  // Create or update leave
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🚀 SUBMIT STARTED:', editingLeave ? 'UPDATE' : 'CREATE');

    // Validation
    if (!formData.employee_id) {
      setError('Please select an employee');
      setLoading(false);
      return;
    }

    if (!formData.reason || formData.reason.length < 10) {
      setError('Reason must be at least 10 characters long');
      setLoading(false);
      return;
    }

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('End date must be after start date');
      setLoading(false);
      return;
    }

    try {
      const url = editingLeave ? `${API_URL}/${editingLeave.id}` : API_URL;
      const method = editingLeave ? 'PUT' : 'POST';

      const payload = {
        employee_id: parseInt(formData.employee_id),
        leave_type: formData.leave_type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
        status: formData.status,
        notes: formData.notes || null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (data.success) {
        alert(editingLeave ? '✅ Leave updated!' : '✅ Leave application submitted!');
        await fetchLeaves();
        await fetchDashboardStats();
        resetForm();
      } else {
        setError(data.message || data.errors?.join(', ') || 'Failed to save leave');
      }
    } catch (err) {
      setError('Error saving leave: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete leave
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this leave application?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Leave deleted successfully!');
        await fetchLeaves();
        await fetchDashboardStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error deleting leave: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit leave
  const handleEdit = (leave) => {
    setEditingLeave(leave);
    
    setFormData({
      employee_id: leave.employee_id,
      leave_type: leave.leave_type,
      start_date: leave.start_date.split('T')[0],
      end_date: leave.end_date.split('T')[0],
      reason: leave.reason,
      status: leave.status,
      notes: leave.notes || ''
    });
    
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      leave_type: 'sick_leave',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      reason: '',
      status: 'pending',
      notes: ''
    });
    setEditingLeave(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatLeaveType = (type) => {
    return leaveTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-gray-600">Manage employee leave applications</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} className="mr-2" />
          Apply for Leave
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800">
          <h3 className="text-blue-800 dark:text-blue-300 font-semibold">Annual Leaves</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">12 <span className="text-sm font-normal text-gray-500">/ 20 days</span></p>
        </Card>
        <Card className="bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-800">
          <h3 className="text-purple-800 dark:text-purple-300 font-semibold">Sick Leaves</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">3 <span className="text-sm font-normal text-gray-500">/ 10 days</span></p>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800">
          <h3 className="text-orange-800 dark:text-orange-300 font-semibold">Pending Requests</h3>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-2">4</p>
        </Card>
      </div>


      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-4 gap-4">
          <Card className="text-center">
            <Calendar className="mx-auto text-blue-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.total_applications || 0}</div>
            <div className="text-sm text-gray-600">Total Applications</div>
          </Card>
          <Card className="text-center">
            <Clock className="mx-auto text-yellow-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.pending_count || 0}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </Card>
          <Card className="text-center">
            <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.approved_count || 0}</div>
            <div className="text-sm text-gray-600">Approved</div>
          </Card>
          <Card className="text-center">
            <XCircle className="mx-auto text-red-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.rejected_count || 0}</div>
            <div className="text-sm text-gray-600">Rejected</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <select
              value={filters.employee_id}
              onChange={(e) => setFilters({...filters, employee_id: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Leave Type</label>
            <select
              value={filters.leave_type}
              onChange={(e) => setFilters({...filters, leave_type: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Types</option>
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingLeave ? 'Edit Leave Application' : 'Apply for Leave'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee *</label>
                  <select
                    value={formData.employee_id}
                    onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Leave Type *</label>
                  <select
                    value={formData.leave_type}
                    onChange={(e) => setFormData({...formData, leave_type: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    {leaveTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">End Date *</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              {formData.start_date && formData.end_date && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Total Days:</strong> {calculateTotalDays(formData.start_date, formData.end_date)} days
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Reason * (minimum 10 characters)</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                  placeholder="Please provide a detailed reason for your leave..."
                  required
                  minLength="10"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.reason.length}/10 characters minimum
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Additional Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="2"
                  placeholder="Any additional information (optional)"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" onClick={resetForm} variant="outline" disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? '⏳ Saving...' : (editingLeave ? '✏️ Update' : '✅ Submit')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Leave Applications List */}
      <Card>
        <h3 className="font-semibold mb-4">Leave Applications ({leaves.length})</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading leave applications...</p>
          </div>
        ) : leaves.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-400" />
            <p>No leave applications found</p>
            <p className="text-sm">Apply for leave to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.map((leave) => {
                  const StatusIcon = statusIcons[leave.status] || Clock;
                  return (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{leave.employee_name}</div>
                        <div className="text-sm text-gray-500">{leave.employee_position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatLeaveType(leave.leave_type)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div>{formatDate(leave.start_date)}</div>
                        <div className="text-gray-500">to {formatDate(leave.end_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                        {leave.total_days} days
                      </td>
                      <td className="px-6 py-4 text-sm max-w-xs truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[leave.status]}`}>
                          <StatusIcon size={14} className="mr-1" />
                          {leave.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(leave)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(leave.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Leaves;
