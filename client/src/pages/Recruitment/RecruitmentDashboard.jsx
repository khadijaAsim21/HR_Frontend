import { useState, useEffect } from 'react';
import { BarChart3, Users, Briefcase, Calendar, TrendingUp, Download } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';

const API_URL = 'http://localhost:3000/api/recruitment';

const RecruitmentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch dashboard statistics
  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/dashboard`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error fetching dashboard: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Export applicants
  const exportData = (format) => {
    window.open(`${API_URL}/export/applicants?format=${format}`, '_blank');
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statusColors = {
    applied: 'bg-gray-100 text-gray-800',
    shortlisted: 'bg-yellow-100 text-yellow-800',
    interview_scheduled: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    hired: 'bg-green-100 text-green-800'
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <BarChart3 size={32} />
          Recruitment Dashboard
        </h1>
        
        <div className="flex gap-2">
          <Button onClick={() => exportData('json')} variant="outline">
            <Download size={16} className="mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => exportData('csv')} variant="outline">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total_jobs}</p>
            </div>
            <Briefcase size={40} className="text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Open Positions</p>
              <p className="text-3xl font-bold text-green-700">{stats.open_jobs}</p>
            </div>
            <TrendingUp size={40} className="text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Applicants</p>
              <p className="text-3xl font-bold text-purple-700">{stats.total_applicants}</p>
            </div>
            <Users size={40} className="text-purple-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Scheduled Interviews</p>
              <p className="text-3xl font-bold text-orange-700">{stats.upcoming_interviews}</p>
            </div>
            <Calendar size={40} className="text-orange-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Applicants by Status */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Applicants by Status</h2>
        
        {stats.applicants_by_status.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No applicant data available</p>
        ) : (
          <div className="space-y-3">
            {stats.applicants_by_status.map(item => {
              const total = stats.total_applicants || 1; // Avoid division by zero
              const percentage = ((item.count / total) * 100).toFixed(1);
              
              return (
                <div key={item.status}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${statusColors[item.status]}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600">{item.count} applicants</span>
                    </div>
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === 'hired' ? 'bg-green-500' :
                        item.status === 'interview_scheduled' ? 'bg-blue-500' :
                        item.status === 'shortlisted' ? 'bg-yellow-500' :
                        item.status === 'rejected' ? 'bg-red-500' : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Jobs by Department */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Jobs by Department</h2>
          
          {stats.jobs_by_department.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No job data available</p>
          ) : (
            <div className="space-y-3">
              {stats.jobs_by_department.map(dept => (
                <div key={dept.department} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                  <span className="font-medium">{dept.department || 'Not Specified'}</span>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {dept.count} {dept.count === 1 ? 'job' : 'jobs'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Top Hiring Positions</h2>
          
          {!stats.applicants_per_job || stats.applicants_per_job.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No applicant data available</p>
          ) : (
            <div className="space-y-3">
              {stats.applicants_per_job.slice(0, 5).map((job, index) => (
                <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{job.title}</p>
                    <p className="text-xs text-gray-500">{job.department}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {job.applicant_count} applicants
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Pipeline Overview */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recruitment Pipeline by Job</h2>
        
        {!stats.pipeline_by_job || Object.keys(stats.pipeline_by_job).length === 0 ? (
          <p className="text-center text-gray-500 py-8">No pipeline data available</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(stats.pipeline_by_job).map(([jobId, jobData]) => (
              <div key={jobId} className="border rounded p-4">
                <h3 className="font-semibold mb-3">{jobData.job_title}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(jobData.pipeline).map(([status, count]) => (
                    <div key={status} className="text-center">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[status]}`}>
                        {status.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-lg font-bold mt-1">{count}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Job Postings List */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">All Job Postings</h2>
        
        {!stats.applicants_per_job || stats.applicants_per_job.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No job postings found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">Job Title</th>
                  <th className="p-3 text-left text-sm font-semibold">Department</th>
                  <th className="p-3 text-left text-sm font-semibold">Applicants</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.applicants_per_job.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium">{job.title}</td>
                    <td className="p-3 text-sm">{job.department}</td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {job.applicant_count}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Conversion Metrics */}
      {stats.total_applicants > 0 && (
        <Card className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Conversion Metrics</h2>
          
          <div className="grid grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded">
              <p className="text-2xl font-bold text-blue-700">
                {stats.applicants_by_status.find(s => s.status === 'shortlisted')?.count || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Shortlisted</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.applicants_by_status.find(s => s.status === 'shortlisted')?.count || 0) / stats.total_applicants * 100).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded">
              <p className="text-2xl font-bold text-purple-700">
                {stats.applicants_by_status.find(s => s.status === 'interview_scheduled')?.count || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Interviews</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.applicants_by_status.find(s => s.status === 'interview_scheduled')?.count || 0) / stats.total_applicants * 100).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded">
              <p className="text-2xl font-bold text-green-700">
                {stats.applicants_by_status.find(s => s.status === 'hired')?.count || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Hired</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.applicants_by_status.find(s => s.status === 'hired')?.count || 0) / stats.total_applicants * 100).toFixed(1)}% of total
              </p>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded">
              <p className="text-2xl font-bold text-red-700">
                {stats.applicants_by_status.find(s => s.status === 'rejected')?.count || 0}
              </p>
              <p className="text-sm text-gray-600 mt-1">Rejected</p>
              <p className="text-xs text-gray-500 mt-1">
                {((stats.applicants_by_status.find(s => s.status === 'rejected')?.count || 0) / stats.total_applicants * 100).toFixed(1)}% of total
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default RecruitmentDashboard;
