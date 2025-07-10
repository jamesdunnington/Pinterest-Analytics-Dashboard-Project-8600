import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHome, FiUsers, FiBarChart3, FiFileText, FiSettings } = FiIcons;

const navigation = [
  { name: 'Dashboard', href: '/', icon: FiHome },
  { name: 'Accounts', href: '/accounts', icon: FiUsers },
  { name: 'Analytics', href: '/analytics', icon: FiBarChart3 },
  { name: 'Reports', href: '/reports', icon: FiFileText },
  { name: 'Settings', href: '/settings', icon: FiSettings },
];

const Sidebar = () => {
  return (
    <motion.div
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="bg-white w-64 min-h-screen shadow-lg border-r border-gray-200"
    >
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-pinterest-500 rounded-lg flex items-center justify-center">
            <SafeIcon icon={FiBarChart3} className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pinterest</h2>
            <p className="text-sm text-gray-500">Analytics</p>
          </div>
        </div>
      </div>

      <nav className="mt-8">
        <div className="px-3 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-500'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <SafeIcon
                    icon={item.icon}
                    className={`mr-3 h-5 w-5 ${
                      isActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-6">
        <div className="bg-gradient-to-r from-pinterest-500 to-pinterest-600 rounded-lg p-4 text-white">
          <h3 className="text-sm font-semibold">Need Help?</h3>
          <p className="text-xs mt-1 opacity-90">
            Check our documentation for detailed guides.
          </p>
          <button className="mt-3 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-md transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;