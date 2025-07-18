import React, { useState } from 'react';
import { Edit, Leaf, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/services/menuService';
import { useToast } from '@/hooks/use-toast';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onEdit,
  onDelete,
}) => {
  const { toast } = useToast();
  const [currentItem, setCurrentItem] = useState(item);

  return (
    <Card
      className={`flex flex-col h-full bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-lg rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] transform ${
        currentItem.available === false ? 'opacity-60 grayscale-[0.3]' : ''
      }`}>
      <div className='relative bg-white rounded-t-2xl overflow-hidden'>
        <img
          src={currentItem.image || '/placeholder.svg'}
          alt={currentItem.name}
          className={`w-full h-48 object-cover transition-transform duration-300 hover:scale-105 ${
            currentItem.available === false ? 'grayscale-[0.5]' : ''
          }`}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300'></div>
        <span
          className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg ${
            currentItem.available !== false
              ? 'bg-green-500/90'
              : 'bg-red-500/90 animate-pulse'
          }`}>
          {currentItem.available !== false ? 'Active' : 'Not Active'}
        </span>
        {currentItem.isVeg ? (
          <span className='absolute top-3 right-3 bg-green-100/95 text-green-800 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center backdrop-blur-sm shadow-lg'>
            <Leaf className='w-3 h-3 mr-1' /> VEG
          </span>
        ) : (
          <span className='absolute top-3 right-3 bg-red-100/95 text-red-800 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center backdrop-blur-sm shadow-lg'>
            <Leaf className='w-3 h-3 mr-1 rotate-180' /> NON-VEG
          </span>
        )}
      </div>
      <CardContent className='flex-1 flex flex-col p-5 bg-white rounded-b-2xl'>
        <h3 className='font-bold text-lg text-gray-900 mb-2 line-clamp-1'>
          {currentItem.name}
        </h3>
        <p className='text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed'>
          {currentItem.description || 'No description available'}
        </p>
        <div className='mb-3'>
          <span className='text-2xl font-bold text-gray-900 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
            ₹{currentItem.price}
          </span>
        </div>
        <div className='mb-4'>
          <span className='inline-block text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize'>
            {currentItem.category}
          </span>
        </div>
        <div className='mt-auto'>
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant='outline'
              className='flex-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 flex items-center justify-center font-medium transition-all duration-200 shadow-sm'
              onClick={() => onEdit(currentItem)}>
              <Edit className='w-4 h-4 mr-1' /> Edit
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='flex-1 bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 flex items-center justify-center font-medium transition-all duration-200 shadow-sm'
              onClick={() => onDelete(currentItem._id)}>
              <Trash2 className='w-4 h-4 mr-1' /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
