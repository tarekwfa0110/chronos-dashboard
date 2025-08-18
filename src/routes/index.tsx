import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp,
  TrendingDown,
  Eye,
  Clock
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DashboardStats, Order, Product } from '../types';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      // Fetch dashboard statistics
      const [
        { count: totalOrders },
        { count: totalProducts },
        { count: totalCustomers },
        { data: orders },
        { data: products }
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }),
        supabase.from('products').select('*', { count: 'exact', head: true }),
        supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select(`
          *,
          user:user_profiles(full_name),
          items:order_items(*)
        `).order('created_at', { ascending: false }).limit(5),
        supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5)
      ]);

      // Calculate total revenue
      const { data: allOrders } = await supabase
        .from('orders')
        .select('total')
        .not('status', 'eq', 'cancelled');

      const totalRevenue = allOrders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;

      // Generate mock monthly revenue data
      const monthlyRevenue = [
        { month: 'Jan', revenue: 12000 },
        { month: 'Feb', revenue: 15000 },
        { month: 'Mar', revenue: 18000 },
        { month: 'Apr', revenue: 14000 },
        { month: 'May', revenue: 22000 },
        { month: 'Jun', revenue: 25000 },
      ];

      return {
        totalOrders: totalOrders || 0,
        totalRevenue,
        totalProducts: totalProducts || 0,
        totalCustomers: totalCustomers || 0,
        recentOrders: orders || [],
        topProducts: products || [],
        monthlyRevenue
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType = 'up' 
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: string;
    changeType?: 'up' | 'down';
  }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <Icon className="h-6 w-6 text-gray-400" />
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
                {change && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {changeType === 'up' ? (
                      <TrendingUp className="self-center flex-shrink-0 h-4 w-4" />
                    ) : (
                      <TrendingDown className="self-center flex-shrink-0 h-4 w-4" />
                    )}
                    <span className="sr-only">{changeType === 'up' ? 'Increased' : 'Decreased'} by</span>
                    {change}
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const RecentOrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">#{order.order_number}</h3>
          <p className="text-sm text-gray-500">{order.user?.full_name || 'Unknown Customer'}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-gray-900">${order.total}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            order.status === 'delivered' ? 'bg-green-100 text-green-800' :
            order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
            order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome to your Chronos e-commerce admin dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${stats?.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="12%"
          changeType="up"
        />
        <StatCard
          title="Total Orders"
          value={stats?.totalOrders}
          icon={ShoppingCart}
          change="8%"
          changeType="up"
        />
        <StatCard
          title="Total Products"
          value={stats?.totalProducts}
          icon={Package}
          change="3%"
          changeType="up"
        />
        <StatCard
          title="Total Customers"
          value={stats?.totalCustomers}
          icon={Users}
          change="15%"
          changeType="up"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
          </div>
          <div className="p-6 space-y-4">
            {stats?.recentOrders.map((order) => (
              <RecentOrderCard key={order.id} order={order} />
            ))}
            {stats?.recentOrders.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent orders</p>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Products</h2>
          </div>
          <div className="p-6 space-y-4">
            {stats?.topProducts.map((product) => (
              <div key={product.id} className="flex items-center space-x-4">
                {product.image_url && (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    ${product.price}
                  </p>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>View</span>
                </div>
              </div>
            ))}
            {stats?.topProducts.length === 0 && (
              <p className="text-gray-500 text-center py-4">No products available</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Monthly Revenue</h2>
        </div>
        <div className="p-6">
          <div className="flex items-end space-x-2 h-64">
            {stats?.monthlyRevenue.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(item.revenue / 25000) * 200}px` }}
                />
                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
