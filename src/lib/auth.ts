import { supabase } from './supabase';
import { User } from '@supabase/supabase-js';

export interface AdminUser {
  id: string;
  email: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

// Check if user is authenticated
export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Check if user is admin
export const isAdmin = async (): Promise<boolean> => {
  const user = await getCurrentUser();
  if (!user) return false;
  
  // Check if user has admin role in user_profiles table
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  return profile?.role === 'admin' || profile?.role === 'super_admin';
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  
  // Verify admin role
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    await signOut();
    throw new Error('Access denied. Admin privileges required.');
  }
  
  return data;
};

// Sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get admin user profile
export const getAdminProfile = async (): Promise<AdminUser | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
    return null;
  }
  
  return {
    id: profile.id,
    email: user.email || '',
    role: profile.role,
    created_at: profile.created_at,
  };
};
