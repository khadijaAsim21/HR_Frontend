// Example Router Configuration for Recruitment Module
// Add this to your main routing file (App.jsx or routes/index.jsx)

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

// Import Recruitment Components
import JobPostings from './pages/Recruitment/JobPostings';
import ApplicantRegistration from './pages/Recruitment/ApplicantRegistration';
import ApplicantManagement from './pages/Recruitment/ApplicantManagement';
import InterviewScheduling from './pages/Recruitment/InterviewScheduling';
import RecruitmentDashboard from './pages/Recruitment/RecruitmentDashboard';

// Import Existing Components (example)
import Employees from './pages/Employees';
// ... other imports

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-blue-600">HR System</h1>
          </div>
          
          <nav className="mt-6">
            {/* Employee Management Section */}
            <div className="px-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Employee Management
              </h3>
              <Link
                to="/employees"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
              >
                👥 Employees
              </Link>
            </div>

            {/* Recruitment Module Section */}
            <div className="px-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Recruitment
              </h3>
              
              <Link
                to="/recruitment/dashboard"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
              >
                📊 Dashboard
              </Link>
              
              <Link
                to="/recruitment/jobs"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
              >
                💼 Job Postings
              </Link>
              
              <Link
                to="/recruitment/applicants"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
              >
                👤 Applicants
              </Link>
              
              <Link
                to="/recruitment/interviews"
                className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded transition"
              >
                📅 Interviews
              </Link>
            </div>

            {/* Public Section */}
            <div className="px-4 mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Public
              </h3>
              
              <Link
                to="/recruitment/apply"
                className="flex items-center gap-3 px-3 py-2 text-green-700 hover:bg-green-50 hover:text-green-600 rounded transition"
              >
                ✍️ Apply for Job
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Existing Routes */}
            <Route path="/employees" element={<Employees />} />
            
            {/* Recruitment Module Routes */}
            <Route path="/recruitment/dashboard" element={<RecruitmentDashboard />} />
            <Route path="/recruitment/jobs" element={<JobPostings />} />
            <Route path="/recruitment/applicants" element={<ApplicantManagement />} />
            <Route path="/recruitment/interviews" element={<InterviewScheduling />} />
            <Route path="/recruitment/apply" element={<ApplicantRegistration />} />
            
            {/* Default Route */}
            <Route path="/" element={<RecruitmentDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
