import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAccountStore } from '../stores/accountStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import { useAlertStore } from '../stores/alertStore';
import Card from '../components/common/Card';
import LineChart from '../components/charts/LineChart';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiTrendingDown, FiEye, FiMousePointer, FiUsers, FiAlertTriangle } = FiIcons;

const Dashboard = () => {
  const { accounts } = useAccountStore();
  const { data, fetchAnalytics, getCurrentSingaporeTime } = useAnalyticsStore();
  const { alerts } = useAlertStore();

  useEffect(() => {
    if (accounts.length > 0) {
      const accountIds = accounts.map(acc => acc.id);
      fetchAnalytics(accountIds, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    }
  }, [accounts, fetchAnalytics]);

  // Calculate totals
  const totalClicks = accounts.reduce((sum, acc) => sum + (acc.stats?.totalClicks || 0), 0);
  const totalImpressions = accounts.reduce((sum, acc) => sum + (acc.stats?.totalImpressions || 0), 0);
  const avgClickRate = accounts.length > 0 
    ? (accounts.reduce((sum, acc) => sum + parseFloat(acc.stats?.clickRate || 0), 0) / accounts.length).toFixed(2)
    : 0;

  // Get recent data for chart
  const recentData = accounts.length > 0 && data[accounts[0].id] 
    ? data[accounts[0].id].slice(-7)
    : [];

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here's what's happening with your Pinterest accounts.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Singapore Time</p>
          <p className="text-lg font-semibold text-gray-900">
            {getCurrentSingaporeTime().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clicks</p>
              <p className="text-3xl font-bold text-gray-900">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <SafeIcon icon={FiMousePointer} className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <SafeIcon icon={FiTrendingUp} className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+12.5%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Impressions</p>
              <p className="text-3xl font-bold text-gray-900">{totalImpressions.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <SafeIcon icon={FiEye} className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <SafeIcon icon={FiTrendingUp} className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-600">+8.2%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Click Rate</p>
              <p className="text-3xl font-bold text-gray-900">{avgClickRate}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <SafeIcon icon={FiTrendingUp} className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <SafeIcon icon={FiTrendingDown} className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-red-600">-2.1%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </Card>

        <Card hover className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Connected Accounts</p>
              <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <SafeIcon icon={FiUsers} className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-500">All accounts active</span>
          </div>
        </Card>
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
          {recentData.length > 0 ? (
            <LineChart data={recentData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <SafeIcon icon={FiTrendingUp} className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Connect an account to view analytics</p>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Alerts */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Alerts</h3>
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiAlertTriangle} className="h-5 w-5 text-orange-500" />
              <span className="text-sm text-gray-600">{unreadAlerts.length} unread</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <SafeIcon icon={FiAlertTriangle} className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No alerts yet</p>
              </div>
            ) : (
              alerts.slice(0, 5).map((alert) => (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-3 rounded-lg border ${
                    !alert.isRead ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {alert.accountName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {alert.metric} dropped by {alert.dropPercentage}%
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>
        {accounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiUsers} className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No accounts connected</p>
            <p className="text-sm">Connect your first Pinterest account to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {account.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      @{account.username}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-gray-500">Clicks</p>
                    <p className="font-medium">{account.stats?.totalClicks?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Impressions</p>
                    <p className="font-medium">{account.stats?.totalImpressions?.toLocaleString()}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;