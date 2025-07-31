import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  uploadImageViaProfile,
  validateImage,
  createImagePreview,
} from '@/services/imageService';
import { useToast } from '@/hooks/use-toast';
import {
  Upload,
  Camera,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';

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

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isEditing,
  onImageUpload,
}) => {
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);

      // Validate the image
      validateImage(file);

      // Create base64 data URL for preview and storage
      const base64Data = await createImagePreview(file);

      // Store the base64 data URL in form data
      setFormData({ ...formData, image: base64Data });

      // Store the original file for potential use
      setSelectedFile(file);

      // Call the parent's onImageUpload if provided
      if (onImageUpload) {
        onImageUpload(e);
      }

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
        description:
          error instanceof Error ? error.message : 'Failed to process image',
        variant: 'destructive',
      });
    } finally {
      setImageUploading(false);
    }
  };

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
              <Label
                htmlFor='name'
                className='text-sm font-medium text-gray-700'>
                Item Name <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='name'
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder='Enter item name'
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-black'
              />
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='price'
                className='text-sm font-medium text-gray-700'>
                Price <span className='text-red-500'>*</span>
              </Label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium'>
                  ₹
                </span>
                <Input
                  id='price'
                  type='number'
                  step='0.01'
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                  placeholder='0.00'
                  className='w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-black'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='description'
                className='text-sm font-medium text-gray-700'>
                Description
              </Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder='Describe your delicious menu item...'
                rows={4}
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none text-black'
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
            <Label
              htmlFor='category'
              className='text-sm font-medium text-gray-700'>
              Category <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }>
              <SelectTrigger className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-black'>
                <SelectValue placeholder='Select a category' />
              </SelectTrigger>
              <SelectContent className='bg-white border border-gray-200 rounded-xl shadow-lg'>
                <SelectItem
                  value='appetizers'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🥗 Appetizers
                </SelectItem>
                <SelectItem
                  value='main-course'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🍽️ Main Course
                </SelectItem>
                <SelectItem
                  value='desserts'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🍰 Desserts
                </SelectItem>
                <SelectItem
                  value='beverages'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🥤 Beverages
                </SelectItem>
                <SelectItem
                  value='snacks'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🍿 Snacks
                </SelectItem>
                <SelectItem
                  value='salads'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🥙 Salads
                </SelectItem>
                <SelectItem
                  value='soups'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🍲 Soups
                </SelectItem>
                <SelectItem
                  value='breads'
                  className='px-4 py-3 hover:bg-gray-50'>
                  🍞 Breads
                </SelectItem>
                <SelectItem value='rice' className='px-4 py-3 hover:bg-gray-50'>
                  🍚 Rice
                </SelectItem>
                <SelectItem
                  value='others'
                  className='px-4 py-3 hover:bg-gray-50'>
                  📦 Others
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='portion'
                className='text-sm font-medium text-gray-700'>
                Portion Size
              </Label>
              <Select
                value={formData.portion}
                onValueChange={(value) =>
                  setFormData({ ...formData, portion: value })
                }>
                <SelectTrigger className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-black'>
                  <SelectValue placeholder='Select portion' />
                </SelectTrigger>
                <SelectContent className='bg-white border border-gray-200 rounded-xl shadow-lg'>
                  <SelectItem
                    value='full'
                    className='px-4 py-2 hover:bg-gray-50'>
                    Full
                  </SelectItem>
                  <SelectItem
                    value='half'
                    className='px-4 py-2 hover:bg-gray-50'>
                    Half
                  </SelectItem>
                  <SelectItem
                    value='quarter'
                    className='px-4 py-2 hover:bg-gray-50'>
                    Quarter
                  </SelectItem>
                  <SelectItem
                    value='mini'
                    className='px-4 py-2 hover:bg-gray-50'>
                    Mini
                  </SelectItem>
                  <SelectItem
                    value='large'
                    className='px-4 py-2 hover:bg-gray-50'>
                    Large
                  </SelectItem>
                  <SelectItem
                    value='regular'
                    className='px-4 py-2 hover:bg-gray-50'>
                    Regular
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='quantity'
                className='text-sm font-medium text-gray-700'>
                Quantity <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='quantity'
                type='number'
                min='1'
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                placeholder='e.g., 1, 2, 3'
                required
                className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white text-black'
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
                className={`
                  flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200
                  ${
                    imageUploading
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                  }
                `}>
                {imageUploading ? (
                  <div className='flex flex-col items-center'>
                    <Loader2 className='w-8 h-8 text-blue-600 animate-spin mb-2' />
                    <p className='text-sm text-blue-600 font-medium'>
                      Processing image...
                    </p>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <Upload className='w-8 h-8 text-gray-400 mb-2' />
                    <p className='text-sm text-gray-600 font-medium'>
                      Click to upload image
                    </p>
                    <p className='text-xs text-gray-500'>
                      JPEG, PNG, WebP (Max 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Image Preview */}
            {formData.image && (
              <div className='bg-gray-50 rounded-xl p-4 border border-gray-200'>
                <div className='flex items-center gap-2 mb-3'>
                  <CheckCircle className='w-5 h-5 text-green-600' />
                  <p className='text-sm font-medium text-gray-700'>
                    Image Preview
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <img
                    src={formData.image}
                    alt='Preview'
                    className='w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm'
                    onError={(e) => {
                      console.warn(
                        'Image preview failed to load:',
                        formData.image
                      );
                      e.currentTarget.style.display = 'none';
                    }}
                    onLoad={() => {
                      console.log('Image preview loaded successfully');
                    }}
                  />
                  <div className='flex-1'>
                    <p className='text-sm text-gray-600'>
                      Image loaded successfully
                    </p>
                    <p className='text-xs text-gray-500'>
                      Ready to be saved with your menu item
                    </p>
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
              <Label className='text-sm font-medium text-gray-700'>
                Food Type
              </Label>
              <div className='space-y-3'>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='foodType'
                    checked={formData.isVeg}
                    onChange={() => setFormData({ ...formData, isVeg: true })}
                    className='w-4 h-4 text-green-600 focus:ring-green-500'
                  />
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                    <span className='text-sm font-medium text-gray-700'>
                      Vegetarian
                    </span>
                  </div>
                </label>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='foodType'
                    checked={!formData.isVeg}
                    onChange={() => setFormData({ ...formData, isVeg: false })}
                    className='w-4 h-4 text-red-600 focus:ring-red-500'
                  />
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-red-500 rounded-full'></div>
                    <span className='text-sm font-medium text-gray-700'>
                      Non-Vegetarian
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Availability */}
            <div className='space-y-3'>
              <Label className='text-sm font-medium text-gray-700'>
                Availability
              </Label>
              <div className='space-y-3'>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='availability'
                    checked={formData.available}
                    onChange={() =>
                      setFormData({ ...formData, available: true })
                    }
                    className='w-4 h-4 text-blue-600 focus:ring-blue-500'
                  />
                  <div className='flex items-center gap-2'>
                    <CheckCircle className='w-4 h-4 text-blue-600' />
                    <span className='text-sm font-medium text-gray-700'>
                      Available
                    </span>
                  </div>
                </label>
                <label className='flex items-center gap-3 p-3 border border-gray-200 rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 cursor-pointer'>
                  <input
                    type='radio'
                    name='availability'
                    checked={!formData.available}
                    onChange={() =>
                      setFormData({ ...formData, available: false })
                    }
                    className='w-4 h-4 text-gray-600 focus:ring-gray-500'
                  />
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4 text-gray-600' />
                    <span className='text-sm font-medium text-gray-700'>
                      Not Available
                    </span>
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
            className='w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] py-3 rounded-xl font-semibold text-lg'>
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
};
