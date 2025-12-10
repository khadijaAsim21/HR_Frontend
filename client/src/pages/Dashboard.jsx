import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Users, Briefcase, DollarSign, TrendingUp, AlertTriangle, Sparkles, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Card from '../components/Card';

const Dashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [quickStats, setQuickStats] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summary, trends, stats, aiInsights] = await Promise.all([
        fetch('http://localhost:3000/api/dashboard/summary').then(r => r.json()),
        fetch('http://localhost:3000/api/dashboard/trends/monthly').then(r => r.json()),
        fetch('http://localhost:3000/api/dashboard/quick-stats').then(r => r.json()),
        fetch('http://localhost:3000/api/dashboard/insights').then(r => r.json())
      ]);
      
      setDashboardData(summary);
      setMonthlyTrends(trends);
      setQuickStats(stats);
      setInsights(aiInsights);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const stats = quickStats.slice(0, 4).map((stat, index) => {
    const icons = [Users, Briefcase, DollarSign, TrendingUp];
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500'];
    return {
      label: stat.stat_name,
      value: stat.stat_value,
      change: stat.change_percentage ? `${stat.change_percentage > 0 ? '+' : ''}${stat.change_percentage}%` : '0%',
      icon: icons[index] || Users,
      color: colors[index] || 'bg-gray-500',
      trend: stat.trend
    };
  });

  const chartData = monthlyTrends.map(trend => ({
    name: trend.month_name,
    employees: parseInt(trend.employees) || 0,
    revenue: Math.round(parseFloat(trend.revenue) / 1000) || 0 // Convert to thousands
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('dashboard')}</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">{new Date().toLocaleDateString()}</span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${stat.color} text-white`}>
                <stat.icon size={24} />
              </div>
            </div>
            <span className={`text-xs font-medium mt-4 block ${stat.change.startsWith('+') ? 'text-green-500' : stat.change.startsWith('-') ? 'text-red-500' : 'text-gray-500'}`}>
              {stat.change} from last month
            </span>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card title="Growth Analytics" subtitle="Employee count vs Revenue">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="employees" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* AI Insights Panel */}
        <Card 
          title={t('aiInsights')} 
          subtitle="Powered by Smart HR Engine"
          className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-100 dark:border-blue-800"
        >
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, i) => (
                <motion.div 
                  key={i}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.2 }}
                  className="flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                >
                  {insight.insight_type === 'warning' && <AlertTriangle className="text-yellow-500 shrink-0" size={20} />}
                  {insight.insight_type === 'success' && <TrendingUp className="text-green-500 shrink-0" size={20} />}
                  {insight.insight_type === 'info' && <Sparkles className="text-blue-500 shrink-0" size={20} />}
                  <p className="text-sm text-gray-700 dark:text-gray-300">{insight.message}</p>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Sparkles className="animate-pulse mb-2" />
                <p className="text-sm">Analyzing data...</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
