import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BUSINESS_CATEGORIES, CATEGORY_GROUPS, getCategorySuggestions } from '../config/categories';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiChevronDown, FiSearch, FiX } = FiIcons;

const CategorySelector = ({ value, onChange, placeholder = "Select a category", required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState(BUSINESS_CATEGORIES);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const suggestions = getCategorySuggestions(searchTerm);
    setFilteredCategories(suggestions);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (category) => {
    onChange(category);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange('');
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={toggleDropdown}
          className={`w-full px-3 py-2 text-left border rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
            isOpen ? 'border-primary-500' : 'border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={value ? 'text-gray-900' : 'text-gray-500'}>
              {value || placeholder}
              {required && !value && <span className="text-red-500 ml-1">*</span>}
            </span>
            <div className="flex items-center space-x-2">
              {value && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              )}
              <SafeIcon 
                icon={FiChevronDown} 
                className={`w-4 h-4 text-gray-400 transform transition-transform ${
                  isOpen ? 'rotate-180' : ''
                }`} 
              />
            </div>
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200">
              <div className="relative">
                <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Categories List */}
            <div className="max-h-80 overflow-y-auto">
              {searchTerm ? (
                // Show filtered results when searching
                <div className="py-2">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategorySelect(category)}
                        className={`w-full text-left px-4 py-2 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                          value === category ? 'bg-primary-100 text-primary-700' : 'text-gray-900'
                        }`}
                      >
                        {category}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No categories found matching "{searchTerm}"
                    </div>
                  )}
                </div>
              ) : (
                // Show grouped categories when not searching
                <div className="py-2">
                  {Object.entries(CATEGORY_GROUPS).map(([groupName, categories]) => (
                    <div key={groupName}>
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                        {groupName}
                      </div>
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full text-left px-4 py-2 hover:bg-primary-50 hover:text-primary-600 transition-colors ${
                            value === category ? 'bg-primary-100 text-primary-700' : 'text-gray-900'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategorySelector;