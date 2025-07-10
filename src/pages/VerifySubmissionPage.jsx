import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import supabase from '../lib/supabase';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiAlertTriangle, FiLoader, FiArrowLeft } = FiIcons;

const VerifySubmissionPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const [businessName, setBusinessName] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        if (!token) {
          setStatus('error');
          setMessage('Invalid verification token.');
          return;
        }

        // Find the submission with this token
        const { data, error } = await supabase
          .from('pending_businesses')
          .select('id, name, status')
          .eq('verification_token', token)
          .single();

        if (error || !data) {
          setStatus('error');
          setMessage('Invalid or expired verification token.');
          return;
        }

        if (data.status !== 'pending') {
          if (data.status === 'verified' || data.status === 'approved') {
            setStatus('success');
            setBusinessName(data.name);
            setMessage('This submission has already been verified.');
          } else {
            setStatus('error');
            setMessage('This submission has been rejected or is no longer valid.');
          }
          return;
        }

        // Update the submission status
        const { error: updateError } = await supabase
          .from('pending_businesses')
          .update({ status: 'verified' })
          .eq('id', data.id);

        if (updateError) {
          setStatus('error');
          setMessage('Failed to verify your submission. Please try again later.');
          return;
        }

        setStatus('success');
        setBusinessName(data.name);
        setMessage('Your business submission has been successfully verified!');
      } catch (err) {
        console.error('Verification error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again later.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto">
        <Link to="/" className="flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <SafeIcon icon={FiArrowLeft} className="mr-2 w-4 h-4" />
          Back to Directory
        </Link>

        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center">
              {status === 'loading' && (
                <>
                  <SafeIcon icon={FiLoader} className="mx-auto h-12 w-12 text-primary-500 animate-spin mb-4" />
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Verifying your submission</h2>
                  <p className="text-gray-600">Please wait while we verify your business submission...</p>
                </>
              )}

              {status === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <SafeIcon icon={FiCheck} className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Verification Successful!</h2>
                  <p className="text-gray-600 mb-4">
                    {businessName ? `Your submission for "${businessName}" has been verified.` : message}
                  </p>
                  <p className="text-gray-600">
                    Your submission will now be reviewed by our team. Once approved, it will appear in the directory.
                  </p>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <SafeIcon icon={FiAlertTriangle} className="h-10 w-10 text-red-600" />
                  </div>
                  <h2 className="text-xl font-medium text-gray-900 mb-2">Verification Failed</h2>
                  <p className="text-gray-600 mb-4">{message}</p>
                  <p className="text-gray-600">
                    If you believe this is an error, please contact our support team for assistance.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="text-center">
              <Link
                to="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Return to Directory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifySubmissionPage;