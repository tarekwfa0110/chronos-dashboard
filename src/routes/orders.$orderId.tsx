import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { 
  ArrowLeft,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  ShoppingCart,
  DollarSign,
  User,
  Package,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  AlertCircle,
  FileText
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Order, OrderItem, User as Customer, Address } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export const Route = createFileRoute('/orders/$orderId')({
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Fetch order details with all related data
  const { data: order, isLoading, error } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async (): Promise<Order> => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          user:profiles(full_name, email, phone, avatar_url),
          items:order_items(
            *,
            product:products(*)
          ),
          shipping_address:addresses!orders_shipping_address_id_fkey(*),
          billing_address:addresses!orders_billing_address_id_fkey(*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status, notes }: { status: string; notes?: string }) => {
      setUpdatingStatus(true);
      const updateData: any = { status };
      if (notes !== undefined) updateData.notes = notes;
      
      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setUpdatingStatus(false);
      setIsEditingNotes(false);
    },
    onError: (error) => {
      console.error('Failed to update order:', error);
      setUpdatingStatus(false);
      alert(`Failed to update order: ${error.message}`);
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'processing': return <Truck className="h-4 w-4" />;
      case 'shipped': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

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

  const handleStatusUpdate = (newStatus: string) => {
    updateStatusMutation.mutate({ 
      status: newStatus, 
      notes: isEditingNotes ? notes : order?.notes 
    });
  };

  const handleNotesSave = () => {
    updateStatusMutation.mutate({ 
      status: order?.status || 'pending', 
      notes 
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="ml-2 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-medium text-red-800">Error loading order</h3>
            </div>
            <p className="mt-1 text-sm text-red-700">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900">Order not found</h3>
              <p className="text-sm text-gray-500">The order you're looking for doesn't exist.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate({ to: '/orders' })}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order #{order.order_number}</h1>
            <p className="text-gray-600 mt-1">
              {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(order.status)}
          {getStatusBadge(order.status)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items ({order.items?.length || 0})
              </CardTitle>
              <CardDescription>Products in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.product?.image_url && (
                            <img
                              src={item.product.image_url}
                              alt={item.product_name}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            {item.product?.category && (
                              <div className="text-sm text-gray-500">{item.product.category}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${item.product_price.toFixed(2)}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.total_price.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>${order.shipping.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Update order status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select 
                value={order.status} 
                onValueChange={handleStatusUpdate}
                disabled={updatingStatus}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              {updatingStatus && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Updating status...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                {order.user?.avatar_url ? (
                  <img
                    src={order.user.avatar_url}
                    alt={order.user.full_name || 'Customer'}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                )}
                <div>
                  <div className="font-medium">{order.user?.full_name || 'Unknown Customer'}</div>
                  <div className="text-sm text-gray-500">{order.user?.email}</div>
                </div>
              </div>
              
              {order.user?.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{order.user.phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          {order.shipping_address && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-medium">{order.shipping_address.full_name}</div>
                <div>{order.shipping_address.address_line1}</div>
                {order.shipping_address.address_line2 && (
                  <div>{order.shipping_address.address_line2}</div>
                )}
                <div>
                  {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
                </div>
                <div>{order.shipping_address.country}</div>
                {order.shipping_address.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{order.shipping_address.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Billing Address */}
          {order.billing_address && order.billing_address.id !== order.shipping_address?.id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Billing Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-medium">{order.billing_address.full_name}</div>
                <div>{order.billing_address.address_line1}</div>
                {order.billing_address.address_line2 && (
                  <div>{order.billing_address.address_line2}</div>
                )}
                <div>
                  {order.billing_address.city}, {order.billing_address.state} {order.billing_address.postal_code}
                </div>
                <div>{order.billing_address.country}</div>
                {order.billing_address.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{order.billing_address.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Order Notes</CardTitle>
              <CardDescription>Internal notes about this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingNotes ? (
                <div className="space-y-2">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this order..."
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleNotesSave} disabled={updatingStatus}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditingNotes(false);
                        setNotes(order.notes || '');
                      }}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 min-h-[4rem]">
                    {order.notes || 'No notes added yet.'}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsEditingNotes(true);
                      setNotes(order.notes || '');
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {order.notes ? 'Edit Notes' : 'Add Notes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
