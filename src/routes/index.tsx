import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  Plus
} from 'lucide-react';
import { Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: DashboardPage,
});

function DashboardPage() {
  // Fetch dashboard data
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [products, orders, customers] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('profiles').select('*'),
      ]);

      const totalRevenue = orders.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const activeProducts = products.data?.filter(p => p.is_active).length || 0;
      const pendingOrders = orders.data?.filter(o => o.status === 'pending').length || 0;

      return {
        totalProducts: products.data?.length || 0,
        activeProducts,
        totalOrders: orders.data?.length || 0,
        pendingOrders,
        totalCustomers: customers.data?.length || 0,
        totalRevenue,
      };
    },
  });

  // Fetch recent products
  const { data: recentProducts } = useQuery({
    queryKey: ['recent-products'],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  // Fetch recent orders
  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      description: `${stats?.activeProducts || 0} active`,
      icon: Package,
      trend: 'up',
      trendValue: '+12%',
      href: '/products',
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      description: `${stats?.pendingOrders || 0} pending`,
      icon: ShoppingCart,
      trend: 'up',
      trendValue: '+8%',
      href: '/orders',
    },
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      description: 'Registered users',
      icon: Users,
      trend: 'up',
      trendValue: '+15%',
      href: '/customers',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats?.totalRevenue || 0).toLocaleString()}`,
      description: 'All time',
      icon: DollarSign,
      trend: 'up',
      trendValue: '+23%',
      href: '/analytics',
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      processing: 'default',
      shipped: 'default',
      delivered: 'default',
      cancelled: 'destructive',
    } as const;
    
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to your Chronos admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
              <div className="flex items-center mt-2">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className="text-xs text-muted-foreground">{stat.trendValue}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Recent Products
                </CardTitle>
                <CardDescription>Latest products added to your catalog</CardDescription>
              </div>
              <Button asChild size="sm">
                <Link to="/products">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts?.map((product) => (
                <div key={product.id} className="flex items-center space-x-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${product.price.toFixed(2)} • {product.stock_quantity} in stock
                    </p>
                  </div>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              ))}
              {(!recentProducts || recentProducts.length === 0) && (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products yet</p>
                  <Button asChild size="sm" className="mt-2">
                    <Link to="/products">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Product
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Recent Orders
                </CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link to="/orders">
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders?.map((order) => (
                <div key={order.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.order_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      ${order.total.toFixed(2)} • {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No orders yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks to get you started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild className="h-auto p-4 flex flex-col items-start">
              <Link to="/products">
                <Package className="w-6 h-6 mb-2" />
                <span className="font-medium">Add Product</span>
                <span className="text-sm text-muted-foreground">Create a new product listing</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Link to="/orders">
                <ShoppingCart className="w-6 h-6 mb-2" />
                <span className="font-medium">View Orders</span>
                <span className="text-sm text-muted-foreground">Check recent customer orders</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
              <Link to="/analytics">
                <TrendingUp className="w-6 h-6 mb-2" />
                <span className="font-medium">Analytics</span>
                <span className="text-sm text-muted-foreground">View sales and performance data</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
