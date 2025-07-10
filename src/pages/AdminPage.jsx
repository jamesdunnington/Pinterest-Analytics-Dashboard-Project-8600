import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { BUSINESS_CATEGORIES } from '../config/categories';
import CategorySelector from '../components/CategorySelector';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiDatabase, FiActivity, FiUsers, FiTrendingUp, FiLoader, FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiSearch, FiEye, FiCheck, FiAlertTriangle, FiMail, FiAlertCircle } = FiIcons;

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    activeBusinesses: 0,
    categories: 0,
    locations: 0,
    recentCrawls: 0,
    successfulCrawls: 0,
    pendingSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [initializingDB, setInitializingDB] = useState(false);

  // Database management states
  const [businesses, setBusinesses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 20;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    website_url: '',
    listing_url: '',
    contact_email: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    loadStats();
    if (activeTab === 'database') {
      loadBusinesses();
    } else if (activeTab === 'submissions') {
      loadPendingSubmissions();
    }
  }, [activeTab, currentPage, searchTerm]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('category, location, is_active')
        .limit(1);

      if (businessError) {
        console.log('Businesses table does not exist yet');
        setStats({
          totalBusinesses: 0,
          activeBusinesses: 0,
          categories: 0,
          locations: 0,
          recentCrawls: 0,
          successfulCrawls: 0,
          pendingSubmissions: 0
        });
        setLoading(false);
        return;
      }

      const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('category, location, is_active');

      const totalBusinesses = allBusinesses?.length || 0;
      const activeBusinesses = allBusinesses?.filter(b => b.is_active).length || 0;
      const categories = new Set(allBusinesses?.map(b => b.category)).size;
      const locations = new Set(allBusinesses?.map(b => b.location)).size;

      const { data: crawlLogs } = await supabase
        .from('crawl_logs')
        .select('status, created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      const recentCrawls = crawlLogs?.length || 0;
      const successfulCrawls = crawlLogs?.filter(log => log.status === 'success').length || 0;

      // Get pending submissions count
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_businesses')
        .select('id')
        .eq('status', 'pending');

      const pendingSubmissions = pendingError ? 0 : pendingData?.length || 0;

      setStats({
        totalBusinesses,
        activeBusinesses,
        categories,
        locations,
        recentCrawls,
        successfulCrawls,
        pendingSubmissions
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setBusinesses(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Error loading businesses:', error);
      alert('Error loading businesses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingSubmissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pending_businesses')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPendingSubmissions(data || []);
    } catch (error) {
      console.error('Error loading pending submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDatabase = async () => {
    try {
      setInitializingDB(true);
      
      // Create pending_businesses table if it doesn't exist
      const { error: schemaError } = await supabase.rpc('create_pending_businesses_table');
      
      if (schemaError) {
        console.error('Error creating schema:', schemaError);
        
        // Try direct SQL approach if RPC fails
        const { error: sqlError } = await supabase.query(`
          CREATE TABLE IF NOT EXISTS pending_businesses (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            location TEXT NOT NULL,
            website_url TEXT,
            contact_email TEXT,
            description TEXT,
            submitter_email TEXT NOT NULL,
            verification_token TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
          
          ALTER TABLE IF EXISTS pending_businesses ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY IF NOT EXISTS "Allow all operations on pending_businesses" 
            ON pending_businesses FOR ALL USING (true);
        `);
        
        if (sqlError) {
          console.error('Error creating table with SQL:', sqlError);
        }
      }

      // Insert sample data with preset categories
      const { error: insertError } = await supabase
        .from('businesses')
        .insert([
          { name: 'Acme Technology', category: 'Software Development', location: 'New York', website_url: 'https://example.com/acme', description: 'Leading provider of innovative tech solutions', is_active: true },
          { name: 'Green Gardens', category: 'Landscaping', location: 'Los Angeles', website_url: 'https://example.com/gardens', description: 'Professional landscaping and garden design', is_active: true },
          { name: 'Blue Ocean Consulting', category: 'Consulting', location: 'Chicago', website_url: 'https://example.com/blueocean', description: 'Strategic business consulting for growth', is_active: true },
          { name: 'Sunrise Bakery', category: 'Bakeries', location: 'San Francisco', website_url: 'https://example.com/sunrise', description: 'Artisan breads and pastries baked fresh daily', is_active: true },
          { name: 'Metro Fitness', category: 'Fitness & Wellness', location: 'Boston', website_url: 'https://example.com/metrofitness', description: 'State-of-the-art fitness center with personal training', is_active: true }
        ]);

      if (insertError) {
        console.log('Sample data may already exist:', insertError.message);
      }

      // Insert sample pending submissions
      const { error: pendingError } = await supabase
        .from('pending_businesses')
        .insert([
          { 
            name: 'Downtown Coffee Shop', 
            category: 'Cafes & Coffee Shops', 
            location: 'Portland', 
            website_url: 'https://example.com/downtown-coffee', 
            description: 'Cozy coffee shop with artisan roasts and pastries', 
            submitter_email: 'jane@example.com',
            verification_token: 'sample_token_123',
            status: 'pending'
          },
          { 
            name: 'Riverside Yoga Studio', 
            category: 'Fitness & Wellness', 
            location: 'Austin', 
            website_url: 'https://example.com/riverside-yoga', 
            description: 'Peaceful yoga studio offering classes for all levels', 
            submitter_email: 'john@example.com',
            verification_token: 'sample_token_456',
            status: 'pending'
          }
        ]);

      if (pendingError) {
        console.log('Sample pending data may already exist:', pendingError.message);
      }

      await loadStats();
      alert('Database initialized successfully!');
    } catch (error) {
      console.error('Error initializing database:', error);
      alert('Error initializing database. Please try running the SQL manually in your Supabase dashboard.');
    } finally {
      setInitializingDB(false);
    }
  };

  // Database management functions
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      location: '',
      website_url: '',
      listing_url: '',
      contact_email: '',
      description: '',
      is_active: true
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert('Business name is required');
      return false;
    }
    if (!formData.category) {
      alert('Please select a category');
      return false;
    }
    if (!BUSINESS_CATEGORIES.includes(formData.category)) {
      alert('Please select a valid category from the list');
      return false;
    }
    if (!formData.location.trim()) {
      alert('Location is required');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    try {
      if (!validateForm()) return;

      const { error } = await supabase
        .from('businesses')
        .insert([formData]);

      if (error) throw error;

      resetForm();
      setShowAddForm(false);
      loadBusinesses();
      loadStats();
      alert('Business added successfully!');
    } catch (error) {
      console.error('Error adding business:', error);
      alert('Error adding business: ' + error.message);
    }
  };

  const handleEdit = (business) => {
    setEditingId(business.id);
    setFormData(business);
  };

  const handleUpdate = async () => {
    try {
      if (!validateForm()) return;

      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', editingId);

      if (error) throw error;

      setEditingId(null);
      resetForm();
      loadBusinesses();
      loadStats();
      alert('Business updated successfully!');
    } catch (error) {
      console.error('Error updating business:', error);
      alert('Error updating business: ' + error.message);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('businesses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      loadBusinesses();
      loadStats();
      alert('Business deleted successfully!');
    } catch (error) {
      console.error('Error deleting business:', error);
      alert('Error deleting business: ' + error.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setShowAddForm(false);
    resetForm();
  };

  const approveSubmission = async (submission) => {
    try {
      // First, add to businesses table
      const { error: insertError } = await supabase
        .from('businesses')
        .insert([{
          name: submission.name,
          category: submission.category,
          location: submission.location,
          website_url: submission.website_url,
          contact_email: submission.contact_email,
          description: submission.description,
          is_active: true
        }]);
      
      if (insertError) throw insertError;
      
      // Then, update the submission status
      const { error: updateError } = await supabase
        .from('pending_businesses')
        .update({ status: 'approved' })
        .eq('id', submission.id);
      
      if (updateError) throw updateError;
      
      // In a real app, you'd send an email notification here
      
      loadPendingSubmissions();
      loadStats();
      alert(`Business "${submission.name}" has been approved and added to the directory.`);
    } catch (error) {
      console.error('Error approving submission:', error);
      alert('Error approving submission: ' + error.message);
    }
  };

  const rejectSubmission = async (id, name) => {
    if (!confirm(`Are you sure you want to reject "${name}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('pending_businesses')
        .update({ status: 'rejected' })
        .eq('id', id);
      
      if (error) throw error;
      
      // In a real app, you'd send an email notification here
      
      loadPendingSubmissions();
      loadStats();
      alert(`Business "${name}" has been rejected.`);
    } catch (error) {
      console.error('Error rejecting submission:', error);
      alert('Error rejecting submission: ' + error.message);
    }
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: FiTrendingUp },
    { id: 'database', name: 'Database', icon: FiDatabase },
    { id: 'submissions', name: 'Submissions', icon: FiMail, badge: stats.pendingSubmissions },
    { id: 'settings', name: 'Settings', icon: FiSettings }
  ];

  if (loading && activeTab === 'dashboard') {
    return (
      <div className="flex items-center justify-center min-h-64">
        <SafeIcon icon={FiLoader} className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-600">
          Manage your business directory and monitor system performance
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.name}</span>
              {tab.badge > 0 && (
                <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <SafeIcon icon={FiDatabase} className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalBusinesses}</div>
                  <div className="text-sm text-gray-600">Total Businesses</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <SafeIcon icon={FiUsers} className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stats.activeBusinesses}</div>
                  <div className="text-sm text-gray-600">Active Businesses</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <SafeIcon icon={FiTrendingUp} className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{BUSINESS_CATEGORIES.length}</div>
                  <div className="text-sm text-gray-600">Available Categories</div>
                </div>
              </div>
            </motion.div>
            
            {stats.pendingSubmissions > 0 && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <SafeIcon icon={FiMail} className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.pendingSubmissions}</div>
                    <div className="text-sm text-gray-600">Pending Submissions</div>
                  </div>
                </div>
                <div className="mt-3">
                  <button 
                    onClick={() => setActiveTab('submissions')}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Review submissions →
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Database Initialization */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Database Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Initialize Database</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add sample business data with preset categories to get started.
                </p>
                <button
                  onClick={initializeDatabase}
                  disabled={initializingDB}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {initializingDB ? (
                    <>
                      <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <SafeIcon icon={FiDatabase} className="w-4 h-4" />
                      <span>Add Sample Data</span>
                    </>
                  )}
                </button>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Category System</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Total Categories:</strong> {BUSINESS_CATEGORIES.length}</p>
                  <p><strong>System:</strong> Preset categories ensure consistency</p>
                  <p><strong>Validation:</strong> All entries must use valid categories</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Database Management</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>Add Business</span>
            </button>
          </div>

          {/* Search */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiSearch} className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search businesses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Add Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Business</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CategorySelector
                    value={formData.category}
                    onChange={(value) => handleInputChange('category', value)}
                    placeholder="Select a category"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                  <input
                    type="url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <button
                  onClick={handleAdd}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* Business List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {businesses.map((business) => (
                    <tr key={business.id} className="hover:bg-gray-50">
                      {editingId === business.id ? (
                        <>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <CategorySelector
                              value={formData.category}
                              onChange={(value) => handleInputChange('category', value)}
                              placeholder="Select category"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={formData.is_active}
                              onChange={(e) => handleInputChange('is_active', e.target.value === 'true')}
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                            >
                              <option value="true">Active</option>
                              <option value="false">Inactive</option>
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleUpdate}
                                className="text-green-600 hover:text-green-800"
                              >
                                <SafeIcon icon={FiSave} className="w-4 h-4" />
                              </button>
                              <button
                                onClick={handleCancel}
                                className="text-gray-600 hover:text-gray-800"
                              >
                                <SafeIcon icon={FiX} className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{business.name}</div>
                              {business.website_url && (
                                <div className="text-sm text-gray-500">
                                  <a
                                    href={business.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-primary-600"
                                  >
                                    {business.website_url}
                                  </a>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{business.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{business.location}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              business.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {business.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(business)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(business.id, business.name)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} results
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Business Submissions</h2>
          
          {pendingSubmissions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
              <SafeIcon icon={FiAlertCircle} className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No pending business submissions found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pendingSubmissions.map((submission) => (
                <div 
                  key={submission.id} 
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{submission.name}</h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
                          {submission.category}
                        </span>
                        <span className="text-gray-600 text-sm">{submission.location}</span>
                      </div>
                      
                      {submission.description && (
                        <p className="text-gray-700 mb-3">{submission.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-4">
                        {submission.website_url && (
                          <div>
                            <span className="font-medium text-gray-700">Website:</span>{' '}
                            <a 
                              href={submission.website_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-800"
                            >
                              {submission.website_url}
                            </a>
                          </div>
                        )}
                        
                        {submission.contact_email && (
                          <div>
                            <span className="font-medium text-gray-700">Business Email:</span>{' '}
                            <span>{submission.contact_email}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <SafeIcon icon={FiMail} className="w-4 h-4" />
                          <span>Submitted by: {submission.submitter_email}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(submission.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => approveSubmission(submission)}
                        className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <SafeIcon icon={FiCheck} className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      
                      <button
                        onClick={() => rejectSubmission(submission.id, submission.name)}
                        className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        <SafeIcon icon={FiX} className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">System Settings</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Category System</h3>
              <p className="text-sm text-gray-600">
                Using {BUSINESS_CATEGORIES.length} preset categories to ensure consistency across all business listings.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Database Connection</h3>
              <p className="text-sm text-gray-600">
                Connected to Supabase project: fqrnixmoswlqampfehgj
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Business Submissions</h3>
              <p className="text-sm text-gray-600">
                Public users can submit business entries, which require admin approval before appearing in the directory.
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Email verification is required for all submissions to prevent spam.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;