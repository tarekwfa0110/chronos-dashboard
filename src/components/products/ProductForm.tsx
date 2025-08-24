import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ImageUpload } from '@/components/ui/image-upload';
import { 
  Package, 
  DollarSign, 
  Hash, 
  Tag, 
  Building, 
  ImageIcon, 
  FileText, 
  Eye, 
  EyeOff 
} from 'lucide-react';

// Form validation schema
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.string().min(1, 'Price is required'),
  stock_quantity: z.string().min(1, 'Stock quantity is required'),
  category: z.string().optional(),
  brand: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (product: any) => void;
  product?: any;
  isLoading?: boolean;
}

const categories = [
  'Luxury Watches',
  'Smartwatches', 
  'Dress Watches',
  'Sports Watches',
  'Casual Watches',
  'Vintage Watches',
  'Diving Watches',
  'Pilot Watches'
];

const brands = [
  'Rolex',
  'Omega',
  'Cartier',
  'Patek Philippe',
  'Audemars Piguet',
  'Tag Heuer',
  'Seiko',
  'Casio',
  'Apple',
  'Samsung',
  'Garmin',
  'Fossil'
];

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  product,
  isLoading = false
}) => {
  const [images, setImages] = useState<string[]>([]);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      price: '',
      stock_quantity: '',
      category: undefined,
      brand: undefined,
      image_url: '',
      description: '',
      is_active: true,
    },
  });

  // Update form when product changes
  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name || '',
        price: product.price?.toString() || '',
        stock_quantity: product.stock_quantity?.toString() || '',
        category: product.category || undefined,
        brand: product.brand || undefined,
        image_url: product.image_url || '',
        description: product.description || '',
        is_active: product.is_active ?? true,
      });
      // Set images from product
      if (product.image_url) {
        setImages([product.image_url]);
      } else {
        setImages([]);
      }
    } else {
      form.reset({
        name: '',
        price: '',
        stock_quantity: '',
        category: undefined,
        brand: undefined,
        image_url: '',
        description: '',
        is_active: true,
      });
      setImages([]);
    }
  }, [product, form]);

  // Update form image_url when images change
  useEffect(() => {
    if (images.length > 0) {
      form.setValue('image_url', images[0]);
    } else {
      form.setValue('image_url', '');
    }
  }, [images, form]);

  const handleSubmit = (data: ProductFormData) => {
    // Transform string values to numbers for the API
    const transformedData = {
      ...data,
      price: parseFloat(data.price),
      stock_quantity: parseInt(data.stock_quantity),
      category: data.category || null,
      brand: data.brand || null,
    };
    onSubmit(transformedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Update your product information' : 'Fill in the details to create a new product'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Basic Information
              </CardTitle>
              <CardDescription>Product details and pricing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="Enter product name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register('price')}
                    placeholder="0.00"
                  />
                  {form.formState.errors.price && (
                    <p className="text-sm text-red-500">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity *</Label>
                  <Input
                    id="stock_quantity"
                    type="number"
                    min="0"
                    {...form.register('stock_quantity')}
                    placeholder="0"
                  />
                  {form.formState.errors.stock_quantity && (
                    <p className="text-sm text-red-500">{form.formState.errors.stock_quantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Select onValueChange={(value) => form.setValue('brand', value)} value={form.watch('brand') || ''}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select onValueChange={(value) => form.setValue('category', value)} value={form.watch('category') || ''}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Image Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Product Images
              </CardTitle>
              <CardDescription>Upload product images (drag & drop or click to select)</CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onImagesChange={setImages}
                maxImages={5}
                maxSize={5}
                disabled={isLoading}
              />
            </CardContent>
          </Card>

          {/* Description Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Product Description
              </CardTitle>
              <CardDescription>Describe your product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Enter product description..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Product Status
              </CardTitle>
              <CardDescription>Control product visibility</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_active">Active Product</Label>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('is_active') 
                      ? 'This product will be visible to customers' 
                      : 'This product will be hidden from customers'
                    }
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={form.watch('is_active')}
                  onCheckedChange={(checked) => form.setValue('is_active', checked)}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                product ? 'Update Product' : 'Add Product'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
