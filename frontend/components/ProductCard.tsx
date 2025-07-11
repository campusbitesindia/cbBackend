'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { StoreItem } from '@/services/storeService';
import { ShoppingCart, Plus, Minus } from 'lucide-react';

interface ProductCardProps {
  item: StoreItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      image: item.image,
    });

    toast({
      title: 'Added to cart',
      description: `${quantity}x ${item.name} added to your cart`,
    });

    setQuantity(1); // Reset quantity after adding
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= item.stock) {
      setQuantity(newQuantity);
    }
  };

  return (
    <Card className='h-full flex flex-col hover:shadow-lg transition-shadow'>
      <CardHeader className='pb-3'>
        <div className='relative aspect-square overflow-hidden rounded-lg'>
          <img
            src={item.image || '/placeholder.jpg'}
            alt={item.name}
            className='w-full h-full object-cover'
          />
          {!item.isAvailable && (
            <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
              <Badge variant='destructive'>Out of Stock</Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className='flex-1 flex flex-col'>
        <div className='flex items-start justify-between mb-2'>
          <h3 className='font-semibold text-lg line-clamp-2'>{item.name}</h3>
          <Badge variant='secondary' className='ml-2 flex-shrink-0'>
            {item.category}
          </Badge>
        </div>

        <p className='text-sm text-muted-foreground line-clamp-2 mb-3'>
          {item.description}
        </p>

        <div className='mt-auto'>
          <div className='flex items-center justify-between mb-3'>
            <span className='text-xl font-bold text-primary'>
              ₹{item.price.toFixed(0)}
            </span>
            <span className='text-sm text-muted-foreground'>
              {item.stock} in stock
            </span>
          </div>

          {item.isAvailable && item.stock > 0 && (
            <div className='flex items-center gap-2 mb-3'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}>
                <Minus className='h-4 w-4' />
              </Button>
              <span className='w-8 text-center'>{quantity}</span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= item.stock}>
                <Plus className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleAddToCart}
          disabled={!item.isAvailable || item.stock === 0}
          className='w-full'>
          <ShoppingCart className='h-4 w-4 mr-2' />
          {!item.isAvailable || item.stock === 0
            ? 'Out of Stock'
            : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}
