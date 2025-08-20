import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin-specific functions
export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
});

// Helper function to check if user is admin
export const isAdmin = async () => {
  const { data: { user } } = await adminSupabase.auth.getUser();
  if (!user) return false;
  
  // You can add admin role checking logic here
  // For now, we'll assume any authenticated user is admin
  return true;
};

