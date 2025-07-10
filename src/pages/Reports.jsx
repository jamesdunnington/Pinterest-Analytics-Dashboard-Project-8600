import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccountStore } from '../stores/accountStore';
import { useReportStore } from '../stores/reportStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import DateRangePicker from '../components/common/DateRangePicker';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const { FiDownload, FiMail, FiFileText, FiCalendar, FiSettings } = FiIcons;

const Reports = () => {
  const { accounts } = useAccountStore();
  const { settings, reportHistory, isGenerating, updateSettings, generateReport } = useReportStore();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date()
  });
  const [selectedAccounts, setSelectedAccounts] = useState([]);
  const [reportFormat, setReportFormat] = useState('pdf');

  const handleAccountToggle = (accountId) => {
    if (selectedAccounts.includes(accountId)) {
      setSelectedAccounts(selectedAccounts.filter(id => id !== accountId));
    } else {
      setSelectedAccounts([...selectedAccounts, accountId]);
    }
  };

  const handleGenerateReport = async () => {
    if (selectedAccounts.length === 0) {
      toast.error('Please select at least one account');
      return;
    }

    const result = await generateReport(
      selectedAccounts,
      dateRange.startDate,
      dateRange.endDate,
      reportFormat
    );

    if (result.success) {
      toast.success('Report generated successfully!');
      // In a real app, this would trigger a download
      const link = document.createElement('a');
      link.href = result.report.downloadUrl;
      link.download = `pinterest-report-${Date.now()}.${reportFormat}`;
      link.click();
    } else {
      toast.error(result.error || 'Failed to generate report');
    }
  };

  const handleSettingsUpdate = (newSettings) => {
    updateSettings(newSettings);
    toast.success('Settings updated successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate and download comprehensive analytics reports.
          </p>
        </div>
      </div>

      {/* Report Generation */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate New Report</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Select Accounts</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {accounts.map((account) => (
                <label
                  key={account.id}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedAccounts.includes(account.id)}
                    onChange={() => handleAccountToggle(account.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500">@{account.username}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Date Range</h4>
              <DateRangePicker
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateChange={(start, end) => setDateRange({ startDate: start, endDate: end })}
              />
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Format</h4>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setReportFormat('pdf')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    reportFormat === 'pdf'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={FiFileText} className="h-6 w-6 mx-auto mb-1 text-red-600" />
                  <p className="text-sm font-medium">PDF</p>
                </button>
                <button
                  onClick={() => setReportFormat('csv')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    reportFormat === 'csv'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <SafeIcon icon={FiDownload} className="h-6 w-6 mx-auto mb-1 text-green-600" />
                  <p className="text-sm font-medium">CSV</p>
                </button>
              </div>
            </div>

            <Button
              onClick={handleGenerateReport}
              isLoading={isGenerating}
              className="w-full"
            >
              <SafeIcon icon={FiDownload} className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Weekly Report Settings */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Report Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Enable Weekly Reports</p>
              <p className="text-sm text-gray-500">Automatically generate and email reports every week</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.weeklyReports}
                onChange={(e) => handleSettingsUpdate({ weeklyReports: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {settings.weeklyReports && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.emailAddress}
                  onChange={(e) => handleSettingsUpdate({ emailAddress: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Format
                </label>
                <select
                  value={settings.reportFormat}
                  onChange={(e) => handleSettingsUpdate({ reportFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.includeCharts}
                onChange={(e) => handleSettingsUpdate({ includeCharts: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Include Charts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.includeAlerts}
                onChange={(e) => handleSettingsUpdate({ includeAlerts: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Include Alerts</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Report History */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report History</h3>
        
        {reportHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiFileText} className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>No reports generated yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reportHistory.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <SafeIcon 
                    icon={FiFileText} 
                    className={`h-8 w-8 ${
                      report.format === 'pdf' ? 'text-red-600' : 'text-green-600'
                    }`} 
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {report.format.toUpperCase()} Report
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(report.startDate).toLocaleDateString()} - {new Date(report.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      Generated on {new Date(report.generatedAt).toLocaleDateString()} • {report.size} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(report.downloadUrl, '_blank')}
                >
                  <SafeIcon icon={FiDownload} className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;