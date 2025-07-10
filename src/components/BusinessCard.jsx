import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiExternalLink, FiMail, FiMapPin, FiTag } = FiIcons;

const BusinessCard = ({ business, crawlMetadata, onRecrawl }) => {
  const handleRecrawl = () => {
    if (onRecrawl) {
      onRecrawl(business);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{business.name}</h3>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiTag} className="w-4 h-4" />
              <span>{business.category}</span>
            </div>
            <div className="flex items-center space-x-1">
              <SafeIcon icon={FiMapPin} className="w-4 h-4" />
              <span>{business.location}</span>
            </div>
          </div>

          {business.description && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-2">{business.description}</p>
          )}

          <div className="flex items-center space-x-4">
            {business.website_url && (
              <a
                href={business.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
              >
                <SafeIcon icon={FiExternalLink} className="w-4 h-4" />
                <span>Website</span>
              </a>
            )}
            
            {business.contact_email && (
              <a
                href={`mailto:${business.contact_email}`}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
              >
                <SafeIcon icon={FiMail} className="w-4 h-4" />
                <span>Email</span>
              </a>
            )}
          </div>
        </div>

        {onRecrawl && (
          <button
            onClick={handleRecrawl}
            className="ml-4 px-3 py-1 text-xs bg-primary-100 text-primary-700 rounded-md hover:bg-primary-200 transition-colors"
          >
            Re-crawl
          </button>
        )}
      </div>

      {crawlMetadata && (
        <div className="border-t pt-4 mt-4">
          <div className="text-xs text-gray-500 mb-2">
            <span className="font-medium">Last crawled:</span> {
              crawlMetadata.last_crawled 
                ? new Date(crawlMetadata.last_crawled).toLocaleDateString()
                : 'Never'
            }
          </div>
          
          {crawlMetadata.meta_title && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Title:</span> {crawlMetadata.meta_title}
            </div>
          )}
          
          {crawlMetadata.meta_description && (
            <div className="text-xs text-gray-600 mb-1">
              <span className="font-medium">Description:</span> {crawlMetadata.meta_description}
            </div>
          )}
          
          <div className="flex items-center space-x-2 mt-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              crawlMetadata.crawl_status === 'success' 
                ? 'bg-green-100 text-green-800'
                : crawlMetadata.crawl_status === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {crawlMetadata.crawl_status || 'pending'}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default BusinessCard;