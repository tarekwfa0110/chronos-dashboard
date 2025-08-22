-- Database Setup for Chronos Admin Dashboard
-- This script ensures the dashboard works with the main Chronos app database
-- Run this in your Supabase SQL Editor to verify/update the database structure

-- ========================================
-- 1. Verify products table structure
-- ========================================

-- The products table should already exist from the main app setup
-- This is just to verify the structure matches what the dashboard expects

-- ========================================
-- 2. Verify profiles table structure
-- ========================================

-- The profiles table should already exist from the main app setup
-- This ensures admin users can be created

-- ========================================
-- 3. Verify orders table structure
-- ========================================

-- The orders table should already exist from the main app setup

-- ========================================
-- 4. Verify order_items table structure
-- ========================================

-- The order_items table should already exist from the main app setup

-- ========================================
-- 5. Verify addresses table structure
-- ========================================

-- The addresses table should already exist from the main app setup

-- ========================================
-- 6. Verify wishlist table structure
-- ========================================

-- The wishlist table should already exist from the main app setup

-- ========================================
-- 7. Check if all required tables exist
-- ========================================

SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('products', 'profiles', 'wishlist', 'addresses', 'orders', 'order_items') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('products', 'profiles', 'wishlist', 'addresses', 'orders', 'order_items');

-- ========================================
-- 8. Check products table structure
-- ========================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products'
ORDER BY ordinal_position;

-- ========================================
-- 9. Check profiles table structure
-- ========================================

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ========================================
-- 10. Insert sample products (if table is empty)
-- ========================================

-- Only insert if no products exist
INSERT INTO products (name, price, description, category, brand, image_url, stock_quantity, is_active) 
SELECT * FROM (VALUES 
  ('Luxury Chronograph Watch', 1299.99, 'Premium chronograph watch with leather strap', 'Luxury Watches', 'Rolex', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 10, true),
  ('Smart Fitness Watch', 299.99, 'Advanced fitness tracking with heart rate monitor', 'Smartwatches', 'Apple', 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400', 25, true),
  ('Classic Dress Watch', 599.99, 'Elegant dress watch for formal occasions', 'Dress Watches', 'Omega', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400', 15, true),
  ('Sports Watch', 199.99, 'Durable sports watch with water resistance', 'Sports Watches', 'Casio', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400', 30, true),
  ('Casual Watch', 89.99, 'Comfortable casual watch for everyday wear', 'Casual Watches', 'Fossil', 'https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=400', 50, true)
) AS v(name, price, description, category, brand, image_url, stock_quantity, is_active)
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

-- ========================================
-- 11. Verify admin user setup
-- ========================================

-- Check if any admin users exist
SELECT 
  u.email,
  p.full_name,
  p.role,
  p.created_at
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;
