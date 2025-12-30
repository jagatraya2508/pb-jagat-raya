import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
export const isSupabaseConfigured = supabaseUrl && supabaseAnonKey &&
    supabaseUrl !== 'your_supabase_url_here' &&
    supabaseAnonKey !== 'your_supabase_anon_key_here'

// Create a mock client if not configured to prevent errors
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

// Helper to check if supabase is available
export const checkSupabase = () => {
    if (!isSupabaseConfigured) {
        console.warn('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file')
        return false
    }
    return true
}
