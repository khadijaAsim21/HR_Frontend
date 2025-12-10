import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Clock, Calendar, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const API_URL = 'http://localhost:3000/api/attendance';

const Attendance = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [formData, setFormData] = useState({
    employee_id: '',
    attendance_date: new Date().toISOString().split('T')[0],
    check_in_time: '',
    check_out_time: '',
    status: 'present',
    notes: ''
  });

  const [filters, setFilters] = useState({
    employee_id: '',
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    status: ''
  });

  const statusColors = {
    present: 'bg-green-100 text-green-800',
    absent: 'bg-red-100 text-red-800',
    late: 'bg-yellow-100 text-yellow-800',
    half_day: 'bg-blue-100 text-blue-800',
    on_leave: 'bg-purple-100 text-purple-800'
  };

  const statusIcons = {
    present: CheckCircle,
    absent: XCircle,
    late: AlertCircle,
    half_day: Clock,
    on_leave: Calendar
  };

  // Fetch attendance records
  const fetchAttendances = async () => {
    console.log('🔄 FETCHING ATTENDANCES...');
    setLoading(true);
    setError('');
    
    try {
      const queryParams = new URLSearchParams();
      if (filters.employee_id) queryParams.append('employee_id', filters.employee_id);
      if (filters.start_date) queryParams.append('start_date', filters.start_date);
      if (filters.end_date) queryParams.append('end_date', filters.end_date);
      if (filters.status) queryParams.append('status', filters.status);

      const response = await fetch(`${API_URL}?${queryParams}`);
      console.log('📡 Fetch response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Fetched data:', data);
      
      if (data.success) {
        console.log(`✅ Found ${data.data.length} attendance records`);
        setAttendances(data.data);
      } else {
        console.error('❌ Fetch failed:', data.message);
        setError(data.message);
      }
    } catch (err) {
      console.error('❌ FETCH ERROR:', err);
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees for dropdown
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
      const queryParams = new URLSearchParams();
      queryParams.append('start_date', filters.start_date);
      queryParams.append('end_date', filters.end_date);

      const response = await fetch(`${API_URL}/dashboard?${queryParams}`);
      const data = await response.json();
      if (data.success) {
        setDashboardStats(data.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  useEffect(() => {
    fetchAttendances();
    fetchEmployees();
    fetchDashboardStats();
  }, []);

  useEffect(() => {
    fetchAttendances();
    fetchDashboardStats();
  }, [filters]);

  // Calculate total hours for display
  const calculateDisplayHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '0.00';
    
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    
    const totalMinutes = (outHour * 60 + outMin) - (inHour * 60 + inMin);
    const hours = totalMinutes / 60;
    
    return hours.toFixed(2);
  };

  // Create or update attendance
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('🚀 SUBMIT STARTED:', editingAttendance ? 'UPDATE' : 'CREATE');
    console.log('📋 Form Data:', formData);

    // Validation
    if (!formData.employee_id) {
      setError('Please select an employee');
      setLoading(false);
      return;
    }

    if (!formData.attendance_date) {
      setError('Please select a date');
      setLoading(false);
      return;
    }

    // Validate times if both provided
    if (formData.check_in_time && formData.check_out_time) {
      if (formData.check_out_time <= formData.check_in_time) {
        setError('Check-out time must be after check-in time');
        setLoading(false);
        return;
      }
    }

    try {
      const url = editingAttendance ? `${API_URL}/${editingAttendance.id}` : API_URL;
      const method = editingAttendance ? 'PUT' : 'POST';

      const payload = {
        employee_id: parseInt(formData.employee_id),
        attendance_date: formData.attendance_date,
        check_in_time: formData.check_in_time || null,
        check_out_time: formData.check_out_time || null,
        status: formData.status || 'present',
        notes: formData.notes || ''
      };

      console.log('📤 REQUEST:', method, url);
      console.log('📦 PAYLOAD:', payload);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📡 RESPONSE STATUS:', response.status, response.statusText);

      const data = await response.json();
      console.log('📥 RESPONSE DATA:', data);

      if (data.success) {
        alert(editingAttendance ? '✅ Attendance updated!' : '✅ Attendance created!');
        console.log('✅ SUCCESS - Refreshing list...');
        await fetchAttendances();
        await fetchDashboardStats();
        resetForm();
      } else {
        console.error('❌ FAILED:', data.message || data.errors);
        setError(data.message || data.errors?.join(', ') || 'Failed to save attendance');
      }
    } catch (err) {
      setError('Error saving attendance: ' + err.message);
      console.error('Attendance save error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete attendance
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Attendance deleted successfully!');
        await fetchAttendances();
        await fetchDashboardStats();
      } else {
        setError(data.message || 'Failed to delete attendance');
      }
    } catch (err) {
      setError('Error deleting attendance: ' + err.message);
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Edit attendance
  const handleEdit = (attendance) => {
    setEditingAttendance(attendance);
    
    setFormData({
      employee_id: attendance.employee_id,
      attendance_date: attendance.attendance_date.split('T')[0],
      check_in_time: attendance.check_in_time || '',
      check_out_time: attendance.check_out_time || '',
      status: attendance.status,
      notes: attendance.notes || ''
    });
    
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      attendance_date: new Date().toISOString().split('T')[0],
      check_in_time: '',
      check_out_time: '',
      status: 'present',
      notes: ''
    });
    setEditingAttendance(null);
    setShowForm(false);
  };

  const formatTime = (time) => {
    if (!time) return '-';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-gray-600">Track employee attendance and working hours</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={20} className="mr-2" />
          Mark Attendance
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Dashboard Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-5 gap-4">
          <Card className="text-center">
            <Users className="mx-auto text-blue-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.total_records || 0}</div>
            <div className="text-sm text-gray-600">Total Records</div>
          </Card>
          <Card className="text-center">
            <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.present_count || 0}</div>
            <div className="text-sm text-gray-600">Present</div>
          </Card>
          <Card className="text-center">
            <XCircle className="mx-auto text-red-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.absent_count || 0}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </Card>
          <Card className="text-center">
            <AlertCircle className="mx-auto text-yellow-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.late_count || 0}</div>
            <div className="text-sm text-gray-600">Late</div>
          </Card>
          <Card className="text-center">
            <Clock className="mx-auto text-purple-600 mb-2" size={32} />
            <div className="text-2xl font-bold">{dashboardStats.avg_hours_worked || 0}h</div>
            <div className="text-sm text-gray-600">Avg Hours</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <h3 className="font-semibold mb-3">Filters</h3>
        <div className="grid grid-cols-4 gap-4">
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
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({...filters, start_date: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({...filters, end_date: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half_day">Half Day</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingAttendance ? 'Edit Attendance' : 'Mark Attendance'}
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
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.attendance_date}
                    onChange={(e) => setFormData({...formData, attendance_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Check-In Time</label>
                  <input
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({...formData, check_in_time: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Check-Out Time</label>
                  <input
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({...formData, check_out_time: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              {formData.check_in_time && formData.check_out_time && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Total Hours:</strong> {calculateDisplayHours(formData.check_in_time, formData.check_out_time)} hours
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half_day">Half Day</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="2"
                  placeholder="Additional notes (optional)"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" onClick={resetForm} variant="outline" disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? '⏳ Saving...' : (editingAttendance ? '✏️ Update' : '✅ Save')}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Attendance List */}
      <Card>
        <h3 className="font-semibold mb-4">Attendance Records ({attendances.length})</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attendance records...</p>
          </div>
        ) : attendances.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Calendar size={48} className="mx-auto mb-3 text-gray-400" />
            <p>No attendance records found</p>
            <p className="text-sm">Mark attendance to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-In</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-Out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Hours</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendances.map((attendance) => {
                  const StatusIcon = statusIcons[attendance.status] || Clock;
                  return (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatDate(attendance.attendance_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{attendance.employee_name}</div>
                        <div className="text-sm text-gray-500">{attendance.employee_position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatTime(attendance.check_in_time)}
                        {attendance.is_late && <span className="ml-2 text-yellow-600">⚠️</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {formatTime(attendance.check_out_time)}
                        {attendance.is_early_leave && <span className="ml-2 text-orange-600">🏃</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {parseFloat(attendance.total_hours || 0).toFixed(2)}h
                        {attendance.overtime_hours > 0 && (
                          <span className="ml-2 text-green-600 text-xs">+{parseFloat(attendance.overtime_hours).toFixed(1)}h OT</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[attendance.status]}`}>
                          <StatusIcon size={14} className="mr-1" />
                          {attendance.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(attendance)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(attendance.id)}
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

export default Attendance;
