import { useState, useEffect } from 'react';
import { Users, TrendingUp, Filter, Download, Edit, Trash2 } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';

const API_URL = 'http://localhost:3000/api/recruitment';

const ApplicantManagement = () => {
  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingApplicant, setEditingApplicant] = useState(null);
  
  const [filters, setFilters] = useState({
    job_id: '',
    status: '',
    start_date: '',
    end_date: ''
  });
  
  const [editFormData, setEditFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    job_id: '',
    status: 'applied',
    current_company: '',
    years_of_experience: '',
    expected_salary: '',
    notice_period: '',
    resume_url: '',
    linkedin_url: '',
    portfolio_url: '',
    cover_letter: ''
  });

  const statusColors = {
    applied: 'bg-gray-100 text-gray-800',
    shortlisted: 'bg-yellow-100 text-yellow-800',
    interview_scheduled: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-green-100 text-green-800'
  };

  // Fetch applicants
  const fetchApplicants = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`${API_URL}/applicants?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setApplicants(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error fetching applicants: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch jobs for filter dropdown
  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      const data = await response.json();
      if (data.success) setJobs(data.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  // Get applicant details
  const viewApplicantDetails = async (id) => {
    try {
      const response = await fetch(`${API_URL}/applicants/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedApplicant(data.data);
      }
    } catch (err) {
      setError('Error fetching applicant details: ' + err.message);
    }
  };

  // Update applicant status
  const updateStatus = async (applicantId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/applicants/${applicantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`Status updated to ${newStatus}`);
        
        // Check for notification
        if (data.notification) {
          console.log('Notification event:', data.notification);
          // Here you can trigger email/SMS notification
        }
        
        fetchApplicants();
        if (selectedApplicant?.id === applicantId) {
          viewApplicantDetails(applicantId);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error updating status: ' + err.message);
    }
  };

  // Move to next pipeline stage
  const moveToNextStage = async (applicantId) => {
    try {
      const response = await fetch(`${API_URL}/pipeline/${applicantId}/next`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(data.message);
        fetchApplicants();
        if (selectedApplicant?.id === applicantId) {
          viewApplicantDetails(applicantId);
        }
      } else {
        alert(data.message);
      }
    } catch (err) {
      setError('Error moving to next stage: ' + err.message);
    }
  };

  // Add note to applicant
  const addNote = async (applicantId) => {
    const note = prompt('Enter note:');
    if (!note) return;
    
    try {
      const response = await fetch(`${API_URL}/applicants/${applicantId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, created_by: 'HR Manager' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Note added successfully');
        viewApplicantDetails(applicantId);
      }
    } catch (err) {
      setError('Error adding note: ' + err.message);
    }
  };

  // Export applicants
  const exportApplicants = (format = 'json') => {
    const params = new URLSearchParams(filters);
    params.append('format', format);
    window.open(`${API_URL}/export/applicants?${params}`, '_blank');
  };
  
  // Open Edit Modal
  const handleEditApplicant = (applicant) => {
    setEditingApplicant(applicant);
    setEditFormData({
      first_name: applicant.first_name,
      last_name: applicant.last_name,
      email: applicant.email,
      phone: applicant.phone || '',
      job_id: applicant.job_id.toString(),
      status: applicant.status,
      current_company: applicant.current_company || '',
      years_of_experience: applicant.years_of_experience || '',
      expected_salary: applicant.expected_salary || '',
      notice_period: applicant.notice_period || '',
      resume_url: applicant.resume_url || '',
      linkedin_url: applicant.linkedin_url || '',
      portfolio_url: applicant.portfolio_url || '',
      cover_letter: applicant.cover_letter || ''
    });
    setShowEditModal(true);
  };
  
  // Submit Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!editFormData.first_name || !editFormData.last_name || !editFormData.email) {
      setError('First name, last name, and email are required');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/applicants/${editingApplicant.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editFormData,
          job_id: parseInt(editFormData.job_id),
          years_of_experience: editFormData.years_of_experience ? parseFloat(editFormData.years_of_experience) : null
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Applicant updated successfully!');
        setShowEditModal(false);
        setEditingApplicant(null);
        fetchApplicants();
        
        // Refresh details if this applicant is selected
        if (selectedApplicant?.id === editingApplicant.id) {
          viewApplicantDetails(editingApplicant.id);
        }
      } else {
        setError(data.message || 'Failed to update applicant');
      }
    } catch (err) {
      setError('Error updating applicant: ' + err.message);
    }
  };
  
  // Delete Applicant
  const handleDeleteApplicant = async (applicantId, applicantName) => {
    if (!confirm(`Are you sure you want to delete the application from ${applicantName}? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/applicants/${applicantId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Applicant deleted successfully');
        
        // Clear selected applicant if it was deleted
        if (selectedApplicant?.id === applicantId) {
          setSelectedApplicant(null);
        }
        
        fetchApplicants();
      } else {
        setError(data.message || 'Failed to delete applicant');
      }
    } catch (err) {
      setError('Error deleting applicant: ' + err.message);
    }
  };
  
  // Close Edit Modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingApplicant(null);
  };

  useEffect(() => {
    fetchApplicants();
    fetchJobs();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users size={32} />
          Applicant Management
        </h1>
        
        <div className="flex gap-2">
          <Button onClick={() => exportApplicants('json')} variant="outline">
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportApplicants('csv')} variant="outline">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          <select
            value={filters.job_id}
            onChange={(e) => setFilters({...filters, job_id: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Jobs</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All Statuses</option>
            <option value="applied">Applied</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
          
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({...filters, start_date: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
            placeholder="Start Date"
          />
          
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({...filters, end_date: e.target.value})}
            className="border border-gray-300 rounded px-3 py-2"
            placeholder="End Date"
          />
        </div>
        
        <Button onClick={fetchApplicants} className="mt-4">
          Apply Filters
        </Button>
      </Card>

      {/* Applicants Table */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              Applicants ({applicants.length})
            </h2>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : applicants.length === 0 ? (
              <p className="text-center text-gray-500 py-12">No applicants found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-left text-sm font-semibold">Name</th>
                      <th className="p-3 text-left text-sm font-semibold">Job</th>
                      <th className="p-3 text-left text-sm font-semibold">Status</th>
                      <th className="p-3 text-left text-sm font-semibold">Applied</th>
                      <th className="p-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {applicants.map(applicant => (
                      <tr 
                        key={applicant.id}
                        className={`hover:bg-gray-50 cursor-pointer ${
                          selectedApplicant?.id === applicant.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => viewApplicantDetails(applicant.id)}
                      >
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{applicant.first_name} {applicant.last_name}</p>
                            <p className="text-sm text-gray-600">{applicant.email}</p>
                          </div>
                        </td>
                        <td className="p-3 text-sm">{applicant.job_title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[applicant.status]}`}>
                            {applicant.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          {new Date(applicant.applied_date).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => handleEditApplicant(applicant)}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition"
                              title="Edit Applicant"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteApplicant(applicant.id, `${applicant.first_name} ${applicant.last_name}`)}
                              className="px-2 py-1 text-xs bg-red-100 text-red-700 hover:bg-red-200 rounded transition"
                              title="Delete Applicant"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Applicant Details Panel */}
        <div className="col-span-1">
          {selectedApplicant ? (
            <Card>
              <h2 className="text-xl font-semibold mb-4">Applicant Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedApplicant.first_name} {selectedApplicant.last_name}
                  </h3>
                  <p className="text-sm text-gray-600">{selectedApplicant.email}</p>
                  {selectedApplicant.phone && (
                    <p className="text-sm text-gray-600">{selectedApplicant.phone}</p>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-1">Applied For:</p>
                  <p className="text-sm">{selectedApplicant.job_title}</p>
                  <p className="text-xs text-gray-500">{selectedApplicant.department}</p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-1">Status:</p>
                  <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColors[selectedApplicant.status]}`}>
                    {selectedApplicant.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                {selectedApplicant.current_company && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-1">Current Company:</p>
                    <p className="text-sm">{selectedApplicant.current_company}</p>
                  </div>
                )}
                
                {selectedApplicant.years_of_experience && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-1">Experience:</p>
                    <p className="text-sm">{selectedApplicant.years_of_experience} years</p>
                  </div>
                )}
                
                {selectedApplicant.expected_salary && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-1">Expected Salary:</p>
                    <p className="text-sm">{selectedApplicant.expected_salary}</p>
                  </div>
                )}
                
                {selectedApplicant.resume_url && (
                  <div className="border-t pt-4">
                    <a
                      href={selectedApplicant.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      View Resume →
                    </a>
                  </div>
                )}
                
                {selectedApplicant.linkedin_url && (
                  <div>
                    <a
                      href={selectedApplicant.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      LinkedIn Profile →
                    </a>
                  </div>
                )}
                
                {selectedApplicant.cover_letter && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Cover Letter:</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {selectedApplicant.cover_letter}
                    </p>
                  </div>
                )}
                
                {/* Notes */}
                {selectedApplicant.notes && selectedApplicant.notes.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Notes:</p>
                    <div className="space-y-2">
                      {selectedApplicant.notes.map(note => (
                        <div key={note.id} className="bg-yellow-50 p-2 rounded text-sm">
                          <p className="text-gray-700">{note.note}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            By {note.created_by} • {new Date(note.created_at).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="border-t pt-4 space-y-2">
                  <Button
                    onClick={() => moveToNextStage(selectedApplicant.id)}
                    className="w-full"
                  >
                    <TrendingUp size={16} className="mr-2" />
                    Move to Next Stage
                  </Button>
                  
                  <Button
                    onClick={() => addNote(selectedApplicant.id)}
                    variant="outline"
                    className="w-full"
                  >
                    Add Note
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <p className="text-center text-gray-500 py-12">
                Select an applicant to view details
              </p>
            </Card>
          )}
        </div>
      </div>
      
      {/* Edit Applicant Modal */}
      {showEditModal && editingApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Edit Applicant</h2>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Personal Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">First Name *</label>
                    <input
                      type="text"
                      value={editFormData.first_name}
                      onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={editFormData.last_name}
                      onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>
              </div>
              
              {/* Job & Status */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Job & Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Job *</label>
                    <select
                      value={editFormData.job_id}
                      onChange={(e) => setEditFormData({...editFormData, job_id: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    >
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      <option value="applied">Applied</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="interview_scheduled">Interview Scheduled</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* Professional Information */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Professional Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Company</label>
                    <input
                      type="text"
                      value={editFormData.current_company}
                      onChange={(e) => setEditFormData({...editFormData, current_company: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Years of Experience</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={editFormData.years_of_experience}
                      onChange={(e) => setEditFormData({...editFormData, years_of_experience: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expected Salary</label>
                    <input
                      type="text"
                      value={editFormData.expected_salary}
                      onChange={(e) => setEditFormData({...editFormData, expected_salary: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="e.g., $80,000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Notice Period</label>
                    <input
                      type="text"
                      value={editFormData.notice_period}
                      onChange={(e) => setEditFormData({...editFormData, notice_period: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="e.g., 2 weeks"
                    />
                  </div>
                </div>
              </div>
              
              {/* Links */}
              <div>
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">Links</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Resume URL</label>
                    <input
                      type="url"
                      value={editFormData.resume_url}
                      onChange={(e) => setEditFormData({...editFormData, resume_url: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
                    <input
                      type="url"
                      value={editFormData.linkedin_url}
                      onChange={(e) => setEditFormData({...editFormData, linkedin_url: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Portfolio URL</label>
                    <input
                      type="url"
                      value={editFormData.portfolio_url}
                      onChange={(e) => setEditFormData({...editFormData, portfolio_url: e.target.value})}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium mb-1">Cover Letter</label>
                <textarea
                  value={editFormData.cover_letter}
                  onChange={(e) => setEditFormData({...editFormData, cover_letter: e.target.value})}
                  rows={5}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Update Applicant</Button>
                <Button type="button" onClick={closeEditModal} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ApplicantManagement;
