import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { subDays, format } from 'date-fns';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCalendar, FiChevronDown } = FiIcons;

const DateRangePicker = ({ startDate, endDate, onDateChange, className = '' }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const presetRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
  ];

  const handlePresetClick = (days) => {
    const end = new Date();
    const start = subDays(end, days);
    onDateChange(start, end);
    setShowPicker(false);
  };

  const formatDateRange = () => {
    return `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <SafeIcon icon={FiCalendar} className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-700">{formatDateRange()}</span>
        <SafeIcon icon={FiChevronDown} className="h-4 w-4 text-gray-500" />
      </button>

      {showPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
        >
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Select Date Range</h3>
            <div className="space-y-2">
              {presetRanges.map((range) => (
                <button
                  key={range.days}
                  onClick={() => handlePresetClick(range.days)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={format(startDate, 'yyyy-MM-dd')}
                    onChange={(e) => onDateChange(new Date(e.target.value), endDate)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={format(endDate, 'yyyy-MM-dd')}
                    onChange={(e) => onDateChange(startDate, new Date(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DateRangePicker;