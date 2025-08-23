import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  Search, 
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  Eye,
  Users,
  DollarSign,
  TrendingUp
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User as Customer } from '../types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
});

function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const { data: customerStats } = useQuery({
    queryKey: ['customer-stats'],
    queryFn: async () => {
      const { data: orders } = await supabase
        .from('orders')
        .select('user_id, total');

      const stats: Record<string, { orderCount: number; totalSpent: number }> = {};
      
      orders?.forEach(order => {
        if (!stats[order.user_id]) {
          stats[order.user_id] = { orderCount: 0, totalSpent: 0 };
        }
        stats[order.user_id].orderCount += 1;
        stats[order.user_id].totalSpent += order.total || 0;
      });

      return stats;
    }
  });

  const filteredCustomers = customers?.filter(customer => {
    return customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate customer statistics
  const customerStatsData = {
    total: customers?.length || 0,
    active: customers?.filter(c => customerStats?.[c.id]?.orderCount > 0).length || 0,
    totalRevenue: Object.values(customerStats || {}).reduce((sum, stat) => sum + stat.totalSpent, 0),
    avgOrderValue: Object.values(customerStats || {}).length > 0 
      ? Object.values(customerStats || {}).reduce((sum, stat) => sum + stat.totalSpent, 0) / Object.values(customerStats || {}).length
      : 0,
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-red-800">Error loading customers</h3>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">View and manage customer profiles</p>
      </div>

      {/* Customer Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStatsData.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStatsData.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStatsData.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStatsData.avgOrderValue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2 text-gray-600">Loading customers...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers?.map((customer) => {
            const stats = customerStats?.[customer.id];
            return (
              <Card key={customer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {customer.avatar_url ? (
                        <img
                          className="h-12 w-12 rounded-full object-cover"
                          src={customer.avatar_url}
                          alt={customer.full_name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {customer.full_name || 'Unknown Customer'}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(customer.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {customer.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        <span className="truncate">{customer.email}</span>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        <span>{customer.phone}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        <span>Orders: {stats?.orderCount || 0}</span>
                      </div>
                      <div className="text-gray-900 font-medium">
                        ${stats?.totalSpent?.toFixed(2) || '0.00'}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-200">
                      <Button variant="outline" className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {!isLoading && filteredCustomers?.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900">No customers found</h3>
              <p className="text-sm text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search criteria.'
                  : 'No customers have registered yet.'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

