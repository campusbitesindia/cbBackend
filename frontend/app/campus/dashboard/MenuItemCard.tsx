import React, { useState } from 'react';
import { Edit, Leaf, Trash2, Clock, CheckCircle, Star } from 'lucide-react';
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
      className={`group relative overflow-hidden bg-white border-0 shadow-lg rounded-2xl transition-all duration-500 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 ${
        currentItem.available === false
          ? 'opacity-75 ring-2 ring-red-100'
          : 'hover:ring-2 hover:ring-indigo-100'
      }`}>
      {/* Gradient overlay for depth */}
      <div className='absolute inset-0 bg-gradient-to-br from-slate-50/30 via-transparent to-slate-100/20 pointer-events-none' />

      {/* Image Section */}
      <div className='relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-100 to-slate-200'>
        <div className='aspect-[3/2] relative overflow-hidden'>
          <img
            src={currentItem.image || '/placeholder.svg'}
            alt={currentItem.name}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
              currentItem.available === false ? 'grayscale saturate-50' : ''
            }`}
          />

          {/* Image overlay gradient */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60' />

          {/* Animated overlay on hover */}
          <div className='absolute inset-0 bg-gradient-to-t from-indigo-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500' />
        </div>

        {/* Status Badges Container */}
        <div className='absolute inset-0 p-3'>
          {/* Availability Badge */}
          <div className='flex justify-between items-start'>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                currentItem.available !== false
                  ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/25'
                  : 'bg-red-500/90 text-white border-red-400/50 shadow-lg shadow-red-500/25 animate-pulse'
              }`}>
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  currentItem.available !== false
                    ? 'bg-emerald-200'
                    : 'bg-red-200'
                }`}
              />
              {currentItem.available !== false ? 'Available' : 'Unavailable'}
            </span>

            {/* Veg/Non-Veg Badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1.5 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                currentItem.isVeg
                  ? 'bg-green-500/90 text-white border-green-400/50 shadow-lg shadow-green-500/25'
                  : 'bg-orange-500/90 text-white border-orange-400/50 shadow-lg shadow-orange-500/25'
              }`}>
              <Leaf
                className={`w-2.5 h-2.5 ${
                  !currentItem.isVeg ? 'rotate-180' : ''
                }`}
              />
              {currentItem.isVeg ? 'Veg' : 'Non-Veg'}
            </span>
          </div>

          {/* Ready Status Badge - Bottom */}
          <div className='absolute bottom-3 left-3'>
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                currentItem.isReady
                  ? 'bg-emerald-500/90 text-white border-emerald-400/50 shadow-lg shadow-emerald-500/25'
                  : 'bg-amber-500/90 text-white border-amber-400/50 shadow-lg shadow-amber-500/25'
              }`}>
              {currentItem.isReady ? (
                <>
                  <CheckCircle className='w-3 h-3' />
                  Ready
                </>
              ) : (
                <>
                  <Clock className='w-3 h-3' />
                  Preparing
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <CardContent className='relative p-4 space-y-3'>
        {/* Header */}
        <div className='space-y-1.5'>
          <h3 className='font-bold text-lg text-slate-900 leading-tight line-clamp-1 group-hover:text-indigo-700 transition-colors duration-300'>
            {currentItem.name}
          </h3>
          <p className='text-xs text-slate-600 line-clamp-2 leading-relaxed'>
            {currentItem.description ||
              'Delicious item crafted with care and quality ingredients'}
          </p>
        </div>

        {/* Price and Category Row */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-1.5'>
            <span className='text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent'>
              ₹{currentItem.price}
            </span>
          </div>

          <span className='inline-flex items-center text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg capitalize'>
            {currentItem.category}
          </span>
        </div>

        {/* Ready Status Toggle */}
        <div className='flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100'>
          <div className='flex items-center gap-2'>
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                currentItem.isReady ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            <span className='text-xs font-medium text-slate-700'>
              {currentItem.isReady ? 'Ready to serve' : 'Mark when ready'}
            </span>
          </div>

          <Switch
            checked={currentItem.isReady || false}
            onCheckedChange={handleToggleReady}
            disabled={togglingReady}
            className={`
              transition-all duration-300
              ${togglingReady ? 'opacity-50 cursor-not-allowed' : ''}
              data-[state=checked]:bg-emerald-600 
              data-[state=unchecked]:bg-slate-300
            `}
          />
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2 pt-1'>
          <Button
            size='sm'
            variant='outline'
            className='flex-1 h-8 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border-indigo-200 hover:from-indigo-100 hover:to-blue-100 hover:border-indigo-300 hover:text-indigo-800 font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-indigo-200/50 rounded-lg text-xs'
            onClick={() => onEdit(currentItem)}>
            <Edit className='w-3 h-3 mr-1.5' />
            Edit
          </Button>

          <Button
            size='sm'
            variant='outline'
            className='flex-1 h-8 bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200 hover:from-red-100 hover:to-pink-100 hover:border-red-300 hover:text-red-800 font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:shadow-red-200/50 rounded-lg text-xs'
            onClick={() => onDelete(currentItem._id)}>
            <Trash2 className='w-3 h-3 mr-1.5' />
            Remove
          </Button>
        </div>
      </CardContent>

      {/* Subtle corner accent */}
      <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-100/30 to-transparent rounded-bl-2xl' />
    </Card>
  );
};
