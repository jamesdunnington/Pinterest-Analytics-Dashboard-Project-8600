import { createClient } from '@supabase/supabase-js';
import { BUSINESS_CATEGORIES } from './categories';

const supabaseUrl = 'https://fqrnixmoswlqampfehgj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxcm5peG1vc3dscWFtcGZlaGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjM1NDEsImV4cCI6MjA2NzU5OTU0MX0.3jctmqAYQZ1VaanGUgOzfcHWZOzn3kaCv5PMv1yrm7A';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database schema creation SQL with category constraints
export const SCHEMA_SQL = `
-- Enable RLS
ALTER TABLE IF EXISTS businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS crawl_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS crawl_logs ENABLE ROW LEVEL SECURITY;

-- Create businesses table with category constraint
CREATE TABLE IF NOT EXISTS businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (${BUSINESS_CATEGORIES.map(cat => `'${cat}'`).join(', ')})),
  location TEXT NOT NULL,
  website_url TEXT,
  listing_url TEXT,
  contact_email TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Create crawl_metadata table
CREATE TABLE IF NOT EXISTS crawl_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  url_hash TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  last_crawled TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  crawl_status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create crawl_logs table
CREATE TABLE IF NOT EXISTS crawl_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  crawl_type TEXT NOT NULL, -- 'scheduled', 'manual', 'batch'
  status TEXT NOT NULL, -- 'success', 'failed', 'pending'
  url TEXT,
  meta_title TEXT,
  meta_description TEXT,
  url_hash TEXT,
  error_message TEXT,
  crawl_duration INTEGER, -- in milliseconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_category ON businesses(category);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON businesses(location);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_search ON businesses USING gin(to_tsvector('english', name || ' ' || description));
CREATE INDEX IF NOT EXISTS idx_crawl_metadata_business ON crawl_metadata(business_id);
CREATE INDEX IF NOT EXISTS idx_crawl_metadata_status ON crawl_metadata(crawl_status);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_business ON crawl_logs(business_id);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_status ON crawl_logs(status);
CREATE INDEX IF NOT EXISTS idx_crawl_logs_created ON crawl_logs(created_at);

-- Create RLS policies (allow all for demo)
CREATE POLICY IF NOT EXISTS "Allow all operations on businesses" ON businesses FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on crawl_metadata" ON crawl_metadata FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on crawl_logs" ON crawl_logs FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crawl_metadata_updated_at ON crawl_metadata;
CREATE TRIGGER update_crawl_metadata_updated_at
  BEFORE UPDATE ON crawl_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// Sample data for testing with preset categories
export const SAMPLE_DATA = `
-- Insert sample businesses with preset categories
INSERT INTO businesses (name, category, location, website_url, description, is_active) VALUES
('Acme Technology', 'Software Development', 'New York', 'https://example.com/acme', 'Leading provider of innovative tech solutions', true),
('Green Gardens', 'Landscaping', 'Los Angeles', 'https://example.com/gardens', 'Professional landscaping and garden design', true),
('Blue Ocean Consulting', 'Consulting', 'Chicago', 'https://example.com/blueocean', 'Strategic business consulting for growth', true),
('Sunrise Bakery', 'Bakeries', 'San Francisco', 'https://example.com/sunrise', 'Artisan breads and pastries baked fresh daily', true),
('Metro Fitness', 'Fitness & Wellness', 'Boston', 'https://example.com/metrofitness', 'State-of-the-art fitness center with personal training', true),
('City Auto Repair', 'Auto Repair', 'Miami', 'https://example.com/cityauto', 'Quality automotive repair and maintenance services', true),
('Downtown Dental', 'Dental Care', 'Seattle', 'https://example.com/downtown-dental', 'Comprehensive dental care for the whole family', true),
('Bright Marketing', 'Marketing & Advertising', 'Austin', 'https://example.com/bright-marketing', 'Creative marketing solutions for modern businesses', true);
`;