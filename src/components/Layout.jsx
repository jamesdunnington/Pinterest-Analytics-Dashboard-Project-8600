import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import UserMenu from './UserMenu';
import { useAuth } from './AuthProvider';
import * as FiIcons from 'react-icons/fi';

const { FiSearch, FiSettings, FiDatabase, FiActivity, FiList, FiLogIn } = FiIcons;

const Layout = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navigation = [
    { name: 'Directory', href: '/', icon: FiSearch, requiresAuth: false },
    { name: 'Database', href: '/database', icon: FiList, requiresAuth: true },
    { name: 'Admin', href: '/admin', icon: FiSettings, requiresAuth: true },
    { name: 'Crawl & Update', href: '/crawl', icon: FiActivity, requiresAuth: true },
    { name: 'Import', href: '/import', icon: FiDatabase, requiresAuth: true },
  ];

  // Filter navigation items based on authentication
  const filteredNav = navigation.filter(item => !item.requiresAuth || isAuthenticated);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                  <SafeIcon icon={FiDatabase} className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Business Directory</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation */}
              <nav className="hidden md:flex space-x-4">
                {filteredNav.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-primary-50'
                    }`}
                  >
                    <SafeIcon icon={item.icon} className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Mobile Navigation Menu */}
              <div className="md:hidden">
                <select
                  value={location.pathname}
                  onChange={(e) => window.location.href = `#${e.target.value}`}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                >
                  {filteredNav.map((item) => (
                    <option key={item.name} value={item.href}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Authentication Section */}
              {!isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="flex items-center space-x-1 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 transition-colors"
                  >
                    <SafeIcon icon={FiLogIn} className="w-4 h-4" />
                    <span>Sign In</span>
                  </Link>
                </div>
              ) : (
                <UserMenu />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default Layout;