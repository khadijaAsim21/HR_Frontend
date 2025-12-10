import React, { useState, useEffect } from 'react';

const Performance = () => {
  const [activeTab, setActiveTab] = useState('reviews');
  const [reviews, setReviews] = useState([]);
  const [goals, setGoals] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});

  const [reviewFormData, setReviewFormData] = useState({
    employee_id: '', reviewer_id: '', review_period: 'quarterly',
    review_date: new Date().toISOString().split('T')[0],
    start_date: '', end_date: '',
    quality_of_work: 5, productivity: 5, communication: 5,
    teamwork: 5, initiative: 5, attendance: 5,
    strengths: '', areas_for_improvement: '', achievements: '', comments: '', status: 'draft'
  });

  const [goalFormData, setGoalFormData] = useState({
    employee_id: '', title: '', description: '', target_date: '',
    status: 'not_started', progress: 0, notes: ''
  });

  const [reviewFilters, setReviewFilters] = useState({
    employee_id: '', status: '', review_period: ''
  });

  const [goalFilters, setGoalFilters] = useState({
    employee_id: '', status: ''
  });

  useEffect(() => {
    fetchEmployees();
    fetchReviews();
    fetchGoals();
    fetchDashboardStats();
  }, []);

  useEffect(() => { fetchReviews(); }, [reviewFilters]);
  useEffect(() => { fetchGoals(); }, [goalFilters]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/employees');
      const data = await response.json();
      if (data.success) setEmployees(data.data);
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (reviewFilters.employee_id) queryParams.append('employee_id', reviewFilters.employee_id);
      if (reviewFilters.status) queryParams.append('status', reviewFilters.status);
      if (reviewFilters.review_period) queryParams.append('review_period', reviewFilters.review_period);

      const response = await fetch(`http://localhost:3000/api/performance/reviews?${queryParams}`);
      const data = await response.json();
      if (data.success) setReviews(data.data);
    } catch (err) {
      setError('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      if (goalFilters.employee_id) queryParams.append('employee_id', goalFilters.employee_id);
      if (goalFilters.status) queryParams.append('status', goalFilters.status);

      const response = await fetch(`http://localhost:3000/api/performance/goals?${queryParams}`);
      const data = await response.json();
      if (data.success) setGoals(data.data);
    } catch (err) {
      setError('Failed to fetch goals');
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/performance/dashboard');
      const data = await response.json();
      if (data.success) setDashboardStats(data.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    
    console.log('=== REVIEW SUBMIT STARTED ===');
    console.log('Editing Review:', editingReview);
    console.log('Form Data:', reviewFormData);

    try {
      const url = editingReview
        ? `http://localhost:3000/api/performance/reviews/${editingReview.id}`
        : 'http://localhost:3000/api/performance/reviews';
      const method = editingReview ? 'PUT' : 'POST';

      // Convert all values to proper types
      const submitData = {
        employee_id: parseInt(reviewFormData.employee_id) || null,
        reviewer_id: parseInt(reviewFormData.reviewer_id) || null,
        review_period: reviewFormData.review_period,
        review_date: reviewFormData.review_date,
        start_date: reviewFormData.start_date,
        end_date: reviewFormData.end_date,
        quality_of_work: parseInt(reviewFormData.quality_of_work) || 5,
        productivity: parseInt(reviewFormData.productivity) || 5,
        communication: parseInt(reviewFormData.communication) || 5,
        teamwork: parseInt(reviewFormData.teamwork) || 5,
        initiative: parseInt(reviewFormData.initiative) || 5,
        attendance: parseInt(reviewFormData.attendance) || 5,
        strengths: reviewFormData.strengths || null,
        areas_for_improvement: reviewFormData.areas_for_improvement || null,
        achievements: reviewFormData.achievements || null,
        comments: reviewFormData.comments || null,
        status: reviewFormData.status
      };

      console.log('Submitting to:', method, url);
      console.log('Submit Data:', submitData);

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        console.log('Success! Refreshing data...');
        await fetchReviews();
        await fetchDashboardStats();
        setShowReviewForm(false);
        resetReviewForm();
        console.log('=== REVIEW SUBMIT COMPLETED ===');
      } else {
        console.error('Server returned error:', data.message);
        setError(data.message || 'Unknown error occurred');
      }
    } catch (err) {
      console.error('Review submission error:', err);
      setError('Failed to save review: ' + err.message);
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const url = editingGoal
        ? `http://localhost:3000/api/performance/goals/${editingGoal.id}`
        : 'http://localhost:3000/api/performance/goals';
      const method = editingGoal ? 'PUT' : 'POST';

      // Convert all values to proper types
      const submitData = {
        employee_id: parseInt(goalFormData.employee_id) || null,
        title: goalFormData.title,
        description: goalFormData.description,
        target_date: goalFormData.target_date,
        status: goalFormData.status,
        progress: parseInt(goalFormData.progress) || 0,
        notes: goalFormData.notes || null
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();
      if (data.success) {
        fetchGoals();
        fetchDashboardStats();
        setShowGoalForm(false);
        resetGoalForm();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to save goal: ' + err.message);
      console.error('Goal submission error:', err);
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/performance/reviews/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
        fetchDashboardStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete review');
    }
  };

  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      const response = await fetch(`http://localhost:3000/api/performance/goals/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        fetchGoals();
        fetchDashboardStats();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to delete goal');
    }
  };

  const handleEditReview = (review) => {
    console.log('=== EDIT REVIEW CLICKED ===');
    console.log('Review to edit:', review);
    setError('');
    setEditingReview(review);
    
    // Format dates to YYYY-MM-DD for date inputs
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0];
    };
    
    setReviewFormData({
      employee_id: review.employee_id,
      reviewer_id: review.reviewer_id,
      review_period: review.review_period,
      review_date: formatDate(review.review_date),
      start_date: formatDate(review.start_date),
      end_date: formatDate(review.end_date),
      quality_of_work: review.quality_of_work || 5,
      productivity: review.productivity || 5,
      communication: review.communication || 5,
      teamwork: review.teamwork || 5,
      initiative: review.initiative || 5,
      attendance: review.attendance || 5,
      strengths: review.strengths || '',
      areas_for_improvement: review.areas_for_improvement || '',
      achievements: review.achievements || '',
      comments: review.comments || '',
      status: review.status
    });
    console.log('Form data set, opening form...');
    setShowReviewForm(true);
    console.log('showReviewForm set to true');
  };

  const handleEditGoal = (goal) => {
    setError('');
    setEditingGoal(goal);
    setGoalFormData({
      employee_id: goal.employee_id,
      title: goal.title,
      description: goal.description,
      target_date: goal.target_date,
      status: goal.status,
      progress: goal.progress,
      notes: goal.notes || ''
    });
    setShowGoalForm(true);
  };

  const resetReviewForm = () => {
    setError('');
    setEditingReview(null);
    setReviewFormData({
      employee_id: '', reviewer_id: '', review_period: 'quarterly',
      review_date: new Date().toISOString().split('T')[0],
      start_date: '', end_date: '',
      quality_of_work: 5, productivity: 5, communication: 5,
      teamwork: 5, initiative: 5, attendance: 5,
      strengths: '', areas_for_improvement: '', achievements: '', comments: '', status: 'draft'
    });
  };

  const resetGoalForm = () => {
    setError('');
    setEditingGoal(null);
    setGoalFormData({
      employee_id: '', title: '', description: '', target_date: '',
      status: 'not_started', progress: 0, notes: ''
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800', submitted: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800', completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800', not_started: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'text-green-600 font-bold';
    if (grade === 'B') return 'text-blue-600 font-bold';
    if (grade === 'C') return 'text-yellow-600 font-bold';
    return 'text-red-600 font-bold';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Performance Management</h1>
        <p className="text-gray-600">Track employee performance reviews and goals</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Reviews</h3>
          <p className="text-3xl font-bold text-gray-900">{dashboardStats.total_reviews || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-3xl font-bold text-green-600">{dashboardStats.completed_reviews || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Avg Score</h3>
          <p className="text-3xl font-bold text-blue-600">
            {dashboardStats.avg_overall_score ? parseFloat(dashboardStats.avg_overall_score).toFixed(1) : '0.0'}/10
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Goals</h3>
          <p className="text-3xl font-bold text-purple-600">{dashboardStats.total_goals || 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${ activeTab === 'reviews' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Performance Reviews
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'goals' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Goals & Objectives
          </button>
        </nav>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Performance Reviews</h2>
              <button onClick={() => { resetReviewForm(); setShowReviewForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Create Review</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <select value={reviewFilters.employee_id} onChange={(e) => setReviewFilters({ ...reviewFilters, employee_id: e.target.value })} className="border rounded px-3 py-2">
                <option value="">All Employees</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>)}
              </select>
              <select value={reviewFilters.status} onChange={(e) => setReviewFilters({ ...reviewFilters, status: e.target.value })} className="border rounded px-3 py-2">
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="in_review">In Review</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <select value={reviewFilters.review_period} onChange={(e) => setReviewFilters({ ...reviewFilters, review_period: e.target.value })} className="border rounded px-3 py-2">
                <option value="">All Periods</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="half_yearly">Half Yearly</option>
                <option value="annual">Annual</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No reviews found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reviews.map((review) => (
                      <tr key={review.id}>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{review.employee_name}</div>
                          <div className="text-sm text-gray-500">{review.employee_position}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{review.review_period.replace('_', ' ')}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{new Date(review.review_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{review.overall_score ? parseFloat(review.overall_score).toFixed(2) : 'N/A'}/10</td>
                        <td className="px-6 py-4"><span className={`text-lg ${getGradeColor(review.performance_grade)}`}>{review.performance_grade || 'N/A'}</span></td>
                        <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(review.status)}`}>{review.status}</span></td>
                        <td className="px-6 py-4 text-sm space-x-2">
                          <button 
                            onClick={() => {
                              console.log('Edit button clicked for review:', review.id);
                              handleEditReview(review);
                            }} 
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Edit
                          </button>
                          <button onClick={() => handleDeleteReview(review.id)} className="text-red-600 hover:text-red-800">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Goals Tab - Following in next message due to size */}
      {activeTab === 'goals' && (
        <>
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Performance Goals</h2>
              <button onClick={() => { resetGoalForm(); setShowGoalForm(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">+ Create Goal</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <select value={goalFilters.employee_id} onChange={(e) => setGoalFilters({ ...goalFilters, employee_id: e.target.value })} className="border rounded px-3 py-2">
                <option value="">All Employees</option>
                {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>)}
              </select>
              <select value={goalFilters.status} onChange={(e) => setGoalFilters({ ...goalFilters, status: e.target.value })} className="border rounded px-3 py-2">
                <option value="">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-8"><div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
            ) : goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No goals found</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map((goal) => (
                  <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{goal.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>{goal.status.replace('_', ' ')}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                    <div className="text-sm text-gray-500 mb-2"><strong>{goal.employee_name}</strong> - {goal.employee_position}</div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1"><span>Progress</span><span className="font-semibold">{goal.progress}%</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${goal.progress}%` }}></div></div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">Target: {new Date(goal.target_date).toLocaleDateString()}</div>
                    <div className="flex space-x-2">
                      <button onClick={() => handleEditGoal(goal)} className="flex-1 bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm">Edit</button>
                      <button onClick={() => handleDeleteGoal(goal.id)} className="flex-1 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {/* Forms will be in app.jsx continuation */}

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center overflow-y-auto p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingReview ? 'Edit Review' : 'Create Review'}</h2>
              <form onSubmit={handleReviewSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-sm font-medium mb-1">Employee *</label><select value={reviewFormData.employee_id} onChange={(e) => setReviewFormData({ ...reviewFormData, employee_id: e.target.value })} className="w-full border rounded px-3 py-2" required><option value="">Select Employee</option>{employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>)}</select></div>
                  <div><label className="block text-sm font-medium mb-1">Reviewer *</label><select value={reviewFormData.reviewer_id} onChange={(e) => setReviewFormData({ ...reviewFormData, reviewer_id: e.target.value })} className="w-full border rounded px-3 py-2" required><option value="">Select Reviewer</option>{employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name}</option>)}</select></div>
                  <div><label className="block text-sm font-medium mb-1">Review Period *</label><select value={reviewFormData.review_period} onChange={(e) => setReviewFormData({ ...reviewFormData, review_period: e.target.value })} className="w-full border rounded px-3 py-2" required><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="half_yearly">Half Yearly</option><option value="annual">Annual</option></select></div>
                  <div><label className="block text-sm font-medium mb-1">Review Date *</label><input type="date" value={reviewFormData.review_date} onChange={(e) => setReviewFormData({ ...reviewFormData, review_date: e.target.value })} className="w-full border rounded px-3 py-2" required /></div>
                  <div><label className="block text-sm font-medium mb-1">Start Date *</label><input type="date" value={reviewFormData.start_date} onChange={(e) => setReviewFormData({ ...reviewFormData, start_date: e.target.value })} className="w-full border rounded px-3 py-2" required /></div>
                  <div><label className="block text-sm font-medium mb-1">End Date *</label><input type="date" value={reviewFormData.end_date} onChange={(e) => setReviewFormData({ ...reviewFormData, end_date: e.target.value })} className="w-full border rounded px-3 py-2" required /></div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold mb-3">Rating Scores (1-10)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['quality_of_work', 'productivity', 'communication', 'teamwork', 'initiative', 'attendance'].map((field) => (
                      <div key={field}><label className="block text-sm font-medium mb-1">{field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</label><input type="number" min="1" max="10" value={reviewFormData[field]} onChange={(e) => setReviewFormData({ ...reviewFormData, [field]: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
                    ))}
                  </div>
                </div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Strengths</label><textarea value={reviewFormData.strengths} onChange={(e) => setReviewFormData({ ...reviewFormData, strengths: e.target.value })} className="w-full border rounded px-3 py-2" rows="3"></textarea></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Areas for Improvement</label><textarea value={reviewFormData.areas_for_improvement} onChange={(e) => setReviewFormData({ ...reviewFormData, areas_for_improvement: e.target.value })} className="w-full border rounded px-3 py-2" rows="3"></textarea></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Achievements</label><textarea value={reviewFormData.achievements} onChange={(e) => setReviewFormData({ ...reviewFormData, achievements: e.target.value })} className="w-full border rounded px-3 py-2" rows="3"></textarea></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Comments</label><textarea value={reviewFormData.comments} onChange={(e) => setReviewFormData({ ...reviewFormData, comments: e.target.value })} className="w-full border rounded px-3 py-2" rows="3"></textarea></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Status</label><select value={reviewFormData.status} onChange={(e) => setReviewFormData({ ...reviewFormData, status: e.target.value })} className="w-full border rounded px-3 py-2"><option value="draft">Draft</option><option value="submitted">Submitted</option><option value="in_review">In Review</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => { setShowReviewForm(false); resetReviewForm(); }} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                  <button 
                    type="button"
                    onClick={(e) => {
                      console.log('=== UPDATE BUTTON CLICKED ===');
                      handleReviewSubmit(e);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    {editingReview ? 'Update Review' : 'Create Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">{editingGoal ? 'Edit Goal' : 'Create Goal'}</h2>
              <form onSubmit={handleGoalSubmit}>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Employee *</label><select value={goalFormData.employee_id} onChange={(e) => setGoalFormData({ ...goalFormData, employee_id: e.target.value })} className="w-full border rounded px-3 py-2" required><option value="">Select Employee</option>{employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.name} - {emp.position}</option>)}</select></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Title * (min 5 characters)</label><input type="text" value={goalFormData.title} onChange={(e) => setGoalFormData({ ...goalFormData, title: e.target.value })} className="w-full border rounded px-3 py-2" required minLength="5" /></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Description * (min 10 characters)</label><textarea value={goalFormData.description} onChange={(e) => setGoalFormData({ ...goalFormData, description: e.target.value })} className="w-full border rounded px-3 py-2" rows="4" required minLength="10"></textarea></div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div><label className="block text-sm font-medium mb-1">Target Date *</label><input type="date" value={goalFormData.target_date} onChange={(e) => setGoalFormData({ ...goalFormData, target_date: e.target.value })} className="w-full border rounded px-3 py-2" required /></div>
                  <div><label className="block text-sm font-medium mb-1">Status</label><select value={goalFormData.status} onChange={(e) => setGoalFormData({ ...goalFormData, status: e.target.value })} className="w-full border rounded px-3 py-2"><option value="not_started">Not Started</option><option value="in_progress">In Progress</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
                </div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Progress: {goalFormData.progress}%</label><input type="range" min="0" max="100" value={goalFormData.progress} onChange={(e) => setGoalFormData({ ...goalFormData, progress: parseInt(e.target.value) })} className="w-full" /></div>
                <div className="mb-4"><label className="block text-sm font-medium mb-1">Notes</label><textarea value={goalFormData.notes} onChange={(e) => setGoalFormData({ ...goalFormData, notes: e.target.value })} className="w-full border rounded px-3 py-2" rows="3"></textarea></div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => { setShowGoalForm(false); resetGoalForm(); }} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">{editingGoal ? 'Update Goal' : 'Create Goal'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;
