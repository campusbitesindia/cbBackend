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
    <form onSubmit={onSubmit} className='space-y-4 text-black'>
      <div>
        <Label htmlFor='name'>Item Name</Label>
        <Input
          id='name'
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className='bg-white text-black placeholder:text-black'
        />
      </div>

      <div>
        <Label htmlFor='price'>Price (₹)</Label>
        <Input
          id='price'
          type='number'
          step='0.01'
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          required
          className='bg-white text-black placeholder:text-black'
        />
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <Label htmlFor='portion'>Portion Size</Label>
          <Select
            value={formData.portion}
            onValueChange={(value) =>
              setFormData({ ...formData, portion: value })
            }>
            <SelectTrigger className='bg-white text-black'>
              <SelectValue
                placeholder='Select portion'
                className='text-black'
              />
            </SelectTrigger>
            <SelectContent className='bg-white text-black'>
              <SelectItem value='full'>Full</SelectItem>
              <SelectItem value='half'>Half</SelectItem>
              <SelectItem value='quarter'>Quarter</SelectItem>
              <SelectItem value='mini'>Mini</SelectItem>
              <SelectItem value='large'>Large</SelectItem>
              <SelectItem value='regular'>Regular</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor='quantity'>Quantity</Label>
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
            className='bg-white text-black placeholder:text-gray-400'
          />
        </div>
      </div>
      <p className='text-xs text-gray-500 -mt-2'>
        Select portion size and enter the number of servings per order
      </p>

      <div>
        <Label htmlFor='description'>Description</Label>
        <Textarea
          id='description'
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className='bg-white text-black placeholder:text-black'
        />
      </div>

      <div>
        <Label htmlFor='category'>Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }>
          <SelectTrigger className='bg-white text-black'>
            <SelectValue placeholder='Select category' className='text-black' />
          </SelectTrigger>
          <SelectContent className='bg-white text-black'>
            <SelectItem value='appetizers'>Appetizers</SelectItem>
            <SelectItem value='main-course'>Main Course</SelectItem>
            <SelectItem value='desserts'>Desserts</SelectItem>
            <SelectItem value='beverages'>Beverages</SelectItem>
            <SelectItem value='snacks'>Snacks</SelectItem>
            <SelectItem value='salads'>Salads</SelectItem>
            <SelectItem value='soups'>Soups</SelectItem>
            <SelectItem value='breads'>Breads</SelectItem>
            <SelectItem value='rice'>Rice</SelectItem>
            <SelectItem value='others'>Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Image</Label>
        <input
          type='file'
          accept='image/jpeg,image/jpg,image/png,image/webp'
          onChange={handleFileUpload}
          disabled={imageUploading}
          className='mb-2 w-full p-2 border border-gray-300 rounded bg-white text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
        />
        {imageUploading && (
          <p className='text-xs text-blue-600'>Processing image...</p>
        )}

        {/* Image Preview */}
        {formData.image && (
          <div className='mt-3'>
            <p className='text-xs text-gray-500 mb-2'>Preview:</p>
            <img
              src={formData.image}
              alt='Preview'
              className='w-24 h-24 object-cover rounded-lg border-2 border-gray-200'
              onError={(e) => {
                console.warn('Image preview failed to load:', formData.image);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image preview loaded successfully');
              }}
            />
          </div>
        )}
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='isVeg'
            checked={formData.isVeg}
            onChange={(e) =>
              setFormData({ ...formData, isVeg: e.target.checked })
            }
            className='bg-white text-black'
          />
          <Label htmlFor='isVeg' className='text-black'>
            Vegetarian
          </Label>
        </div>
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='isNonVeg'
            checked={!formData.isVeg}
            onChange={(e) =>
              setFormData({ ...formData, isVeg: !e.target.checked })
            }
            className='bg-white text-black'
          />
          <Label htmlFor='isNonVeg' className='text-black'>
            Non-Vegetarian
          </Label>
        </div>
      </div>

      <div className='flex items-center space-x-4'>
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='isAvailable'
            checked={formData.available}
            onChange={(e) =>
              setFormData({ ...formData, available: e.target.checked })
            }
            className='bg-white text-black'
          />
          <Label htmlFor='isAvailable' className='text-black'>
            Available
          </Label>
        </div>
        <div className='flex items-center space-x-2'>
          <input
            type='checkbox'
            id='isNotAvailable'
            checked={!formData.available}
            onChange={(e) =>
              setFormData({ ...formData, available: !e.target.checked })
            }
            className='bg-white text-black'
          />
          <Label htmlFor='isNotAvailable' className='text-black'>
            Not Available
          </Label>
        </div>
      </div>

      <Button type='submit' className='w-full' disabled={imageUploading}>
        {imageUploading
          ? 'Processing...'
          : isEditing
          ? 'Update Item'
          : 'Add Item'}
      </Button>
    </form>
  );
};
