// This file contains SQL procedures that would be created on the Supabase database
// In a real application, these would be run directly on the database

export const createPendingBusinessesTable = `
CREATE OR REPLACE FUNCTION create_pending_businesses_table()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Create pending_businesses table if it doesn't exist
  CREATE TABLE IF NOT EXISTS pending_businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    website_url TEXT,
    contact_email TEXT,
    description TEXT,
    submitter_email TEXT NOT NULL,
    verification_token TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Enable RLS
  ALTER TABLE IF EXISTS pending_businesses ENABLE ROW LEVEL SECURITY;
  
  -- Create policy for access
  CREATE POLICY IF NOT EXISTS "Allow all operations on pending_businesses" 
    ON pending_businesses FOR ALL USING (true);
    
  -- Create index for faster queries
  CREATE INDEX IF NOT EXISTS idx_pending_businesses_status 
    ON pending_businesses(status);
  
  -- Create index for email verification
  CREATE INDEX IF NOT EXISTS idx_pending_businesses_token 
    ON pending_businesses(verification_token);
END;
$$;
`;

export const verifyBusinessSubmission = `
CREATE OR REPLACE FUNCTION verify_business_submission(token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  submission_exists BOOLEAN;
BEGIN
  -- Check if a pending submission exists with this token
  SELECT EXISTS(
    SELECT 1 
    FROM pending_businesses 
    WHERE verification_token = token 
    AND status = 'pending'
  ) INTO submission_exists;
  
  -- If submission exists, update its status to 'verified'
  IF submission_exists THEN
    UPDATE pending_businesses
    SET status = 'verified'
    WHERE verification_token = token
    AND status = 'pending';
    
    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$;
`;

export const approveBusinessSubmission = `
CREATE OR REPLACE FUNCTION approve_business_submission(submission_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sub_record pending_businesses;
  new_business_id UUID;
BEGIN
  -- Get the submission record
  SELECT * INTO sub_record
  FROM pending_businesses
  WHERE id = submission_id
  AND (status = 'verified' OR status = 'pending');
  
  -- If submission doesn't exist or isn't in the right status, return false
  IF sub_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Insert into businesses table
  INSERT INTO businesses (
    name,
    category,
    location,
    website_url,
    contact_email,
    description,
    is_active
  ) VALUES (
    sub_record.name,
    sub_record.category,
    sub_record.location,
    sub_record.website_url,
    sub_record.contact_email,
    sub_record.description,
    TRUE
  ) RETURNING id INTO new_business_id;
  
  -- Update submission status
  UPDATE pending_businesses
  SET status = 'approved'
  WHERE id = submission_id;
  
  RETURN TRUE;
END;
$$;
`;