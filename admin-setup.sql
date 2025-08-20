-- Admin Dashboard Setup Script
-- Run this in your Supabase SQL editor to set up admin users

-- First, create a user through Supabase Auth (you'll need to do this manually in the Supabase dashboard)
-- Then, update their profile to have admin role

-- Example: Update a user to have admin role
-- Replace 'user-uuid-here' with the actual user ID from Supabase Auth
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-here';

-- Or create a new admin user profile (after creating the auth user)
-- INSERT INTO user_profiles (id, full_name, email, role, created_at, updated_at)
-- VALUES (
--   'user-uuid-here',
--   'Admin User',
--   'admin@example.com',
--   'admin',
--   NOW(),
--   NOW()
-- );

-- Check existing users and their roles
SELECT 
  u.id,
  u.email,
  up.full_name,
  up.role,
  u.created_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
ORDER BY u.created_at DESC;

-- Grant admin role to existing user (replace with actual email)
-- UPDATE user_profiles 
-- SET role = 'admin' 
-- WHERE id = (
--   SELECT id FROM auth.users 
--   WHERE email = 'admin@yourdomain.com'
-- );
