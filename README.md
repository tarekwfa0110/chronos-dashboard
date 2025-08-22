# Chronos Admin Dashboard

A comprehensive admin dashboard for the Chronos e-commerce platform, built with React, TanStack Router, and Supabase.

## Current Status

This dashboard is now **fully integrated** with the main Chronos e-commerce app and includes:

### ✅ Completed Features
- **Authentication System** - Login/logout, route protection, admin user management
- **Product CRUD** - Add, edit, delete products with forms and validation
- **Database Integration** - Connected to the main Chronos app database
- **Basic Layout** - Responsive sidebar navigation with mobile support
- **Dashboard Overview** - Placeholder stats and charts structure
- **Products Page** - Full product management with search and filtering
- **Orders Page** - Order listing with status management
- **Customers Page** - Customer profile cards with basic info
- **Analytics Page** - Placeholder charts and metrics
- **Settings Page** - Basic settings UI structure
- **Supabase Integration** - Database connection and basic queries

### 🚧 What's Left to Implement

#### High Priority
- **Order Management** - Order details view, invoice generation
- **Real Data Integration** - Connect all pages to actual database data
- **Error Handling** - Proper error states and loading indicators

#### Medium Priority
- **Image Upload** - Product image management
- **Export Features** - CSV/PDF export for orders and reports
- **Customer Details** - Individual customer pages with order history
- **Real-time Updates** - Live notifications for new orders
- **Mobile Optimization** - Ensure all features work on mobile

#### Low Priority
- **Advanced Analytics** - Detailed charts and business insights
- **Bulk Operations** - Mass product/order updates
- **Email Notifications** - Automated order status emails
- **Advanced Search** - Filters, sorting, pagination
- **Testing** - Unit and integration tests

## Tech Stack

- **Frontend**: React 19, TypeScript, TanStack Router
- **Styling**: Tailwind CSS
- **Database**: Supabase (shared with main Chronos app)
- **State Management**: TanStack Query
- **Icons**: Lucide React

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   Add your Supabase URL and anon key to `.env.local` (same as main app)

3. **Run the development server**:
   ```bash
   npm run dev
   ```

## Database Integration

This dashboard connects to the **same Supabase database** as the main Chronos e-commerce app. The database structure includes:

- `products` - Product catalog (watches and accessories)
- `user_profiles` - Customer profiles with role-based access
- `orders` - Customer orders
- `order_items` - Order line items
- `addresses` - Customer addresses
- `wishlist` - Customer wishlist items

## Authentication Setup

1. **Create Admin User**: 
   - Go to your Supabase dashboard → Authentication → Users
   - Create a new user or use an existing one
   - Note the user's email

2. **Grant Admin Role**:
   - Run the SQL commands in `admin-setup.sql` in your Supabase SQL editor
   - Replace `'your-email@example.com'` with the actual user email
   - Set the role to `'admin'` or `'super_admin'`

3. **Test Login**:
   - Start the development server: `npm run dev`
   - Navigate to the dashboard
   - You should be redirected to the login page
   - Use the admin user's email and password to sign in

## Database Verification

Run the `database-setup.sql` script in your Supabase SQL editor to:
- Verify all required tables exist
- Check table structures match expectations
- Insert sample products if the table is empty
- Verify admin user setup

## Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── ProtectedRoute.tsx
│   ├── layout/
│   │   └── AdminLayout.tsx
│   ├── products/
│   │   └── ProductForm.tsx
│   └── ErrorBoundary.tsx
├── contexts/
│   └── AuthContext.tsx
├── lib/
│   ├── auth.ts
│   └── supabase.ts
├── routes/
│   ├── index.tsx
│   ├── products.tsx
│   ├── orders.tsx
│   ├── customers.tsx
│   ├── analytics.tsx
│   └── settings.tsx
└── types.ts
```

## Product Categories

The dashboard supports these watch categories:
- Watches
- Smartwatches
- Luxury Watches
- Sports Watches
- Casual Watches
- Dress Watches
- Accessories
- Straps
- Cases
- Tools

## Next Steps

1. **Enhance Order Management** - Add order details and status updates
2. **Connect Real Data** - Replace placeholder data with actual database queries
3. **Add Error Handling** - Implement proper loading and error states
4. **Add Image Upload** - Product image management
5. **Add Export Features** - CSV/PDF export for products and reports

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run format` - Format code

## Troubleshooting

### Common Issues:

1. **"Access denied" error on login**
   - Make sure the user has admin role in `user_profiles` table
   - Check that the role is set to 'admin' or 'super_admin'

2. **"Table does not exist" errors**
   - Run the main app's `supabase-setup.sql` script first
   - Then run the dashboard's `database-setup.sql` script

3. **Products not loading**
   - Verify the products table exists and has data
   - Check RLS policies allow admin access

## License

MIT
