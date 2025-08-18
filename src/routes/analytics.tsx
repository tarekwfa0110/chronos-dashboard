import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package
} from 'lucide-react';
import { supabase } from '../lib/supabase';

export const Route = createFileRoute('/analytics')({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      // Fetch analytics data
      const [
        { data: orders },
        { data: products },
        { data: customers }
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('products').select('*'),
        supabase.from('user_profiles').select('*')
      ]);

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalProducts = products?.length || 0;
      const totalCustomers = customers?.length || 0;

      // Calculate monthly revenue
      const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthOrders = orders?.filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === month.getMonth() && 
                 orderDate.getFullYear() === month.getFullYear();
        }) || [];
        
        return {
          month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          revenue: monthOrders.reduce((sum, order) => sum + (order.total || 0), 0)
        };
      }).reverse();

      // Top selling products
      const productSales = products?.map(product => {
        const productOrders = orders?.filter(order => 
          order.items?.some(item => item.product_id === product.id)
        ) || [];
        const totalSold = productOrders.reduce((sum, order) => {
          const item = order.items?.find(item => item.product_id === product.id);
          return sum + (item?.quantity || 0);
        }, 0);
        
        return {
          ...product,
          totalSold,
          revenue: productOrders.reduce((sum, order) => {
            const item = order.items?.find(item => item.product_id === product.id);
            return sum + (item?.total_price || 0);
          }, 0)
        };
      }).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5) || [];

      return {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalCustomers,
        monthlyRevenue,
        productSales,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    changeType = 'up',
    description 
  }: {
    title: string;
    value: string | number;
    icon: any;
    change?: string;
    changeType?: 'up' | 'down';
    description?: string;
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
              {description && (
                <dd className="text-sm text-gray-500 mt-1">{description}</dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500">
          Detailed insights into your e-commerce performance
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${analytics?.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          change="12%"
          changeType="up"
          description="Lifetime revenue"
        />
        <StatCard
          title="Total Orders"
          value={analytics?.totalOrders}
          icon={ShoppingCart}
          change="8%"
          changeType="up"
          description="All time orders"
        />
        <StatCard
          title="Total Products"
          value={analytics?.totalProducts}
          icon={Package}
          change="3%"
          changeType="up"
          description="Active products"
        />
        <StatCard
          title="Total Customers"
          value={analytics?.totalCustomers}
          icon={Users}
          change="15%"
          changeType="up"
          description="Registered users"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Monthly Revenue</h2>
        </div>
        <div className="p-6">
          <div className="flex items-end space-x-2 h-64">
            {analytics?.monthlyRevenue.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ 
                    height: `${Math.max((item.revenue / Math.max(...analytics.monthlyRevenue.map(m => m.revenue))) * 200, 10)}px` 
                  }}
                />
                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                <span className="text-xs text-gray-700 font-medium">
                  ${item.revenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Top Selling Products</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {analytics?.productSales.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">${product.price}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{product.totalSold} sold</p>
                  <p className="text-sm text-gray-500">${product.revenue.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Average Order Value</span>
              <span className="text-sm font-medium text-gray-900">
                ${analytics?.averageOrderValue.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium text-gray-900">2.4%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Customer Lifetime Value</span>
              <span className="text-sm font-medium text-gray-900">$1,250</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
              <span className="text-gray-600">New order #ORD-20241201-0001</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
              <span className="text-gray-600">Product "Wireless Headphones" updated</span>
            </div>
            <div className="flex items-center text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></div>
              <span className="text-gray-600">New customer registration</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
