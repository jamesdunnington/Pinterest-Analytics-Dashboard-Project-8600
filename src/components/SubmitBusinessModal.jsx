import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import supabase from '../lib/supabase';
import { BUSINESS_CATEGORIES } from '../config/categories';
import CategorySelector from './CategorySelector';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiCheck, FiLoader, FiAlertCircle, FiMail, FiMapPin, FiGlobe, FiTag, FiInfo, FiSend } = FiIcons;

const SubmitBusinessModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    website_url: '',
    contact_email: '',
    description: '',
    submitter_email: '',
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error when user types
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Business name is required';
    }
    if (!formData.category) {
      errors.category = 'Please select a category';
    }
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    if (formData.website_url && !isValidUrl(formData.website_url)) {
      errors.website_url = 'Please enter a valid URL (include http:// or https://)';
    }
    if (formData.contact_email && !isValidEmail(formData.contact_email)) {
      errors.contact_email = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.submitter_email.trim()) {
      errors.submitter_email = 'Your email is required for verification';
    } else if (!isValidEmail(formData.submitter_email)) {
      errors.submitter_email = 'Please enter a valid email address';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const prevStep = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep2()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Submitting business with data:', formData);
      
      // Generate a verification token
      const verificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Prepare the submission data
      const submissionData = {
        name: formData.name.trim(),
        category: formData.category,
        location: formData.location.trim(),
        website_url: formData.website_url?.trim() || null,
        contact_email: formData.contact_email?.trim() || null,
        description: formData.description?.trim() || null,
        submitter_email: formData.submitter_email.trim(),
        status: 'pending',
        verification_token: verificationToken
      };
      
      console.log('Inserting submission data:', submissionData);
      
      // Insert the business submission into pending_businesses table
      const { data, error: submissionError } = await supabase
        .from('pending_businesses')
        .insert([submissionData])
        .select();
      
      if (submissionError) {
        console.error('Supabase error:', submissionError);
        throw new Error(submissionError.message || 'Failed to submit business');
      }
      
      console.log('Submission successful:', data);
      setSuccess(true);
      
      // In a real application, you would send a verification email here
      // For now, we'll just show the success message
      
    } catch (err) {
      console.error('Error submitting business:', err);
      setError(err.message || 'Failed to submit business. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      location: '',
      website_url: '',
      contact_email: '',
      description: '',
      submitter_email: '',
    });
    setStep(1);
    setSuccess(false);
    setError(null);
    setValidationErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const modalVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2,
      }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />
          
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between bg-primary-600 text-white px-6 py-4">
                <h3 className="text-lg font-semibold">
                  {success ? 'Submission Successful' : 'Submit a Business'}
                </h3>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-primary-700 transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
              
              {/* Body */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-10rem)]">
                {success ? (
                  <div className="text-center py-8">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <SafeIcon icon={FiCheck} className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Thank You for Your Submission!</h3>
                    <p className="text-gray-600 mb-6">
                      Your business submission has been received and is pending review. 
                      Our team will review your submission and it will appear in the directory once approved.
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Submitted email: <strong>{formData.submitter_email}</strong>
                    </p>
                    <button
                      onClick={handleClose}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Progress Steps */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            step === 1 ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'
                          } mr-2`}>
                            1
                          </div>
                          <span className={`text-sm font-medium ${
                            step === 1 ? 'text-primary-600' : 'text-gray-600'
                          }`}>
                            Business Details
                          </span>
                        </div>
                        <div className="flex-grow mx-4 h-0.5 bg-gray-200"></div>
                        <div className="flex items-center">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                            step === 2 ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-600'
                          } mr-2`}>
                            2
                          </div>
                          <span className={`text-sm font-medium ${
                            step === 2 ? 'text-primary-600' : 'text-gray-600'
                          }`}>
                            Contact Information
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {error && (
                      <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <SafeIcon icon={FiAlertCircle} className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 1: Business Details */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Business Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="business-name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`w-full px-3 py-2 border ${
                              validationErrors.name 
                                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                            } rounded-md shadow-sm`}
                            placeholder="Enter business name"
                          />
                          {validationErrors.name && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="business-category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <CategorySelector
                            value={formData.category}
                            onChange={(value) => handleInputChange('category', value)}
                            placeholder="Select a category"
                            required
                          />
                          {validationErrors.category && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.category}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="business-location" className="block text-sm font-medium text-gray-700 mb-1">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SafeIcon icon={FiMapPin} className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              id="business-location"
                              value={formData.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className={`w-full pl-10 px-3 py-2 border ${
                                validationErrors.location 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                              } rounded-md shadow-sm`}
                              placeholder="City, State or Region"
                            />
                          </div>
                          {validationErrors.location && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.location}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="business-website" className="block text-sm font-medium text-gray-700 mb-1">
                            Website URL
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SafeIcon icon={FiGlobe} className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="url"
                              id="business-website"
                              value={formData.website_url}
                              onChange={(e) => handleInputChange('website_url', e.target.value)}
                              className={`w-full pl-10 px-3 py-2 border ${
                                validationErrors.website_url 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                              } rounded-md shadow-sm`}
                              placeholder="https://example.com"
                            />
                          </div>
                          {validationErrors.website_url && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.website_url}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="business-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Business Contact Email
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              id="business-email"
                              value={formData.contact_email}
                              onChange={(e) => handleInputChange('contact_email', e.target.value)}
                              className={`w-full pl-10 px-3 py-2 border ${
                                validationErrors.contact_email 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                              } rounded-md shadow-sm`}
                              placeholder="contact@business.com"
                            />
                          </div>
                          {validationErrors.contact_email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.contact_email}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="business-description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            id="business-description"
                            rows="3"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Brief description of the business"
                          ></textarea>
                        </div>
                      </div>
                    )}
                    
                    {/* Step 2: Verification */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <SafeIcon icon={FiInfo} className="h-5 w-5 text-blue-400" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">
                                Please provide your email address for this submission.
                                Your email will not be displayed publicly.
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-medium text-gray-900 mb-2">Business Summary</h4>
                          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-1 text-sm font-medium text-gray-500">Business Name:</div>
                              <div className="col-span-2 text-sm text-gray-900">{formData.name}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-1 text-sm font-medium text-gray-500">Category:</div>
                              <div className="col-span-2 text-sm text-gray-900">
                                {formData.category && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                    <SafeIcon icon={FiTag} className="mr-1 w-3 h-3" />
                                    {formData.category}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="col-span-1 text-sm font-medium text-gray-500">Location:</div>
                              <div className="col-span-2 text-sm text-gray-900">{formData.location}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="submitter-email" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Email Address <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <SafeIcon icon={FiMail} className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              id="submitter-email"
                              value={formData.submitter_email}
                              onChange={(e) => handleInputChange('submitter_email', e.target.value)}
                              className={`w-full pl-10 px-3 py-2 border ${
                                validationErrors.submitter_email 
                                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                                  : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                              } rounded-md shadow-sm`}
                              placeholder="your@email.com"
                            />
                          </div>
                          {validationErrors.submitter_email && (
                            <p className="mt-1 text-sm text-red-600">{validationErrors.submitter_email}</p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Your email will not be displayed publicly.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Footer */}
              {!success && (
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  {step === 1 ? (
                    <div></div> // Empty div to maintain flex layout
                  ) : (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Back
                    </button>
                  )}
                  
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <SafeIcon icon={FiLoader} className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <SafeIcon icon={FiSend} className="-ml-1 mr-2 h-4 w-4" />
                          Submit
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SubmitBusinessModal;