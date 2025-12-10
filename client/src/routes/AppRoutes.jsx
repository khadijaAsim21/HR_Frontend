import React from 'react';
import { Route, Switch } from 'wouter';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import EmployeeForm from '../pages/EmployeeForm';
import Recruitment from '../pages/Recruitment';
import Onboarding from '../pages/Onboarding';
import Payroll from '../pages/Payroll';
import Attendance from '../pages/Attendance';
import Leaves from '../pages/Leaves';
import Performance from '../pages/Performance';
import Analytics from '../pages/Analytics';
import Settings from '../pages/Settings';

// Recruitment Module Components
import JobPostings from '../pages/Recruitment/JobPostings';
import ApplicantRegistration from '../pages/Recruitment/ApplicantRegistration';
import ApplicantManagement from '../pages/Recruitment/ApplicantManagement';
import InterviewScheduling from '../pages/Recruitment/InterviewScheduling';
import RecruitmentDashboard from '../pages/Recruitment/RecruitmentDashboard';

const AppRoutes = () => {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/employees" component={Employees} />
      <Route path="/employees/new" component={EmployeeForm} />
      
      {/* Recruitment Module Routes - Specific routes must come before generic /recruitment */}
      <Route path="/recruitment/dashboard" component={RecruitmentDashboard} />
      <Route path="/recruitment/jobs" component={JobPostings} />
      <Route path="/recruitment/apply" component={ApplicantRegistration} />
      <Route path="/recruitment/applicants" component={ApplicantManagement} />
      <Route path="/recruitment/interviews" component={InterviewScheduling} />
      <Route path="/recruitment" component={Recruitment} />
      
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/payroll" component={Payroll} />
      <Route path="/attendance" component={Attendance} />
      <Route path="/leaves" component={Leaves} />
      <Route path="/performance" component={Performance} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      {/* 404 Fallback */}
      <Route>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-200">404</h2>
            <p className="text-gray-500">Page not found</p>
          </div>
        </div>
      </Route>
    </Switch>
  );
};

export default AppRoutes;
