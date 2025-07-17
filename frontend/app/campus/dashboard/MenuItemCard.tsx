import React from 'react';
import { Edit, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MenuItem } from '@/services/menuService';

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
  return (
    <Card className='flex flex-col h-full bg-white border-2 border-white shadow-md rounded-xl transition-all duration-200 hover:shadow-xl hover:outline hover:outline-2 hover:outline-white'>
      <div className='relative bg-white rounded-t-xl'>
        <img
          src={item.image || '/placeholder.svg'}
          alt={item.name}
          className='w-full h-40 object-cover rounded-t-xl bg-white'
        />
        <span className='absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
          Active
        </span>
        {item.isVeg ? (
          <span className='absolute top-2 right-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center'>
            <Leaf className='w-3 h-3 mr-1' /> VEG
          </span>
        ) : (
          <span className='absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center'>
            <Leaf className='w-3 h-3 mr-1 rotate-180' /> NON-VEG
          </span>
        )}
      </div>
      <CardContent className='flex-1 flex flex-col p-4 bg-white'>
        <h3 className='font-semibold text-gray-800'>{item.name}</h3>
        <p className='text-xs text-gray-500 mb-2'>
          {item.description || 'No description available'}
        </p>
        <div className='mb-2'>
          <span className='text-lg font-bold text-gray-800'>₹{item.price}</span>
        </div>
        <p className='text-xs text-gray-500 capitalize'>{item.category}</p>
        <div className='flex space-x-4 mt-auto'>
          <Button
            size='sm'
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 flex items-center px-4'
            onClick={() => onEdit(item)}>
            <Edit className='w-4 h-4 mr-1' /> Edit
          </Button>
          <Button
            size='sm'
            variant='ghost'
            className='bg-red-50 text-red-700 border-none hover:bg-red-100 flex items-center px-4'
            onClick={() => onDelete(item._id)}>
            <span className='w-2 h-2 bg-red-500 rounded-full mr-2 inline-block'></span>
            Deactivate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
