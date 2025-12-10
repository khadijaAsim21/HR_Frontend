import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Briefcase, MapPin, DollarSign, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';

const API_URL = 'http://localhost:3000/api/recruitment';

const JobPostings = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    job_type: 'full-time',
    description: '',
    requirements: '',
    responsibilities: '',
    salary_range: '',
    status: 'open',
    posted_by: 'HR Manager',
    closing_date: ''
  });

  const [filters, setFilters] = useState({
    department: '',
    status: '',
    job_type: '',
    keyword: ''
  });

  // Fetch jobs with filters
  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/jobs?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data);
      } else {
        setError(data.message || 'Failed to fetch jobs');
      }
    } catch (err) {
      setError('Error connecting to server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Create or update job
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title || !formData.department || !formData.description) {
      setError('Title, department, and description are required');
      return;
    }

    try {
      const url = editingJob 
        ? `${API_URL}/jobs/${editingJob.id}`
        : `${API_URL}/jobs`;
      
      const method = editingJob ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingJob ? 'Job updated successfully!' : 'Job created successfully!');
        fetchJobs();
        resetForm();
      } else {
        setError(data.message || data.errors?.join(', ') || 'Failed to save job');
      }
    } catch (err) {
      setError('Error saving job: ' + err.message);
    }
  };

  // Update job status
  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Job status updated to ${newStatus}`);
        fetchJobs();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error updating status: ' + err.message);
    }
  };

  // Delete job
  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Job deleted successfully');
        fetchJobs();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error deleting job: ' + err.message);
    }
  };

  // Edit job
  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData({
      title: job.title,
      department: job.department,
      location: job.location || '',
      job_type: job.job_type,
      description: job.description,
      requirements: job.requirements || '',
      responsibilities: job.responsibilities || '',
      salary_range: job.salary_range || '',
      status: job.status,
      posted_by: job.posted_by || 'HR Manager',
      closing_date: job.closing_date ? job.closing_date.split('T')[0] : ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      job_type: 'full-time',
      description: '',
      requirements: '',
      responsibilities: '',
      salary_range: '',
      status: 'open',
      posted_by: 'HR Manager',
      closing_date: ''
    });
    setEditingJob(null);
    setShowForm(false);
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Job Postings</h1>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus size={20} />
          Post New Job
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search by keyword..."
            value={filters.keyword}
            onChange={(e) => setFilters({...filters, keyword: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Department"
            value={filters.department}
            onChange={(e) => setFilters({...filters, department: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={filters.job_type}
            onChange={(e) => setFilters({...filters, job_type: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Types</option>
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        <Button onClick={fetchJobs} className="mt-4">Apply Filters</Button>
      </Card>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingJob ? 'Edit Job Posting' : 'Create New Job Posting'}
              </h2>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Department *</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., Remote, New York, NY"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Job Type</label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData({...formData, job_type: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={formData.salary_range}
                    onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    placeholder="e.g., $80,000 - $120,000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="open">Open</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Closing Date</label>
                  <input
                    type="date"
                    value={formData.closing_date}
                    onChange={(e) => setFormData({...formData, closing_date: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Posted By</label>
                  <input
                    type="text"
                    value={formData.posted_by}
                    onChange={(e) => setFormData({...formData, posted_by: e.target.value})}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Job Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="4"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Requirements</label>
                <textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                  placeholder="List job requirements..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Responsibilities</label>
                <textarea
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({...formData, responsibilities: e.target.value})}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  rows="3"
                  placeholder="List job responsibilities..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingJob ? 'Update Job' : 'Create Job'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Jobs List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <Card className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No jobs found. Create your first job posting!</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{job.title}</h3>
                      <p className="text-gray-600">{job.department}</p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'open' ? 'bg-green-100 text-green-800' :
                        job.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.status.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {job.job_type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                    {job.location && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        {job.location}
                      </div>
                    )}
                    {job.salary_range && (
                      <div className="flex items-center gap-1">
                        <DollarSign size={16} />
                        {job.salary_range}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Posted: {new Date(job.posted_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{job.description}</p>
                  
                  {job.requirements && (
                    <div className="mb-3">
                      <p className="font-semibold text-sm text-gray-700">Requirements:</p>
                      <p className="text-sm text-gray-600">{job.requirements}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2 pt-4 border-t mt-4">
                <select
                  value={job.status}
                  onChange={(e) => handleStatusChange(job.id, e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="open">Open</option>
                  <option value="paused">Paused</option>
                  <option value="closed">Closed</option>
                </select>
                
                <Button
                  onClick={() => handleEdit(job)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </Button>
                
                <Button
                  onClick={() => handleDelete(job.id)}
                  variant="outline"
                  className="flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobPostings;
