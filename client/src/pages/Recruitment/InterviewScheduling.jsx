import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MapPin, CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';

const API_URL = 'http://localhost:3000/api/recruitment';

const InterviewScheduling = () => {
  const [interviews, setInterviews] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  
  const [formData, setFormData] = useState({
    applicant_id: '',
    interview_type: 'phone',
    interview_mode: 'online',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    interviewer_name: '',
    interviewer_email: '',
    location: '',
    meeting_link: '',
    notes: ''
  });

  const interviewTypeColors = {
    phone: 'bg-blue-100 text-blue-800',
    technical: 'bg-purple-100 text-purple-800',
    behavioral: 'bg-green-100 text-green-800',
    final: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    scheduled: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    no_show: 'bg-gray-100 text-gray-800'
  };

  // Fetch interviews
  const fetchInterviews = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/interviews`);
      const data = await response.json();
      
      if (data.success) {
        setInterviews(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error fetching interviews: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applicants for dropdown
  const fetchApplicants = async () => {
    try {
      const response = await fetch(`${API_URL}/applicants`);
      const data = await response.json();
      
      if (data.success) {
        // Filter applicants with status that can be interviewed
        const eligibleApplicants = data.data.filter(a => 
          ['applied', 'shortlisted', 'interview_scheduled'].includes(a.status)
        );
        setApplicants(eligibleApplicants);
      }
    } catch (err) {
      console.error('Error fetching applicants:', err);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Schedule/Update interview
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Combine date and time for scheduled_at
    const scheduled_at = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
    
    const payload = {
      applicant_id: parseInt(formData.applicant_id),
      interview_type: formData.interview_type,
      interview_mode: formData.interview_mode,
      scheduled_at,
      duration_minutes: parseInt(formData.duration_minutes),
      interviewer_name: formData.interviewer_name,
      interviewer_email: formData.interviewer_email,
      location: formData.location || null,
      meeting_link: formData.meeting_link || null,
      notes: formData.notes || null
    };
    
    try {
      const url = editingInterview
        ? `${API_URL}/interviews/${editingInterview.id}`
        : `${API_URL}/interviews`;
      
      const response = await fetch(url, {
        method: editingInterview ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(editingInterview ? 'Interview updated!' : 'Interview scheduled!');
        
        // Check for notification event
        if (data.notification) {
          console.log('Notification event:', data.notification);
          // Trigger email/calendar notification here
        }
        
        setShowModal(false);
        resetForm();
        fetchInterviews();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error saving interview: ' + err.message);
    }
  };

  // Add feedback to interview
  const handleAddFeedback = async (interviewId) => {
    const feedback = prompt('Enter interview feedback:');
    const rating = prompt('Enter rating (1-5):');
    
    if (!feedback || !rating) return;
    
    try {
      const response = await fetch(`${API_URL}/interviews/${interviewId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback,
          rating: parseInt(rating),
          status: 'completed'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Feedback submitted!');
        fetchInterviews();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error adding feedback: ' + err.message);
    }
  };

  // Cancel interview
  const handleCancel = async (interviewId) => {
    if (!confirm('Are you sure you want to cancel this interview?')) return;
    
    try {
      const response = await fetch(`${API_URL}/interviews/${interviewId}/feedback`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Interview cancelled');
        fetchInterviews();
      }
    } catch (err) {
      setError('Error cancelling interview: ' + err.message);
    }
  };

  // Open edit modal
  const openEditModal = (interview) => {
    const datetime = new Date(interview.scheduled_at);
    const date = datetime.toISOString().split('T')[0];
    const time = datetime.toTimeString().slice(0, 5);
    
    setFormData({
      applicant_id: interview.applicant_id.toString(),
      interview_type: interview.interview_type,
      interview_mode: interview.interview_mode,
      scheduled_date: date,
      scheduled_time: time,
      duration_minutes: interview.duration_minutes,
      interviewer_name: interview.interviewer_name,
      interviewer_email: interview.interviewer_email,
      location: interview.location || '',
      meeting_link: interview.meeting_link || '',
      notes: interview.notes || ''
    });
    
    setEditingInterview(interview);
    setShowModal(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      applicant_id: '',
      interview_type: 'phone',
      interview_mode: 'online',
      scheduled_date: '',
      scheduled_time: '',
      duration_minutes: 60,
      interviewer_name: '',
      interviewer_email: '',
      location: '',
      meeting_link: '',
      notes: ''
    });
    setEditingInterview(null);
  };

  useEffect(() => {
    fetchInterviews();
    fetchApplicants();
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar size={32} />
          Interview Scheduling
        </h1>
        
        <Button onClick={() => { setShowModal(true); resetForm(); }}>
          Schedule Interview
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Interviews List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : interviews.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-12">No interviews scheduled</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map(interview => (
            <Card key={interview.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {interview.applicant_name}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${interviewTypeColors[interview.interview_type]}`}>
                      {interview.interview_type.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[interview.status]}`}>
                      {interview.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    {interview.job_title} • {interview.department}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-500" />
                      {new Date(interview.scheduled_at).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-gray-500" />
                      {new Date(interview.scheduled_at).toLocaleTimeString()} ({interview.duration_minutes} min)
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      {interview.interview_mode === 'online' ? (
                        <Video size={16} className="text-gray-500" />
                      ) : (
                        <MapPin size={16} className="text-gray-500" />
                      )}
                      {interview.interview_mode === 'online' ? 'Online' : 'In-person'}
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-semibold">Interviewer:</span> {interview.interviewer_name}
                    </div>
                  </div>
                  
                  {interview.meeting_link && (
                    <div className="mt-3">
                      <a
                        href={interview.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                      >
                        <Video size={14} />
                        Join Meeting →
                      </a>
                    </div>
                  )}
                  
                  {interview.location && (
                    <div className="mt-2 text-sm text-gray-600">
                      <MapPin size={14} className="inline mr-1" />
                      {interview.location}
                    </div>
                  )}
                  
                  {interview.notes && (
                    <div className="mt-3 bg-yellow-50 p-2 rounded text-sm">
                      <p className="font-semibold mb-1">Notes:</p>
                      <p className="text-gray-700">{interview.notes}</p>
                    </div>
                  )}
                  
                  {interview.feedback && (
                    <div className="mt-3 bg-green-50 p-3 rounded">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="font-semibold text-sm">Feedback</span>
                        <span className="text-xs text-gray-600">
                          Rating: {interview.rating}/5
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{interview.feedback}</p>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  {interview.status === 'scheduled' && (
                    <>
                      <Button
                        onClick={() => openEditModal(interview)}
                        variant="outline"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleAddFeedback(interview.id)}
                        size="sm"
                      >
                        Complete
                      </Button>
                      <Button
                        onClick={() => handleCancel(interview.id)}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  
                  {interview.status === 'completed' && !interview.feedback && (
                    <Button
                      onClick={() => handleAddFeedback(interview.id)}
                      size="sm"
                    >
                      Add Feedback
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule/Edit Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingInterview ? 'Edit Interview' : 'Schedule Interview'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Applicant *</label>
                <select
                  name="applicant_id"
                  value={formData.applicant_id}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  disabled={editingInterview}
                >
                  <option value="">Select Applicant</option>
                  {applicants.map(applicant => (
                    <option key={applicant.id} value={applicant.id}>
                      {applicant.first_name} {applicant.last_name} - {applicant.job_title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Interview Type *</label>
                  <select
                    name="interview_type"
                    value={formData.interview_type}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="phone">Phone Screen</option>
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="final">Final Round</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Interview Mode *</label>
                  <select
                    name="interview_mode"
                    value={formData.interview_mode}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  >
                    <option value="online">Online</option>
                    <option value="in_person">In-person</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Time *</label>
                  <input
                    type="time"
                    name="scheduled_time"
                    value={formData.scheduled_time}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Duration (min) *</label>
                  <input
                    type="number"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    required
                    min="15"
                    max="240"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Interviewer Name *</label>
                  <input
                    type="text"
                    name="interviewer_name"
                    value={formData.interviewer_name}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Interviewer Email *</label>
                  <input
                    type="email"
                    name="interviewer_email"
                    value={formData.interviewer_email}
                    onChange={handleInputChange}
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
              
              {formData.interview_mode === 'online' ? (
                <div>
                  <label className="block text-sm font-medium mb-1">Meeting Link</label>
                  <input
                    type="url"
                    name="meeting_link"
                    value={formData.meeting_link}
                    onChange={handleInputChange}
                    placeholder="https://zoom.us/..."
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="Office address or room number"
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Interview preparation notes or special instructions..."
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingInterview ? 'Update Interview' : 'Schedule Interview'}
                </Button>
                <Button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduling;
