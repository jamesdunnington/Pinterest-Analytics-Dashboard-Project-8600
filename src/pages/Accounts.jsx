import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAccountStore } from '../stores/accountStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import toast from 'react-hot-toast';

const { FiPlus, FiTrash2, FiRefreshCw, FiCheck, FiX } = FiIcons;

const Accounts = () => {
  const { accounts, addAccount, removeAccount, syncAccount, isLoading } = useAccountStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.username) {
      toast.error('Please fill in all fields');
      return;
    }

    const result = await addAccount(formData);
    
    if (result.success) {
      toast.success('Account connected successfully!');
      setFormData({ name: '', username: '' });
      setShowAddForm(false);
    } else {
      toast.error(result.error || 'Failed to connect account');
    }
  };

  const handleRemove = (accountId) => {
    if (window.confirm('Are you sure you want to remove this account?')) {
      removeAccount(accountId);
      toast.success('Account removed successfully');
    }
  };

  const handleSync = async (accountId) => {
    await syncAccount(accountId);
    toast.success('Account synced successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pinterest Accounts</h1>
          <p className="text-gray-600 mt-1">
            Manage your connected Pinterest accounts and their settings.
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2"
        >
          <SafeIcon icon={FiPlus} className="h-4 w-4" />
          <span>Add Account</span>
        </Button>
      </div>

      {/* Add Account Form */}
      {showAddForm && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Connect New Account</h3>
            <Button
              variant="ghost"
              onClick={() => setShowAddForm(false)}
              className="p-2"
            >
              <SafeIcon icon={FiX} className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="My Pinterest Business"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="mybusiness"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isLoading}
              >
                Connect Account
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Connected Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            layout
          >
            <Card hover className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img
                    src={account.avatar}
                    alt={account.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                    <p className="text-sm text-gray-500">@{account.username}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Connected</span>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Clicks</span>
                  <span className="font-semibold">{account.stats?.totalClicks?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Impressions</span>
                  <span className="font-semibold">{account.stats?.totalImpressions?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Click Rate</span>
                  <span className="font-semibold">{account.stats?.clickRate}%</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-4">
                <p>Connected: {new Date(account.connectedAt).toLocaleDateString()}</p>
                <p>Last Sync: {new Date(account.lastSyncAt).toLocaleDateString()}</p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSync(account.id)}
                  className="flex-1"
                >
                  <SafeIcon icon={FiRefreshCw} className="h-4 w-4 mr-1" />
                  Sync
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleRemove(account.id)}
                  className="flex-1"
                >
                  <SafeIcon icon={FiTrash2} className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {accounts.length === 0 && !showAddForm && (
        <Card className="text-center py-12">
          <SafeIcon icon={FiPlus} className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No accounts connected</h3>
          <p className="text-gray-600 mb-6">
            Connect your first Pinterest account to start tracking your analytics.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <SafeIcon icon={FiPlus} className="h-4 w-4 mr-2" />
            Connect Account
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Accounts;