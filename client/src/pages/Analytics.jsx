import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Card from '../components/Card';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [recruitmentData, setRecruitmentData] = useState([]);
  const [payrollData, setPayrollData] = useState([]);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all analytics data in parallel
      const [dashboardRes, deptRes, salaryRes, attendanceRes, recruitmentRes, payrollRes, performanceRes] = await Promise.all([
        fetch('http://localhost:3000/api/analytics/dashboard'),
        fetch('http://localhost:3000/api/analytics/departments'),
        fetch('http://localhost:3000/api/analytics/salary'),
        fetch('http://localhost:3000/api/analytics/attendance?months=6'),
        fetch('http://localhost:3000/api/analytics/recruitment?months=6'),
        fetch('http://localhost:3000/api/analytics/payroll?months=6'),
        fetch('http://localhost:3000/api/analytics/performance?months=6')
      ]);

      const dashboardData = await dashboardRes.json();
      const deptData = await deptRes.json();
      const salaryDataRes = await salaryRes.json();
      const attendanceDataRes = await attendanceRes.json();
      const recruitmentDataRes = await recruitmentRes.json();
      const payrollDataRes = await payrollRes.json();
      const performanceDataRes = await performanceRes.json();

      if (dashboardData.success) setDashboard(dashboardData.data);
      if (deptData.success) setDepartments(deptData.data);
      if (salaryDataRes.success) setSalaryData(salaryDataRes.data);
      if (attendanceDataRes.success) setAttendanceData(attendanceDataRes.data);
      if (recruitmentDataRes.success) setRecruitmentData(recruitmentDataRes.data);
      if (payrollDataRes.success) setPayrollData(payrollDataRes.data);
      if (performanceDataRes.success) setPerformanceData(performanceDataRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">HR Analytics Dashboard</h1>

      {/* Dashboard Overview Cards */}
      {dashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Employees</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{dashboard.total_employees || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500 dark:text-gray-400">Active Applications</div>
            <div className="text-3xl font-bold text-blue-600 mt-2">{dashboard.active_applications || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500 dark:text-gray-400">Pending Leaves</div>
            <div className="text-3xl font-bold text-yellow-600 mt-2">{dashboard.pending_leaves || 0}</div>
          </Card>
          <Card>
            <div className="text-sm text-gray-500 dark:text-gray-400">Attendance Rate</div>
            <div className="text-3xl font-bold text-green-600 mt-2">{dashboard.attendance_rate || 0}%</div>
          </Card>
        </div>
      )}

      {/* Department Salary Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Salary Distribution by Department">
          <div className="h-80 w-full">
            {departments.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departments} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="department" type="category" stroke="#9CA3AF" width={120} />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="average_salary" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </Card>

        {/* Attendance Trends */}
        <Card title="Attendance Rate (Last 6 Months)">
          <div className="h-80 w-full">
            {attendanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis domain={[0, 100]} stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="attendance_rate" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Recruitment & Payroll */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recruitment Metrics (Last 6 Months)">
          <div className="h-80 w-full">
            {recruitmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={recruitmentData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="total_applications" fill="#3B82F6" name="Applications" />
                  <Bar dataKey="hired_count" fill="#10B981" name="Hired" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </Card>

        <Card title="Payroll Trends (Last 6 Months)">
          <div className="h-80 w-full">
            {payrollData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="total_net" stroke="#8B5CF6" strokeWidth={3} name="Net Salary" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No data available</div>
            )}
          </div>
        </Card>
      </div>

      {/* Department Statistics Table */}
      <Card title="Department Overview">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Employees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Avg Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Max Salary</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Min Salary</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {departments.map((dept, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{dept.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{dept.employee_count}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${dept.average_salary?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${dept.max_salary?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">${dept.min_salary?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Performance Analytics */}
      {performanceData.length > 0 && (
        <Card title="Performance Review Trends">
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="avg_score" stroke="#EC4899" strokeWidth={3} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
