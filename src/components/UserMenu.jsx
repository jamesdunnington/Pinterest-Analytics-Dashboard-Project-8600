import React, { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiLogOut, FiSettings, FiChevronDown } = FiIcons;

const UserMenu = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Only render if authenticated
  if (!isAuthenticated) {
    return null;
  }

  // User avatar - first letter of email or default icon
  const userInitial = user?.email ? user.email[0].toUpperCase() : 'U';

  return (
    <Menu as="div" className="relative ml-3">
      <div>
        <Menu.Button className="flex items-center space-x-2 text-sm rounded-md px-3 py-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
            {userInitial}
          </div>
          <span className="hidden sm:block text-gray-700 font-medium">
            {user?.email?.split('@')[0] || 'User'}
          </span>
          <SafeIcon icon={FiChevronDown} className="w-4 h-4 text-gray-400" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">
              {user?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>

          <Menu.Item>
            {({ active }) => (
              <Link
                to="/account"
                className={`${
                  active ? 'bg-gray-100' : ''
                } flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors`}
              >
                <SafeIcon icon={FiUser} className="w-4 h-4 mr-3" />
                Your Account
              </Link>
            )}
          </Menu.Item>

          <Menu.Item>
            {({ active }) => (
              <Link
                to="/admin"
                className={`${
                  active ? 'bg-gray-100' : ''
                } flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors`}
              >
                <SafeIcon icon={FiSettings} className="w-4 h-4 mr-3" />
                Admin Settings
              </Link>
            )}
          </Menu.Item>

          <div className="border-t border-gray-100">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={handleLogout}
                  className={`${
                    active ? 'bg-gray-100' : ''
                  } flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors`}
                >
                  <SafeIcon icon={FiLogOut} className="w-4 h-4 mr-3" />
                  Sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default UserMenu;