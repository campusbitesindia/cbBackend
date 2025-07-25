import React, { useState } from 'react';
import { Edit, Leaf, Trash2, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { MenuItem, toggleMenuItemReadyStatus } from '@/services/menuService';
import { useToast } from '@/hooks/use-toast';

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (itemId: string) => void;
  onToggleReady?: (itemId: string, isReady: boolean) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleReady,
}) => {
  const { toast } = useToast();
  const [currentItem, setCurrentItem] = useState(item);
  const [togglingReady, setTogglingReady] = useState(false);

  const handleToggleReady = async () => {
    if (togglingReady) return;

    setTogglingReady(true);
    try {
      const updatedItem = await toggleMenuItemReadyStatus(currentItem._id);
      setCurrentItem(updatedItem);

      toast({
        title: 'Status Updated',
        description: `Item ${
          updatedItem.isReady ? 'marked as ready' : 'marked as not ready'
        }`,
      });

      // Call parent callback if provided
      if (onToggleReady) {
        onToggleReady(currentItem._id, updatedItem.isReady || false);
      }
    } catch (error: any) {
      console.error('Error toggling ready status:', error);
      toast({
        title: 'Update Failed',
        description:
          error.response?.data?.message || 'Failed to update ready status',
        variant: 'destructive',
      });
    } finally {
      setTogglingReady(false);
    }
  };

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

        {/* Ready Status Badge */}
        <span
          className={`absolute top-3 right-3 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm shadow-lg flex items-center ${
            currentItem.isReady ? 'bg-green-600/90' : 'bg-orange-500/90'
          }`}>
          {currentItem.isReady ? (
            <>
              <CheckCircle className='w-3 h-3 mr-1' />
              Ready
            </>
          ) : (
            <>
              <Clock className='w-3 h-3 mr-1' />
              Not Ready
            </>
          )}
        </span>

        {/* Veg/Non-Veg Badge - moved to bottom right */}
        {currentItem.isVeg ? (
          <span className='absolute bottom-3 right-3 bg-green-100/95 text-green-800 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center backdrop-blur-sm shadow-lg'>
            <Leaf className='w-3 h-3 mr-1' /> VEG
          </span>
        ) : (
          <span className='absolute bottom-3 right-3 bg-red-100/95 text-red-800 text-xs font-semibold px-2.5 py-1.5 rounded-full flex items-center backdrop-blur-sm shadow-lg'>
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
        <div className='mb-3 flex items-center justify-between'>
          <span className='text-2xl font-bold text-gray-900 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent'>
            ₹{currentItem.price}
          </span>
          {/* Toggle Ready Status Switch */}
          <Switch
            checked={currentItem.isReady || false}
            onCheckedChange={handleToggleReady}
            disabled={togglingReady}
            className={`${
              togglingReady ? 'opacity-50 cursor-not-allowed' : ''
            } ${
              currentItem.isReady
                ? 'data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600'
                : 'data-[state=unchecked]:bg-red-600 data-[state=unchecked]:border-red-600'
            }`}
          />
        </div>
        <div className='mb-4'>
          <span className='inline-block text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize'>
            {currentItem.category}
          </span>
        </div>
        <div className='mt-auto'>
          <div className='flex gap-2 mb-3'>
            <Button
              size='sm'
              variant='outline'
              className='flex-1 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow-md'
              onClick={() => onEdit(currentItem)}>
              <Edit className='w-4 h-4 mr-1.5' /> Edit
            </Button>
            <Button
              size='sm'
              variant='outline'
              className='flex-1 bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200 hover:from-red-100 hover:to-red-200 hover:border-red-300 flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow-md'
              onClick={() => onDelete(currentItem._id)}>
              <Trash2 className='w-4 h-4 mr-1.5' /> Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
