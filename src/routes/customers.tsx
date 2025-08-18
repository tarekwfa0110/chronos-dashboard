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
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User as Customer } from '../types';

export const Route = createFileRoute('/customers')({
  component: CustomersPage,
});

function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      const { data, error } = await supabase
        .from('user_profiles')
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
           customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading customers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage customer profiles
        </p>
      </div>

      {/* Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers?.map((customer) => {
          const stats = customerStats?.[customer.id];
          return (
            <div key={customer.id} className="bg-white shadow rounded-lg p-6">
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
                  <button className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCustomers?.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No customers found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria.'
              : 'No customers have registered yet.'
            }
          </p>
        </div>
      )}
    </div>
  );
}
