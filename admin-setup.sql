-- Admin Setup for Chronos Dashboard
-- Run this in your Supabase SQL Editor to set up admin access

-- ========================================
-- 1. Ensure profiles table has role column
-- ========================================

-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Add check constraint for role values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'admin', 'super_admin'));

-- ========================================
-- 2. Promote a user to admin by email
-- ========================================

-- Replace 'your-email@example.com' with the actual email of the user you want to make admin
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users 
  WHERE email = 'your-email@example.com'
);

-- ========================================
-- 3. Verify the admin user was created
-- ========================================

-- Check if the user was successfully promoted
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'your-email@example.com';

-- ========================================
-- 4. List all admin users
-- ========================================

-- Show all users with admin or super_admin roles
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;
