import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://fqrnixmoswlqampfehgj.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxcm5peG1vc3dscWFtcGZlaGdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjM1NDEsImV4cCI6MjA2NzU5OTU0MX0.3jctmqAYQZ1VaanGUgOzfcHWZOzn3kaCv5PMv1yrm7A'

if(SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>'){
  throw new Error('Missing Supabase variables');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase

// Test the connection
supabase.from('businesses').select('count', { count: 'exact' }).then(({ data, error }) => {
  if (error) {
    console.error('Supabase connection error:', error);
  } else {
    console.log('Supabase connected successfully');
  }
});