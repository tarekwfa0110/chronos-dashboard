import { createFileRoute, useParams, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/customers/$id')({
  component: CustomerDetailsPage,
});

function CustomerDetailsPage() {
  const { id } = useParams({ from: '/customers/$id' });
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      {/* Simple Test Card - This should ALWAYS show */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium text-green-800 mb-2">✅ Customer Details Route is Working!</h3>
          <p className="text-sm text-green-700">This page is rendering correctly</p>
          <p className="text-xs text-green-600">Customer ID: {id}</p>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate({ to: '/customers' })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Customer Details</h1>
          <p className="text-gray-600 mt-1">Customer ID: {id}</p>
        </div>
      </div>

      {/* Simple Content */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is a simple customer details page.</p>
          <p>Customer ID: {id}</p>
          <p>We'll add more features here later.</p>
        </CardContent>
      </Card>
    </div>
  );
}
