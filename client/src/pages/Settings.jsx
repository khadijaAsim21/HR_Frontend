import React, { useState, useEffect } from 'react';
import { Bell, Lock, Globe, User, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useTheme } from '../utils/themeContext';

const Settings = () => {
  const employeeId = 4; // Replace with actual logged-in user ID
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const { theme, toggleTheme } = useTheme();
  
  // State for all settings
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', phone: '', bio: '' });
  const [notifications, setNotifications] = useState({});
  const [security, setSecurity] = useState({});
  const [preferences, setPreferences] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/settings/all/${employeeId}`);
      const data = await response.json();
      
      setProfile(data.profile || {});
      setNotifications(data.notifications || {});
      setSecurity(data.security || {});
      setPreferences(data.preferences || {});
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setSaving(true);
      const response = await fetch(`http://localhost:3000/api/settings/profile/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await response.json();
      setProfile(data);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationUpdate = async (field, value) => {
    try {
      const response = await fetch(`http://localhost:3000/api/settings/notifications/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  };

  const handlePreferenceUpdate = async (field, value) => {
    try {
      // Update theme in UI immediately
      if (field === 'theme') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(value);
        localStorage.setItem('theme', value);
      }
      
      const response = await fetch(`http://localhost:3000/api/settings/preferences/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      const data = await response.json();
      setPreferences(data);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const handleSecurityUpdate = async (field, value) => {
    try {
      const response = await fetch(`http://localhost:3000/api/settings/security/${employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      const data = await response.json();
      setSecurity(data);
    } catch (error) {
      console.error('Error updating security:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <Button variant="ghost" className={`w-full justify-start ${activeTab === 'profile' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}`} icon={User} onClick={() => setActiveTab('profile')}>Profile</Button>
          <Button variant="ghost" className={`w-full justify-start ${activeTab === 'notifications' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}`} icon={Bell} onClick={() => setActiveTab('notifications')}>Notifications</Button>
          <Button variant="ghost" className={`w-full justify-start ${activeTab === 'security' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}`} icon={Lock} onClick={() => setActiveTab('security')}>Security</Button>
          <Button variant="ghost" className={`w-full justify-start ${activeTab === 'preferences' ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : ''}`} icon={Globe} onClick={() => setActiveTab('preferences')}>Preferences</Button>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <Card title="Profile Information" subtitle="Update your personal details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                    <input type="text" value={profile.first_name || ''} onChange={(e) => setProfile({...profile, first_name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                    <input type="text" value={profile.last_name || ''} onChange={(e) => setProfile({...profile, last_name: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                    <input type="email" value={profile.email || ''} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                    <input type="tel" value={profile.phone || ''} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
                  <textarea value={profile.bio || ''} onChange={(e) => setProfile({...profile, bio: e.target.value})} rows={3} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card title="Notifications" subtitle="Manage your email preferences">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Alerts</h4>
                    <p className="text-xs text-gray-500">Receive emails about new applicants</p>
                  </div>
                  <input type="checkbox" checked={notifications.email_alerts || false} onChange={(e) => handleNotificationUpdate('email_alerts', e.target.checked)} className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Performance Reviews</h4>
                    <p className="text-xs text-gray-500">Reminders for upcoming reviews</p>
                  </div>
                  <input type="checkbox" checked={notifications.performance_reviews || false} onChange={(e) => handleNotificationUpdate('performance_reviews', e.target.checked)} className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">System Updates</h4>
                    <p className="text-xs text-gray-500">Get notified about new features</p>
                  </div>
                  <input type="checkbox" checked={notifications.system_updates || false} onChange={(e) => handleNotificationUpdate('system_updates', e.target.checked)} className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Leave Requests</h4>
                    <p className="text-xs text-gray-500">Notifications for leave applications</p>
                  </div>
                  <input type="checkbox" checked={notifications.leave_requests || false} onChange={(e) => handleNotificationUpdate('leave_requests', e.target.checked)} className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Attendance Alerts</h4>
                    <p className="text-xs text-gray-500">Get attendance notifications</p>
                  </div>
                  <input type="checkbox" checked={notifications.attendance_alerts || false} onChange={(e) => handleNotificationUpdate('attendance_alerts', e.target.checked)} className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Payroll Notifications</h4>
                    <p className="text-xs text-gray-500">Updates about payroll processing</p>
                  </div>
                  <input type="checkbox" checked={notifications.payroll_notifications || false} onChange={(e) => handleNotificationUpdate('payroll_notifications', e.target.checked)} className="toggle" />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card title="Security Settings" subtitle="Manage your account security">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                    <p className="text-xs text-gray-500">Add an extra layer of security</p>
                  </div>
                  <input type="checkbox" checked={security.two_factor_enabled || false} onChange={(e) => handleSecurityUpdate('two_factor_enabled', e.target.checked)} className="toggle" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Login Alerts</h4>
                    <p className="text-xs text-gray-500">Get notified of new login attempts</p>
                  </div>
                  <input type="checkbox" checked={security.login_alerts || false} onChange={(e) => handleSecurityUpdate('login_alerts', e.target.checked)} className="toggle" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Timeout (minutes)</label>
                  <input type="number" value={security.session_timeout || 30} onChange={(e) => handleSecurityUpdate('session_timeout', parseInt(e.target.value))} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" />
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'preferences' && (
            <Card title="Preferences" subtitle="Customize your experience">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
                  <select value={preferences.theme || 'light'} onChange={(e) => handlePreferenceUpdate('theme', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
                    <select value={preferences.language || 'en'} onChange={(e) => handlePreferenceUpdate('language', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timezone</label>
                    <select value={preferences.timezone || 'UTC'} onChange={(e) => handlePreferenceUpdate('timezone', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">Eastern Time</option>
                      <option value="America/Los_Angeles">Pacific Time</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Format</label>
                    <select value={preferences.date_format || 'MM/DD/YYYY'} onChange={(e) => handlePreferenceUpdate('date_format', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time Format</label>
                    <select value={preferences.time_format || '12h'} onChange={(e) => handlePreferenceUpdate('time_format', e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900">
                      <option value="12h">12 Hour</option>
                      <option value="24h">24 Hour</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
