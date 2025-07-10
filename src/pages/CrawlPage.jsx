import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { crawler } from '../utils/crawler';
import { scheduler } from '../utils/scheduler';
import BusinessCard from '../components/BusinessCard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiActivity, FiPlay, FiPause, FiRefreshCw, FiClock, FiCheck, FiX, FiLoader } = FiIcons;

const CrawlPage = () => {
  const [businesses, setBusinesses] = useState([]);
  const [crawlLogs, setCrawlLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [crawling, setCrawling] = useState(false);
  const [schedulerStatus, setSchedulerStatus] = useState(scheduler.getStatus());

  useEffect(() => {
    loadData();
    
    // Update scheduler status periodically
    const interval = setInterval(() => {
      setSchedulerStatus(scheduler.getStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load businesses with crawl metadata
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .select(`
          *,
          crawl_metadata (*)
        `)
        .eq('is_active', true)
        .order('name');

      if (businessError) throw businessError;

      setBusinesses(businessData || []);

      // Load recent crawl logs
      const { data: logData, error: logError } = await supabase
        .from('crawl_logs')
        .select(`
          *,
          businesses (name)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (logError) throw logError;

      setCrawlLogs(logData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecrawlBusiness = async (business) => {
    try {
      setCrawling(true);
      const result = await crawler.crawlBusiness(business);
      
      // Refresh data
      await loadData();
      
      console.log('Crawl result:', result);
    } catch (error) {
      console.error('Error crawling business:', error);
    } finally {
      setCrawling(false);
    }
  };

  const handleRecrawlAll = async () => {
    try {
      setCrawling(true);
      const results = await crawler.batchCrawl(businesses, 'manual');
      
      // Refresh data
      await loadData();
      
      console.log('Batch crawl results:', results);
    } catch (error) {
      console.error('Error in batch crawl:', error);
    } finally {
      setCrawling(false);
    }
  };

  const toggleScheduler = () => {
    if (schedulerStatus.isRunning) {
      scheduler.stop();
    } else {
      scheduler.start();
    }
    setSchedulerStatus(scheduler.getStatus());
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <SafeIcon icon={FiCheck} className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <SafeIcon icon={FiX} className="w-4 h-4 text-red-500" />;
      default:
        return <SafeIcon icon={FiClock} className="w-4 h-4 text-yellow-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <SafeIcon icon={FiLoader} className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Crawl & Update</h1>
          <p className="text-gray-600">
            Monitor and manage website crawling for business listings
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleScheduler}
            disabled={crawling}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              schedulerStatus.isRunning
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            <SafeIcon icon={schedulerStatus.isRunning ? FiPause : FiPlay} className="w-4 h-4" />
            <span>{schedulerStatus.isRunning ? 'Stop' : 'Start'} Scheduler</span>
          </button>
          
          <button
            onClick={handleRecrawlAll}
            disabled={crawling}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SafeIcon icon={crawling ? FiLoader : FiRefreshCw} className={`w-4 h-4 ${crawling ? 'animate-spin' : ''}`} />
            <span>Crawl All</span>
          </button>
        </div>
      </div>

      {/* Scheduler Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Scheduler Status</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className={`font-medium ${schedulerStatus.isRunning ? 'text-green-600' : 'text-gray-600'}`}>
              {schedulerStatus.isRunning ? 'Running' : 'Stopped'}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Schedule</div>
            <div className="font-medium text-gray-900">{schedulerStatus.schedule}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">Next Run</div>
            <div className="font-medium text-gray-900">
              {schedulerStatus.nextRun 
                ? schedulerStatus.nextRun.toLocaleString()
                : 'Not scheduled'
              }
            </div>
          </div>
        </div>
      </div>

      {/* Business Listings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Listings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              crawlMetadata={business.crawl_metadata?.[0]}
              onRecrawl={handleRecrawlBusiness}
            />
          ))}
        </div>
      </div>

      {/* Crawl Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Crawl Logs</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {crawlLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.businesses?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className="text-sm text-gray-900">{log.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.crawl_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.crawl_duration ? `${log.crawl_duration}ms` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {log.error_message || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CrawlPage;