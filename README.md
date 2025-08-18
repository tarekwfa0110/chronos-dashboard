# Chronos Admin Dashboard

A starting point for the Chronos e-commerce admin dashboard, built with React, TanStack Router, and Supabase.

## Current Status

This is a **basic foundation** for the admin dashboard with the following implemented:

### ✅ Completed Features
- **Basic Layout** - Responsive sidebar navigation with mobile support
- **Dashboard Overview** - Placeholder stats and charts structure
- **Products Page** - Basic product listing with search and filtering
- **Orders Page** - Order listing with status management
- **Customers Page** - Customer profile cards with basic info
- **Analytics Page** - Placeholder charts and metrics
- **Settings Page** - Basic settings UI structure
- **Supabase Integration** - Database connection and basic queries

### 🚧 What's Left to Implement

#### High Priority
- **Authentication System** - Login/logout, route protection, admin user management
- **Product CRUD** - Add, edit, delete products with forms
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
- **Database**: Supabase
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
   Add your Supabase URL and anon key to `.env.local`

3. **Run the development server**:
   ```bash
   npm run dev
   ```

## Database Setup

This dashboard connects to the same Supabase database as the main e-commerce app. Make sure you have the following tables set up:

- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `user_profiles` - Customer profiles
- `addresses` - Customer addresses

## Project Structure

```
src/
├── components/
│   └── layout/
│       └── AdminLayout.tsx    # Main layout with sidebar
├── lib/
│   └── supabase.ts           # Supabase client configuration
├── routes/
│   ├── index.tsx             # Dashboard overview (placeholder)
│   ├── products.tsx          # Products listing (basic)
│   ├── orders.tsx            # Orders listing (basic)
│   ├── customers.tsx         # Customers listing (basic)
│   ├── analytics.tsx         # Analytics (placeholder)
│   └── settings.tsx          # Settings (placeholder)
└── types.ts                  # TypeScript interfaces
```

## Next Steps

1. **Implement Authentication** - Add login system and protect routes
2. **Build Product Forms** - Create add/edit product functionality
3. **Enhance Order Management** - Add order details and status updates
4. **Connect Real Data** - Replace placeholder data with actual database queries
5. **Add Error Handling** - Implement proper loading and error states

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run format` - Format code

## License

MIT
