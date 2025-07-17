import React from 'react';
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

interface MenuItemFormData {
  name: string;
  price: string;
  description: string;
  category: string;
  isVeg: boolean;
  image: string;
}

interface MenuItemFormProps {
  formData: MenuItemFormData;
  setFormData: (data: MenuItemFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  imageUploading: boolean;
  imagePreview: string;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isEditing,
  imageUploading,
  imagePreview,
  onImageUpload,
}) => {
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
        <Label htmlFor='image'>Image</Label>
        <Input
          id='image'
          type='file'
          accept='image/jpeg,image/jpg,image/png,image/webp'
          onChange={onImageUpload}
          className='bg-white text-black placeholder:text-black'
          disabled={imageUploading}
        />
        <p className='text-xs text-gray-500 mt-1'>
          Supported formats: JPEG, PNG, WebP (max 5MB)
        </p>
        {imageUploading && (
          <div className='mt-2 flex items-center space-x-2 text-blue-600'>
            <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600'></div>
            <span className='text-sm'>Processing image...</span>
          </div>
        )}
        {imagePreview && !imageUploading && (
          <div className='mt-2'>
            <img
              src={imagePreview}
              alt='Preview'
              className='w-20 h-20 object-cover rounded border border-gray-200'
            />
            <p className='text-xs text-green-600 mt-1'>
              Image ready for upload!
            </p>
          </div>
        )}
      </div>

      {isEditing && (
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
      )}

      <Button type='submit' className='w-full' disabled={imageUploading}>
        {imageUploading
          ? 'Uploading Image...'
          : isEditing
          ? 'Update Item'
          : 'Add Item'}
      </Button>
    </form>
  );
};
