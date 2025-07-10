import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import { useAuth } from '../components/AuthProvider';
import { BUSINESS_CATEGORIES } from '../config/categories';
import BusinessCard from '../components/BusinessCard';
import SearchFilters from '../components/SearchFilters';
import Pagination from '../components/Pagination';
import SubmitBusinessModal from '../components/SubmitBusinessModal';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiLoader, FiAlertCircle, FiLogIn, FiUserPlus, FiShield, FiPlusCircle } = FiIcons;

const DirectoryPage = () => {
  const { isAuthenticated } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [crawlMetadata, setCrawlMetadata] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 100;

  // Filter state - using individual state variables to prevent object reference issues
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [urlFilter, setUrlFilter] = useState('');

  // Use preset categories instead of loading from database
  const categories = BUSINESS_CATEGORIES;
  const [locations, setLocations] = useState([]);

  // Memoize filters object to prevent unnecessary re-renders
  const filters = useMemo(() => ({
    search: searchTerm,
    category: selectedCategory,
    location: selectedLocation,
    url: urlFilter
  }), [searchTerm, selectedCategory, selectedLocation, urlFilter]);

  // Memoize the loadBusinesses function
  const loadBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('name');

      // Apply filters
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }
      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }
      if (selectedLocation) {
        query = query.eq('location', selectedLocation);
      }
      if (urlFilter.trim()) {
        query = query.or(`website_url.ilike.%${urlFilter}%,listing_url.ilike.%${urlFilter}%`);
      }

      // Apply pagination
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setBusinesses(data || []);
      setTotalItems(count || 0);

      // Load crawl metadata for these businesses
      if (data && data.length > 0) {
        const businessIds = data.map(b => b.id);
        const { data: metadata } = await supabase
          .from('crawl_metadata')
          .select('*')
          .in('business_id', businessIds);

        const metadataMap = {};
        metadata?.forEach(m => {
          metadataMap[m.business_id] = m;
        });
        setCrawlMetadata(metadataMap);
      }
    } catch (error) {
      console.error('Error loading businesses:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedCategory, selectedLocation, urlFilter]);

  // Load locations only once
  const loadLocations = useCallback(async () => {
    try {
      // Load locations
      const { data: locationData } = await supabase
        .from('businesses')
        .select('location')
        .eq('is_active', true);

      const uniqueLocations = [...new Set(locationData?.map(b => b.location) || [])];
      setLocations(uniqueLocations.sort());
    } catch (error) {
      console.error('Error loading locations:', error);
    }
  }, []);

  // Load businesses when dependencies change
  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  // Load locations only once on mount
  useEffect(() => {
    loadLocations();
  }, [loadLocations]);

  const handleFilter = useCallback((newFilters) => {
    setSearchTerm(newFilters.search || '');
    setSelectedCategory(newFilters.category || '');
    setSelectedLocation(newFilters.location || '');
    setUrlFilter(newFilters.url || '');
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openSubmitModal = () => {
    setIsSubmitModalOpen(true);
  };

  const closeSubmitModal = () => {
    setIsSubmitModalOpen(false);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <SafeIcon icon={FiLoader} className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
          <p className="text-gray-600 mt-2">
            Please make sure your Supabase project is properly connected.
            Check the configuration in your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Business Directory</h1>
            <p className="text-gray-600">
              Discover and explore {totalItems.toLocaleString()} businesses across {categories.length} categories
            </p>
          </div>
          <div className="flex space-x-4">
            {/* Submit Business Button - Only for logged-out users */}
            {!isAuthenticated && (
              <button 
                onClick={openSubmitModal}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
              >
                <SafeIcon icon={FiPlusCircle} className="w-4 h-4" />
                <span>Submit Business</span>
              </button>
            )}

            {/* Admin Access Banner */}
            {!isAuthenticated && (
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 max-w-md">
                <div className="flex items-center space-x-2 mb-2">
                  <SafeIcon icon={FiShield} className="w-5 h-5 text-primary-600" />
                  <h3 className="text-sm font-medium text-primary-900">Admin Access</h3>
                </div>
                <p className="text-xs text-primary-700 mb-3">
                  Sign in to access database management, crawling tools, and admin features.
                </p>
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 px-3 py-1 bg-primary-600 text-white rounded text-xs hover:bg-primary-700 transition-colors"
                  >
                    <SafeIcon icon={FiLogIn} className="w-3 h-3" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center space-x-1 px-3 py-1 border border-primary-600 text-primary-600 rounded text-xs hover:bg-primary-50 transition-colors"
                  >
                    <SafeIcon icon={FiUserPlus} className="w-3 h-3" />
                    <span>Sign Up</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SearchFilters
        onFilter={handleFilter}
        categories={categories}
        locations={locations}
        initialFilters={filters}
      />

      {businesses.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No businesses found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {businesses.map((business) => (
              <BusinessCard 
                key={business.id}
                business={business}
                crawlMetadata={crawlMetadata[business.id]}
              />
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {/* Submit Business Modal */}
      <SubmitBusinessModal isOpen={isSubmitModalOpen} onClose={closeSubmitModal} />
    </div>
  );
};

export default DirectoryPage;