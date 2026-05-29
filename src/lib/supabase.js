import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://efdbtfraszbdvwmngwxt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZGJ0ZnJhc3piZHZ3bW5nd3h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTc2NzAsImV4cCI6MjA5NDQzMzY3MH0.xk8lHuwDSBi4wt_FIQ2Z82a8mE_MlAFNyfqmlodkoSI'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
