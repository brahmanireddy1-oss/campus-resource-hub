import { createClient } from '@supabase/supabase-js'

// Wired up fully in the Authentication milestone.
// For now this just reads env vars so the project builds cleanly.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null
