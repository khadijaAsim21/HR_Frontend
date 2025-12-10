import React from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Briefcase, Users, Calendar, BarChart3, FileText } from 'lucide-react';
import Card from '../components/Card';

const Recruitment = () => {
  const { t } = useTranslation();

  const modules = [
    {
      title: 'Recruitment Dashboard',
      description: 'View analytics, statistics, and insights about your recruitment process',
      icon: BarChart3,
      path: '/recruitment/dashboard',
      color: 'bg-blue-500'
    },
    {
      title: 'Job Postings',
      description: 'Create, manage, and publish job openings',
      icon: Briefcase,
      path: '/recruitment/jobs',
      color: 'bg-green-500'
    },
    {
      title: 'Apply for Jobs',
      description: 'Submit your application for available positions',
      icon: FileText,
      path: '/recruitment/apply',
      color: 'bg-purple-500'
    },
    {
      title: 'Applicant Management',
      description: 'Review and manage job applications',
      icon: Users,
      path: '/recruitment/applicants',
      color: 'bg-orange-500'
    },
    {
      title: 'Interview Scheduling',
      description: 'Schedule and manage candidate interviews',
      icon: Calendar,
      path: '/recruitment/interviews',
      color: 'bg-pink-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('recruitment')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Complete recruitment management system connected to PostgreSQL</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Link key={module.path} href={module.path}>
            <a className="block group">
              <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-blue-500">
                <div className="flex items-start space-x-4">
                  <div className={`${module.color} p-3 rounded-lg text-white`}>
                    <module.icon size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {module.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>
              </Card>
            </a>
          </Link>
        ))}
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          <Briefcase className="text-blue-600 dark:text-blue-400 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Fully Integrated Recruitment System</h3>
            <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
              All recruitment features are connected to your PostgreSQL database with full CRUD operations. 
              Create jobs, manage applicants, schedule interviews, and track your entire hiring pipeline.
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>✅ Real-time data sync with PostgreSQL</li>
              <li>✅ Complete applicant tracking system</li>
              <li>✅ Interview scheduling and management</li>
              <li>✅ Analytics and reporting dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Recruitment;
