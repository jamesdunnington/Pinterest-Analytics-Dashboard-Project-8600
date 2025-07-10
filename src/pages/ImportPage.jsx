import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { csvImporter } from '../utils/csvImport';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUpload, FiDownload, FiCheck, FiX, FiLoader, FiAlertCircle } = FiIcons;

const ImportPage = () => {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'text/csv') {
      alert('Please select a CSV file');
      return;
    }
    setFile(selectedFile);
    setResults(null);
  };

  const handleImport = async () => {
    if (!file) return;

    try {
      setImporting(true);
      const result = await csvImporter.processCSVFile(file);
      setResults(result);
    } catch (error) {
      console.error('Import error:', error);
      setResults({
        success: false,
        error: error.message,
        totalRows: 0,
        validRows: 0,
        importedCount: 0,
        errors: []
      });
    } finally {
      setImporting(false);
    }
  };

  const downloadSampleCSV = () => {
    const csv = csvImporter.generateSampleCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_business_directory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetImport = () => {
    setFile(null);
    setResults(null);
    setImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">CSV Import</h1>
        <p className="text-gray-600">
          Import business listings from CSV files with batch processing
        </p>
      </div>

      {/* Sample CSV Download */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-2">
          <SafeIcon icon={FiDownload} className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-blue-900">Sample CSV Template</h3>
        </div>
        <p className="text-blue-700 mb-4">
          Download a sample CSV file to see the required format and columns.
        </p>
        <button
          onClick={downloadSampleCSV}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <SafeIcon icon={FiDownload} className="w-4 h-4" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {/* File Upload */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload CSV File</h2>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary-400 bg-primary-50' 
              : 'border-gray-300 hover:border-primary-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <SafeIcon icon={FiUpload} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          {file ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(1)} KB
              </p>
              <div className="flex items-center justify-center space-x-4 mt-4">
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SafeIcon icon={importing ? FiLoader : FiUpload} className={`w-4 h-4 ${importing ? 'animate-spin' : ''}`} />
                  <span>{importing ? 'Importing...' : 'Import CSV'}</span>
                </button>
                <button
                  onClick={resetImport}
                  disabled={importing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-gray-600">
                Drag and drop your CSV file here, or{' '}
                <label className="text-primary-600 hover:text-primary-700 cursor-pointer">
                  browse
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500">
                Supports CSV files up to 10MB
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Import Results */}
      {results && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center space-x-2 mb-4">
            <SafeIcon 
              icon={results.success ? FiCheck : FiX} 
              className={`w-5 h-5 ${results.success ? 'text-green-600' : 'text-red-600'}`} 
            />
            <h3 className="text-lg font-semibold text-gray-900">Import Results</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{results.totalRows}</div>
              <div className="text-sm text-gray-600">Total Rows</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.validRows}</div>
              <div className="text-sm text-green-600">Valid Rows</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{results.importedCount}</div>
              <div className="text-sm text-blue-600">Imported</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{results.errors?.length || 0}</div>
              <div className="text-sm text-red-600">Errors</div>
            </div>
          </div>

          {!results.success && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-900">Import Failed</span>
              </div>
              <p className="text-red-700">{results.error}</p>
            </div>
          )}

          {results.errors && results.errors.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Validation Errors</h4>
              <div className="max-h-64 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Row
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Errors
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {results.errors.map((error, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {error.row}
                        </td>
                        <td className="px-4 py-2 text-sm text-red-600">
                          {error.errors.join(', ')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={resetImport}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Import Another File
            </button>
          </div>
        </motion.div>
      )}

      {/* CSV Format Guide */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">CSV Format Requirements</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Required Columns:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">name</code> - Business name</li>
              <li><code className="bg-gray-100 px-1 rounded">category</code> - Business category</li>
              <li><code className="bg-gray-100 px-1 rounded">location</code> - Business location</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Optional Columns:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">website_url</code> - Business website</li>
              <li><code className="bg-gray-100 px-1 rounded">listing_url</code> - Directory listing URL</li>
              <li><code className="bg-gray-100 px-1 rounded">contact_email</code> - Contact email</li>
              <li><code className="bg-gray-100 px-1 rounded">description</code> - Business description</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportPage;