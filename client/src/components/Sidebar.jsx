import React from 'react';
import { Link, useRoute } from 'wouter';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  UserPlus, 
  DollarSign, 
  CalendarCheck, 
  CalendarOff, 
  TrendingUp, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { motion } from 'framer-motion';

const SidebarItem = ({ item, t, onClose }) => {
  const [isActive] = useRoute(item.path);

  return (
    <Link href={item.path}>
      <a
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer
          ${isActive 
            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' 
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }
        `}
        onClick={() => window.innerWidth < 1024 && onClose()}
      >
        <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
        <span>{t(item.label) || item.label}</span>
        {isActive && (
          <motion.div 
            layoutId="active-pill"
            className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"
          />
        )}
      </a>
    </Link>
  );
};

const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const handleLogout = () => {
    // Clear any stored user data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      onClose();
    }
    // Show confirmation
    alert('Logged out successfully!');
    // Redirect to home page
    window.location.href = '/';
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'dashboard' },
    { path: '/employees', icon: Users, label: 'employees' },
    { path: '/recruitment', icon: Briefcase, label: 'recruitment' },
    { path: '/onboarding', icon: UserPlus, label: 'Onboarding' },
    { path: '/payroll', icon: DollarSign, label: 'payroll' },
    { path: '/attendance', icon: CalendarCheck, label: 'attendance' },
    { path: '/leaves', icon: CalendarOff, label: 'Leaves' },
    { path: '/performance', icon: TrendingUp, label: 'performance' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/settings', icon: Settings, label: 'settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center gap-3 px-6 h-16 border-b border-gray-200 dark:border-gray-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            H
          </div>
          <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">HR.ai</span>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
          {menuItems.map((item) => (
            <SidebarItem key={item.path} item={item} t={t} onClose={onClose} />
          ))}

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
            <button 
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/10 transition-colors"
            >
              <LogOut size={20} />
              <span>{t('logout')}</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
