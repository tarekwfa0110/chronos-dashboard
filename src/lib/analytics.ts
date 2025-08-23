import { supabase } from './supabase';

export interface AnalyticsData {
  orders: any[];
  products: any[];
  customers: any[];
}

export interface ChartData {
  dailyRevenueData: any[];
  pieData: any[];
  topProducts: any[];
  monthlyData: any[];
  summary: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
  };
}

export async function fetchAnalyticsData(timeRange: string): Promise<AnalyticsData> {
  const days = parseInt(timeRange);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch orders with date filtering
  const { data: orders } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true });

  // Fetch products
  const { data: products } = await supabase
    .from('products')
    .select('*');

  // Fetch customers
  const { data: customers } = await supabase
    .from('profiles')
    .select('*');

  return { 
    orders: orders || [], 
    products: products || [], 
    customers: customers || [] 
  };
}

export function processChartData(analyticsData: AnalyticsData): ChartData {
  const { orders, products, customers } = analyticsData;

  // Daily revenue data
  const dailyRevenue = orders.reduce((acc: any, order) => {
    const date = new Date(order.created_at).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, revenue: 0, orders: 0 };
    }
    acc[date].revenue += order.total || 0;
    acc[date].orders += 1;
    return acc;
  }, {});

  const dailyRevenueData = Object.values(dailyRevenue).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Order status distribution
  const statusData = orders.reduce((acc: any, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  // Calculate real product performance
  const productPerformance = products.map(product => {
    const productOrders = orders.filter(order => 
      order.items?.some((item: any) => item.product_id === product.id)
    );
    
    const totalSold = productOrders.reduce((sum, order) => {
      const item = order.items?.find((item: any) => item.product_id === product.id);
      return sum + (item?.quantity || 0);
    }, 0);

    const revenue = productOrders.reduce((sum, order) => {
      const item = order.items?.find((item: any) => item.product_id === product.id);
      return sum + (item?.total_price || 0);
    }, 0);

    return {
      id: product.id,
      name: product.name,
      revenue,
      sales: totalSold,
      price: product.price,
    };
  });

  const topProducts = productPerformance
    .filter(p => p.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Generate monthly trends (mock data for now, can be enhanced with real historical data)
  const monthlyData = [
    { month: 'Jan', revenue: 12000, orders: 45, customers: 32 },
    { month: 'Feb', revenue: 15000, orders: 52, customers: 38 },
    { month: 'Mar', revenue: 18000, orders: 61, customers: 45 },
    { month: 'Apr', revenue: 14000, orders: 48, customers: 35 },
    { month: 'May', revenue: 22000, orders: 78, customers: 52 },
    { month: 'Jun', revenue: 25000, orders: 85, customers: 58 },
  ];

  return {
    dailyRevenueData,
    pieData,
    topProducts,
    monthlyData,
    summary: {
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      totalOrders: orders.length,
      totalCustomers: customers.length,
      avgOrderValue: orders.length > 0 
        ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length 
        : 0,
    }
  };
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
}
