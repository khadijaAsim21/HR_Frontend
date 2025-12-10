import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, CheckCircle, Clock, Calendar, TrendingUp } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';

const API_URL = 'http://localhost:3000/api/onboarding';

const Onboarding = () => {
  const [processes, setProcesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProcess, setEditingProcess] = useState(null);
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    employee_name: '',
    employee_email: '',
    job_title: '',
    department: '',
    start_date: '',
    assigned_buddy: '',
    assigned_mentor: '',
    notes: '',
    created_by: 'HR Manager'
  });

  const [taskFormData, setTaskFormData] = useState({
    onboarding_id: '',
    task_title: '',
    task_description: '',
    category: 'other',
    assigned_to: '',
    due_date: '',
    priority: 'medium',
    estimated_hours: ''
  });

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800'
  };

  const taskStatusColors = {
    pending: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    overdue: 'bg-red-100 text-red-700'
  };

  // Fetch onboarding processes
  const fetchProcesses = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      
      if (data.success) {
        setProcesses(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch process with tasks
  const viewProcessDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedProcess(data.data);
      }
    } catch (err) {
      setError('Error fetching process details: ' + err.message);
    }
  };

  // Create or update onboarding process
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.employee_name || !formData.employee_email || !formData.start_date) {
      setError('Employee name, email, and start date are required');
      return;
    }

    try {
      const url = editingProcess 
        ? `${API_URL}/${editingProcess.id}`
        : API_URL;
      
      const method = editingProcess ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingProcess ? 'Onboarding updated successfully!' : 'Onboarding created successfully!');
        fetchProcesses();
        resetForm();
      } else {
        setError(data.message || data.errors?.join(', ') || 'Failed to save onboarding');
      }
    } catch (err) {
      setError('Error saving onboarding: ' + err.message);
    }
  };

  // Delete onboarding process
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this onboarding process? This will also delete all associated tasks.')) return;
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Onboarding deleted successfully');
        fetchProcesses();
        if (selectedProcess?.id === id) {
          setSelectedProcess(null);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error deleting onboarding: ' + err.message);
    }
  };

  // Edit onboarding process
  const handleEdit = (process) => {
    setEditingProcess(process);
    setFormData({
      employee_id: process.employee_id || '',
      employee_name: process.employee_name,
      employee_email: process.employee_email,
      job_title: process.job_title || '',
      department: process.department || '',
      start_date: process.start_date,
      assigned_buddy: process.assigned_buddy || '',
      assigned_mentor: process.assigned_mentor || '',
      notes: process.notes || '',
      status: process.status,
      progress_percentage: process.progress_percentage
    });
    setShowForm(true);
  };

  // Update task status
  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        viewProcessDetails(selectedProcess.id);
        fetchProcesses();
      }
    } catch (err) {
      setError('Error updating task: ' + err.message);
    }
  };

  // Add new task
  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskFormData, onboarding_id: selectedProcess.id })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Task added successfully!');
        viewProcessDetails(selectedProcess.id);
        setShowTaskForm(false);
        setTaskFormData({
          task_title: '',
          task_description: '',
          category: 'other',
          assigned_to: '',
          due_date: '',
          priority: 'medium',
          estimated_hours: ''
        });
      }
    } catch (err) {
      setError('Error adding task: ' + err.message);
    }
  };

  // Delete task
  const handleTaskDelete = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    
    try {
      const response = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        viewProcessDetails(selectedProcess.id);
        fetchProcesses();
      }
    } catch (err) {
      setError('Error deleting task: ' + err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_id: '',
      employee_name: '',
      employee_email: '',
      job_title: '',
      department: '',
      start_date: '',
      assigned_buddy: '',
      assigned_mentor: '',
      notes: '',
      created_by: 'HR Manager'
    });
    setEditingProcess(null);
    setShowForm(false);
  };

  useEffect(() => {
    fetchProcesses();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Onboarding</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage new employee onboarding processes and tasks</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus size={20} />
          New Onboarding
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="text-center">
          <Users className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="text-2xl font-bold">{processes.length}</div>
          <div className="text-sm text-gray-600">Total Onboarding</div>
        </Card>
        <Card className="text-center">
          <Clock className="mx-auto text-yellow-600 mb-2" size={32} />
          <div className="text-2xl font-bold">{processes.filter(p => p.status === 'in_progress').length}</div>
          <div className="text-sm text-gray-600">In Progress</div>
        </Card>
        <Card className="text-center">
          <CheckCircle className="mx-auto text-green-600 mb-2" size={32} />
          <div className="text-2xl font-bold">{processes.filter(p => p.status === 'completed').length}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </Card>
        <Card className="text-center">
          <TrendingUp className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="text-2xl font-bold">
            {Math.round(processes.reduce((acc, p) => acc + (p.progress_percentage || 0), 0) / (processes.length || 1))}%
          </div>
          <div className="text-sm text-gray-600">Avg Progress</div>
        </Card>
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingProcess ? 'Edit Onboarding' : 'New Onboarding Process'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Employee Name *</label>
                  <input
                    type="text"
                    value={formData.employee_name}
                    onChange={(e) => setFormData({...formData, employee_name: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.employee_email}
                    onChange={(e) => setFormData({...formData, employee_email: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title</label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
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
                  <label className="block text-sm font-medium mb-1">Assigned Buddy</label>
                  <input
                    type="text"
                    value={formData.assigned_buddy}
                    onChange={(e) => setFormData({...formData, assigned_buddy: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>

              {editingProcess && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" onClick={resetForm} variant="outline">Cancel</Button>
                <Button type="submit">
                  {editingProcess ? 'Update' : 'Create'} Onboarding
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Onboarding Processes List */}
        <div className="col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Onboarding Processes ({processes.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : processes.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No onboarding processes found</p>
            ) : (
              <div className="space-y-3">
                {processes.map(process => (
                  <div
                    key={process.id}
                    className={`border rounded-lg p-4 cursor-pointer transition ${
                      selectedProcess?.id === process.id ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
                    }`}
                    onClick={() => viewProcessDetails(process.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{process.employee_name}</h3>
                        <p className="text-sm text-gray-600">{process.job_title} - {process.department}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[process.status]}`}>
                        {process.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Starts: {new Date(process.start_date).toLocaleDateString()}
                      </span>
                      {process.assigned_buddy && (
                        <span>Buddy: {process.assigned_buddy}</span>
                      )}
                    </div>

                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{process.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${process.progress_percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      <Button
                        onClick={() => handleEdit(process)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit size={14} />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(process.id)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Process Details & Tasks */}
        <div className="col-span-1">
          {selectedProcess ? (
            <Card>
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Tasks</h2>
                <Button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  size="sm"
                  variant="outline"
                >
                  <Plus size={16} />
                </Button>
              </div>

              {showTaskForm && (
                <form onSubmit={handleTaskSubmit} className="mb-4 p-3 bg-gray-50 rounded space-y-2">
                  <input
                    type="text"
                    placeholder="Task title"
                    value={taskFormData.task_title}
                    onChange={(e) => setTaskFormData({...taskFormData, task_title: e.target.value})}
                    className="w-full border rounded px-2 py-1 text-sm"
                    required
                  />
                  <select
                    value={taskFormData.category}
                    onChange={(e) => setTaskFormData({...taskFormData, category: e.target.value})}
                    className="w-full border rounded px-2 py-1 text-sm"
                  >
                    <option value="legal">Legal</option>
                    <option value="it">IT</option>
                    <option value="hr">HR</option>
                    <option value="training">Training</option>
                    <option value="equipment">Equipment</option>
                    <option value="benefits">Benefits</option>
                    <option value="culture">Culture</option>
                    <option value="compliance">Compliance</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="date"
                    value={taskFormData.due_date}
                    onChange={(e) => setTaskFormData({...taskFormData, due_date: e.target.value})}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <Button type="submit" size="sm" className="w-full">Add Task</Button>
                </form>
              )}

              {selectedProcess.tasks && selectedProcess.tasks.length > 0 ? (
                <div className="space-y-2">
                  {selectedProcess.tasks.map(task => (
                    <div key={task.id} className="border rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{task.task_title}</p>
                          <p className="text-xs text-gray-600">{task.category}</p>
                        </div>
                        <button
                          onClick={() => handleTaskDelete(task.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded w-full ${taskStatusColors[task.status]}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                      </select>
                      {task.due_date && (
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8 text-sm">No tasks yet</p>
              )}
            </Card>
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-12">
                Select an onboarding process to view tasks
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
