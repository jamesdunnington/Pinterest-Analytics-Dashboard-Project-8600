import { createClient } from '@supabase/supabase-js'

// Get environment variables from Vite
const SUPABASE_URL = 'https://iglmoellgwcvvxtzupel.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlnbG1vZWxsZ3djdnZ4dHp1cGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNjk5NzksImV4cCI6MjA2Nzc0NTk3OX0.N4jK4ilXjS2Q7-AIhx1IRFYli_XFYSAw1NEAxF5eVCc'

// Create and export Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

export default supabase