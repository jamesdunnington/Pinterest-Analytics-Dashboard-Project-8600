import Papa from 'papaparse';
import { supabase } from '../config/supabase';
import { BUSINESS_CATEGORIES, isValidCategory } from '../config/categories';

export class CSVImporter {
  constructor() {
    this.requiredColumns = ['name', 'category', 'location'];
    this.optionalColumns = ['website_url', 'listing_url', 'contact_email', 'description'];
  }

  async parseCSV(file) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }

  validateData(data) {
    const errors = [];
    const validRows = [];

    data.forEach((row, index) => {
      const rowErrors = [];

      // Check required columns
      this.requiredColumns.forEach(col => {
        if (!row[col] || row[col].trim() === '') {
          rowErrors.push(`Missing required field: ${col}`);
        }
      });

      // Validate category against preset categories
      if (row.category && !isValidCategory(row.category.trim())) {
        rowErrors.push(`Invalid category: "${row.category}". Must be one of the predefined categories.`);
      }

      // Validate email format if provided
      if (row.contact_email && !this.isValidEmail(row.contact_email)) {
        rowErrors.push('Invalid email format');
      }

      // Validate URL format if provided
      if (row.website_url && !this.isValidUrl(row.website_url)) {
        rowErrors.push('Invalid website URL format');
      }

      if (row.listing_url && !this.isValidUrl(row.listing_url)) {
        rowErrors.push('Invalid listing URL format');
      }

      if (rowErrors.length > 0) {
        errors.push({
          row: index + 1,
          errors: rowErrors,
          data: row
        });
      } else {
        validRows.push({
          ...row,
          name: row.name.trim(),
          category: row.category.trim(),
          location: row.location.trim(),
          website_url: row.website_url?.trim() || null,
          listing_url: row.listing_url?.trim() || null,
          contact_email: row.contact_email?.trim() || null,
          description: row.description?.trim() || null,
          is_active: true
        });
      }
    });

    return { validRows, errors };
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  async importBusinesses(validRows) {
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < validRows.length; i += batchSize) {
      const batch = validRows.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('businesses')
        .insert(batch)
        .select();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      results.push(...data);
    }

    return results;
  }

  async processCSVFile(file) {
    try {
      // Parse CSV
      const data = await this.parseCSV(file);

      // Validate data
      const { validRows, errors } = this.validateData(data);

      // Import valid rows
      let importedBusinesses = [];
      if (validRows.length > 0) {
        importedBusinesses = await this.importBusinesses(validRows);
      }

      return {
        success: true,
        totalRows: data.length,
        validRows: validRows.length,
        importedCount: importedBusinesses.length,
        errors: errors,
        importedBusinesses: importedBusinesses
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        totalRows: 0,
        validRows: 0,
        importedCount: 0,
        errors: []
      };
    }
  }

  generateSampleCSV() {
    const sampleData = [
      {
        name: 'Acme Corp',
        category: 'Software Development',
        location: 'New York, NY',
        website_url: 'https://acme.com',
        listing_url: 'https://directory.com/acme',
        contact_email: 'info@acme.com',
        description: 'Leading technology solutions provider'
      },
      {
        name: 'Best Bakery',
        category: 'Bakeries',
        location: 'Los Angeles, CA',
        website_url: 'https://bestbakery.com',
        listing_url: '',
        contact_email: 'hello@bestbakery.com',
        description: 'Freshly baked goods daily'
      },
      {
        name: 'Green Landscaping',
        category: 'Landscaping',
        location: 'Chicago, IL',
        website_url: 'https://greenlandscaping.com',
        listing_url: '',
        contact_email: 'contact@greenlandscaping.com',
        description: 'Professional landscaping and garden design services'
      }
    ];

    const csv = Papa.unparse(sampleData);
    return csv;
  }
}

export const csvImporter = new CSVImporter();