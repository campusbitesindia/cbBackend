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
}

export const MenuItemForm: React.FC<MenuItemFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  isEditing,
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
        <Label htmlFor='image'>Image URL</Label>
        <Input
          id='image'
          type='url'
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          placeholder='https://example.com/image.jpg'
          className='bg-white text-black placeholder:text-gray-400'
        />
        <p className='text-xs text-gray-500 mt-1'>
          Enter a valid image URL (JPEG, PNG, WebP formats recommended)
        </p>
        {formData.image && (
          <div className='mt-2'>
            <img
              src={formData.image}
              alt='Preview'
              className='w-20 h-20 object-cover rounded border border-gray-200'
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
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

      <Button type='submit' className='w-full'>
        {isEditing ? 'Update Item' : 'Add Item'}
      </Button>
    </form>
  );
};
