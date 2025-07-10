import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { subDays } from 'date-fns';
import { useAccountStore } from '../stores/accountStore';
import { useAnalyticsStore } from '../stores/analyticsStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DateRangePicker from '../components/common/DateRangePicker';
import LineChart from '../components/charts/LineChart';
import ComparisonChart from '../components/charts/ComparisonChart';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBarChart3, FiTrendingUp, FiUsers, FiEye, FiMousePointer } = FiIcons;

const Analytics = () => {
  const { accounts, selectedAccounts, setSelectedAccounts } = useAccountStore();
  const { data, fetchAnalytics, isLoading, dateRange, setDateRange } = useAnalyticsStore();
  const [selectedMetric, setSelectedMetric] = useState('clicks');
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'comparison'

  useEffect(() => {
    if (accounts.length > 0 && selectedAccounts.length === 0) {
      setSelectedAccounts([accounts[0].id]);
    }
  }, [accounts, selectedAccounts, setSelectedAccounts]);

  useEffect(() => {
    if (selectedAccounts.length > 0) {
      fetchAnalytics(selectedAccounts, dateRange.startDate, dateRange.endDate);
    }
  }, [selectedAccounts, dateRange, fetchAnalytics]);

  const handleDateChange = (startDate, endDate) => {
    setDateRange(startDate, endDate);
  };

  const handleAccountToggle = (accountId) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
    } else {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };

  const getChartData = () => {
    if (viewMode === 'individual' && selectedAccounts.length > 0) {
      return data[selectedAccounts[0]] || [];
    } else if (viewMode === 'comparison' && selectedAccounts.length > 0) {
      // Merge data from multiple accounts for comparison
      const firstAccountData = data[selectedAccounts[0]] || [];
      return firstAccountData.map(item => {
        const mergedItem = { date: item.date };
        selectedAccounts.forEach(accountId => {
          const accountData = data[accountId] || [];
          const accountItem = accountData.find(d => d.date === item.date);
          mergedItem[accountId] = accountItem ? accountItem[selectedMetric] : 0;
        });
        return mergedItem;
      });
    }
    return [];
  };

  const selectedAccountsData = selectedAccounts.map(id => 
    accounts.find(acc => acc.id === id)
  ).filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Deep dive into your Pinterest performance metrics.
          </p>
        </div>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateChange={handleDateChange}
        />
      </div>

      {/* Account Selection */}
      <Card>
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Select Accounts</h3>
          <div className="flex space-x-2">
            <Button
              variant={viewMode === 'individual' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('individual')}
            >
              Individual
            </Button>
            <Button
              variant={viewMode === 'comparison' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('comparison')}
            >
              Comparison
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <motion.div
              key={account.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                selectedAccounts.includes(account.id)
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleAccountToggle(account.id)}
            >
              <div className="flex items-center space-x-3">
                <img
                  src={account.avatar}
                  alt={account.name}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{account.name}</h4>
                  <p className="text-sm text-gray-500">@{account.username}</p>
                </div>
                {selectedAccounts.includes(account.id) && (
                  <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiIcons.FiCheck} className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Metrics Selection */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedMetric('clicks')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedMetric === 'clicks'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <SafeIcon icon={FiMousePointer} className="h-8 w-8 mx-auto mb-2 text-blue-600" />
            <p className="font-medium">Clicks</p>
          </button>
          
          <button
            onClick={() => setSelectedMetric('impressions')}
            className={`p-4 rounded-lg border-2 transition-colors ${
              selectedMetric === 'impressions'
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <SafeIcon icon={FiEye} className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <p className="font-medium">Impressions</p>
          </button>
        </div>
      </Card>

      {/* Chart */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {viewMode === 'individual' ? 'Performance Trends' : 'Account Comparison'}
          </h3>
          {isLoading && (
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
              <span className="text-sm">Loading...</span>
            </div>
          )}
        </div>
        
        {selectedAccounts.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <SafeIcon icon={FiBarChart3} className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Select at least one account to view analytics</p>
            </div>
          </div>
        ) : (
          <div className="h-96">
            {viewMode === 'individual' ? (
              <LineChart 
                data={getChartData()} 
                metrics={[selectedMetric]}
                colors={selectedMetric === 'clicks' ? ['#3b82f6'] : ['#ec4899']}
              />
            ) : (
              <ComparisonChart 
                data={getChartData()}
                accounts={selectedAccountsData}
                metric={selectedMetric}
              />
            )}
          </div>
        )}
      </Card>

      {/* Summary Stats */}
      {selectedAccounts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {selectedAccountsData.map((account) => {
            const accountData = data[account.id] || [];
            const totalClicks = accountData.reduce((sum, item) => sum + item.clicks, 0);
            const totalImpressions = accountData.reduce((sum, item) => sum + item.impressions, 0);
            const avgClickRate = accountData.length > 0 
              ? (totalClicks / totalImpressions * 100).toFixed(2)
              : 0;

            return (
              <Card key={account.id} hover>
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{account.name}</h4>
                    <p className="text-sm text-gray-500">@{account.username}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Clicks</span>
                    <span className="font-semibold">{totalClicks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Impressions</span>
                    <span className="font-semibold">{totalImpressions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Click Rate</span>
                    <span className="font-semibold">{avgClickRate}%</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Analytics;