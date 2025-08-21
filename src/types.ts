export interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string;
  category?: string;
  description?: string;
  details?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'super_admin';
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address_id?: string;
  billing_address_id?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  total_price: number;
  created_at: string;
  product?: Product;
}

export interface Address {
  id: string;
  user_id: string;
  type: 'shipping' | 'billing' | 'both';
  is_default: boolean;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: Order[];
  topProducts: Product[];
  monthlyRevenue: { month: string; revenue: number }[];
}

export interface AdminUser {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

