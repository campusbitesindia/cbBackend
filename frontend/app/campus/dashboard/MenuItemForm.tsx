import React, { useState, useCallback, memo, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateImage, createImagePreview } from '@/services/imageService';
import { useToast } from '@/hooks/use-toast';
import { Upload, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface MenuItemFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  isVeg: boolean;
  available: boolean;
  image: string;
  portion: string;
  quantity: string;
}

interface MenuItemFormProps {
  formData: MenuItemFormData;
  setFormData: (data: MenuItemFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onImageUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = memo(({
  formData,
  setFormData,
  onSubmit,
  isEditing,
  onImageUpload,
}) => {
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Memoize category options to prevent recreation
  const categoryOptions = useMemo(() => [
    { value: 'appetizers', label: '🥗 Appetizers' },
    { value: 'main-course', label: '🍽️ Main Course' },
    { value: 'desserts', label: '🍰 Desserts' },
    { value: 'beverages', label: '🥤 Beverages' },
    { value: 'snacks', label: '🍿 Snacks' },
    { value: 'salads', label: '🥙 Salads' },
    { value: 'soups', label: '🍲 Soups' },
    { value: 'breads', label: '🍞 Breads' },
    { value: 'rice', label: '🍚 Rice' },
    { value: 'others', label: '📦 Others' },
  ], []);

  const portionOptions = useMemo(() => [
    { value: 'full', label: 'Full' },
    { value: 'half', label: 'Half' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'mini', label: 'Mini' },
    { value: 'large', label: 'Large' },
    { value: 'regular', label: 'Regular' },
  ], []);

  // Memoized callback functions
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, name: e.target.value });
  }, [formData, setFormData]);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, price: e.target.value });
  }, [formData, setFormData]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, description: e.target.value });
  }, [formData, setFormData]);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, quantity: e.target.value });
  }, [formData, setFormData]);

  const handleCategoryChange = useCallback((value: string) => {
    setFormData({ ...formData, category: value });
  }, [formData, setFormData]);

  const handlePortionChange = useCallback((value: string) => {
    setFormData({ ...formData, portion: value });
  }, [formData, setFormData]);

  const handleVegChange = useCallback((isVeg: boolean) => {
    setFormData({ ...formData, isVeg });
  }, [formData, setFormData]);

  const handleAvailabilityChange = useCallback((available: boolean) => {
    setFormData({ ...formData, available });
  }, [formData, setFormData]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      validateImage(file);
      const base64Data = await createImagePreview(file);
      
      setFormData({ ...formData, image: base64Data });
      setSelectedFile(file);
      
      onImageUpload?.(e);

      toast({
        title: 'Success',
        description: 'Image selected successfully!',
      });
    } catch (error) {
      console.error('File handling error:', error);
      setFormData({ ...formData, image: '' });
      setSelectedFile(null);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setImageUploading(false);
    }
  }, [formData, setFormData, onImageUpload, toast]);

  // Optimized styles - computed once
  const baseInputClass = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-black';
  const selectTriggerClass = 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white text-black';

  return (
    <div className='p-6'>
      <form onSubmit={onSubmit} className='space-y-8'>
        {/* Basic Information Section */}
        <div className='space-y-6'>
          <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
            Basic Information
          </h3>

          <div className='grid grid-cols-1 gap-6'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
                Item Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={handleNameChange}
                required
                placeholder='Enter item name'
                className={baseInputClass}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='price' className='text-sm font-medium text-gray-700'>
                Price <span className='text-red-500'>*</span>
              </Label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none'>
                  ₹
                </span>
                <Input
                  id='price'
                  type='number'
                  step='0.01'
                  value={formData.price}
                  onChange={handlePriceChange}
                  required
                  placeholder='0.00'
                  className={`${baseInputClass} pl-8`}
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description' className='text-sm font-medium text-gray-700'>
                Description
              </Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={handleDescriptionChange}
                placeholder='Describe your delicious menu item...'
                rows={4}
                className={`${baseInputClass} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Category and Serving Details */}
        <div className='space-y-6'>
          <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
            Category & Serving Details
          </h3>

          <div className='space-y-2'>
            <Label htmlFor='category' className='text-sm font-medium text-gray-700'>
              Category <span className='text-red-500'>*</span>
            </Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent className='bg-white text-black border border-gray-200 rounded-xl shadow-lg max-h-60'>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className='px-4 py-3 hover:bg-gray-50'>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='portion' className='text-sm font-medium text-gray-700'>
                Portion Size
              </Label>
              <Select value={formData.portion} onValueChange={handlePortionChange}>
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder='Select portion' />
                </SelectTrigger>
                <SelectContent className='bg-white text-black border border-gray-200 rounded-xl shadow-lg'>
                  {portionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className='px-4 py-2 hover:bg-gray-50'>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='quantity' className='text-sm font-medium text-gray-700'>
                Quantity <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='quantity'
                type='number'
                min='1'
                value={formData.quantity}
                onChange={handleQuantityChange}
                placeholder='e.g., 1, 2, 3'
                required
                className={baseInputClass}
              />
            </div>
          </div>

          <p className='text-sm text-gray-500 bg-blue-50 p-3 rounded-lg border border-blue-200'>
            💡 Select portion size and enter the number of servings per order
          </p>
        </div>

        {/* Image Upload Section */}
        <div className='space-y-6'>
          <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
            Item Image
          </h3>

          <div className='space-y-4'>
            <div className='relative'>
              <input
                type='file'
                accept='image/jpeg,image/jpg,image/png,image/webp'
                onChange={handleFileUpload}
                disabled={imageUploading}
                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                id='image-upload'
              />
              <label
                htmlFor='image-upload'
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-200 ${
                  imageUploading
                    ? 'border-blue-300 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
              >
                {imageUploading ? (
                  <div className='flex flex-col items-center'>
                    <Loader2 className='w-8 h-8 text-blue-600 animate-spin mb-2' />
                    <p className='text-sm text-blue-600 font-medium'>Processing image...</p>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <Upload className='w-8 h-8 text-gray-400 mb-2' />
                    <p className='text-sm text-gray-600 font-medium'>Click to upload image</p>
                    <p className='text-xs text-gray-500'>JPEG, PNG, WebP (Max 5MB)</p>
                  </div>
                )}
              </label>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                <div className='flex items-center gap-2 mb-3'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <p className='text-sm font-medium text-gray-700'>Image Preview</p>
                </div>
                <div className='flex items-center gap-4'>
                  <img
                    src={formData.image}
                    alt='Preview'
                    className='w-20 h-20 object-cover rounded-lg border-2 border-gray-200'
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className='flex-1'>
                    <p className='text-sm text-gray-600'>Image loaded successfully</p>
                    <p className='text-xs text-gray-500'>Ready to be saved with your menu item</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Food Type and Availability */}
        <div className='space-y-6'>
          <h3 className='text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2'>
            Food Type & Availability
          </h3>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Food Type */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium text-gray-700'>Food Type</Label>
              <div className='space-y-3'>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-colors duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='foodType'
                    checked={formData.isVeg}
                    onChange={() => handleVegChange(true)}
                    className='w-4 h-4 text-green-600 focus:ring-green-500'
                  />
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium text-gray-700'>Vegetarian</span>
                  </div>
                </label>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='foodType'
                    checked={!formData.isVeg}
                    onChange={() => handleVegChange(false)}
                    className='w-4 h-4 text-red-600 focus:ring-red-500'
                  />
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                    <span className='text-sm font-medium text-gray-700'>Non-Vegetarian</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Availability */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium text-gray-700'>Availability</Label>
              <div className='space-y-3'>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='availability'
                    checked={formData.available}
                    onChange={() => handleAvailabilityChange(true)}
                    className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                  />
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4 text-blue-600' />
                    <span className='text-sm font-medium text-gray-700'>Available</span>
                  </div>
                </label>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-colors duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='availability'
                    checked={!formData.available}
                    onChange={() => handleAvailabilityChange(false)}
                    className='w-4 h-4 text-gray-600 focus:ring-gray-500'
                  />
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4 text-gray-600' />
                    <span className='text-sm font-medium text-gray-700'>Not Available</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className='pt-6 border-t border-gray-200'>
          <Button
            type='submit'
            disabled={imageUploading}
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] py-3 rounded-xl font-semibold text-lg'
          >
            {imageUploading ? (
              <div className='flex items-center gap-2'>
                <Loader2 className='w-5 h-5 animate-spin' />
                Processing...
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                {isEditing ? (
                  <>
                    <CheckCircle className='w-5 h-5' />
                    Update Menu Item
                  </>
                ) : (
                  <>
                    <Camera className='w-5 h-5' />
                    Add Menu Item
                  </>
                )}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
});