'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { RouteProtection } from '@/components/RouteProtection';
import Image from 'next/image';
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  MapPin,
  Clock,
  Gift,
  Loader2,
  StickyNote,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';

function CartPageContent() {
  const { cart, updateQuantity, removeFromCart, clearCart, totalPrice } =
    useCart();
  const { toast } = useToast();
  const router = useRouter();
  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [discount, setDiscount] = useState(0);
  const { isAuthenticated, token } = useAuth();
  const [pickupTime, setPickupTime] = useState('');
  const [note, setNote] = useState('');

  // Quantity and removal handlers
  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };
  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
    toast({
      title: 'Item removed',
      description: 'The item has been removed from your cart.',
    });
  };

  const handleApplyPromo = () => {
    setIsApplyingPromo(true);
    setTimeout(() => {
      if (promoCode.toLowerCase() === 'welcome10') {
        const discountAmount = totalPrice * 0.1;
        setDiscount(discountAmount);
        toast({
          title: 'Promo code applied',
          description: '10% discount has been applied to your order.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Invalid promo code',
          description: 'The promo code you entered is invalid or expired.',
        });
      }
      setIsApplyingPromo(false);
    }, 1000);
  };

  const handleCheckout = async () => {
    setIsPlacingOrder(true);
    try {
      if (cart.length === 0) {
        throw new Error('Cart is empty');
      }
      // Check canteen consistency
      const data = cart.map((item) => item.canteenId);
      const canteenId = data[0];

      data.forEach((id) => {
        if (id !== canteenId) {
          throw new Error('Items From Different Canteens Are not allowed');
        }
      });

      if (!pickupTime) {
        throw new Error('Please select a pickup time');
      }
      // Validate pickupTime is at least 10 minutes from now
      const selectedPickupTime = new Date(pickupTime);
      if (selectedPickupTime.getTime() - Date.now() < 10 * 60 * 1000) {
        throw new Error('Pickup time must be at least 10 minutes from now');
      }

      // Prepare backend data
      const items = JSON.stringify(cart);
      const Newdata = {
        items,
        pickUpTime: selectedPickupTime.toISOString(),
        canteenId,
      };
      console.log(Newdata);
      const response = await axios.post(
        'https://campusbites-mxpe.onrender.com/api/v1/order/CreateOrder',
        Newdata,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      router.push(`/payment?orderId=${response.data.data._id}`);
    } catch (error: any) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Cannot proceed to payment',
        description:
          error.message ||
          'There was a problem with your cart. Please try again.',
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 relative'>
        <div className='absolute inset-0 overflow-hidden -z-10 pointer-events-none'>
          <div className='absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 rounded-full blur-3xl' />
          <div className='absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl' />
        </div>

        <div className='bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50'>
          <div className='container mx-auto px-4 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-3'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => router.back()}>
                  <ArrowLeft className='h-5 w-5' />
                </Button>
                <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                  Your Cart
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 py-16 text-center'>
          <div className='mb-8'>
            <div className='w-32 h-32 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                width='64'
                height='64'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='text-gray-400 dark:text-gray-300'>
                <circle cx='8' cy='21' r='1' />
                <circle cx='19' cy='21' r='1' />
                <path d='M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' />
              </svg>
            </div>
            <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>
              Your cart is empty
            </h2>
            <p className='text-gray-600 dark:text-gray-400 mb-8'>
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button
              asChild
              className='bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-lg'>
              <Link href='/menu'>Browse Menu</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500 relative'>
      <div className='absolute inset-0 overflow-hidden -z-10 pointer-events-none'>
        <div className='absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl' />
      </div>

      <div className='bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-sm border-b border-gray-200/50 dark:border-gray-700/50'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <Button variant='ghost' size='icon' onClick={() => router.back()}>
                <ArrowLeft className='h-5 w-5' />
              </Button>
              <h1 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Your Cart
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-6 my-20'>
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Cart Items */}
          <div className='lg:w-2/3'>
            <div className='bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50'>
              <div className='p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center'>
                <h2 className='font-semibold text-gray-900 dark:text-white'>
                  Your Items ({cart.length})
                </h2>
                <Button
                  variant='outline'
                  className='border-red-500 text-red-500 hover:bg-red-50 flex items-center gap-2'
                  onClick={() => router.push('/menu')}
                  title='Add more items'>
                  <Plus className='h-5 w-5' />
                  <span className='font-medium'>Add more items</span>
                </Button>
              </div>
              <div className='divide-y divide-gray-100 dark:divide-gray-700'>
                {cart.map((item) => (
                  <div key={item.id} className='p-4'>
                    <div className='flex items-start space-x-4'>
                      <div className='w-16 h-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 relative'>
                        <Image
                          src={item.image || '/placeholder.svg'}
                          alt={item.name}
                          fill
                          className='object-cover'
                        />
                      </div>
                      <div className='flex-1'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <h3 className='font-medium text-gray-900 dark:text-white'>
                              {item.name}
                            </h3>
                            <p className='text-sm text-gray-500 dark:text-gray-400'>
                              ₹{item.price}
                            </p>
                          </div>
                          <p className='font-semibold text-gray-900 dark:text-white'>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center border border-gray-200 dark:border-gray-700 rounded-lg'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0'
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}>
                              <Minus className='h-3 w-3' />
                            </Button>
                            <span className='px-3 py-1 text-sm font-medium text-gray-900 dark:text-white'>
                              {item.quantity}
                            </span>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='h-8 w-8 p-0'
                              onClick={() =>
                                handleQuantityChange(item.id, item.quantity + 1)
                              }>
                              <Plus className='h-3 w-3' />
                            </Button>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveItem(item.id)}
                            className='text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'>
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Promo Code */}
            <div className='bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 mt-4 p-4'>
              {/* Add a Note for the Canteen Section */}
              <div className='mb-4'>
                <label
                  htmlFor='canteen-note'
                  className='flex items-center space-x-2 font-medium text-gray-900 dark:text-white mb-1'>
                  <StickyNote className='h-5 w-5 text-red-500' />
                  <span>Add a note for the canteen</span>
                </label>
                <Textarea
                  id='canteen-note'
                  placeholder='E.g. Please make it less spicy, no onions, etc.'
                  value={note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNote(e.target.value)
                  }
                  className='resize-none min-h-[60px]'
                  maxLength={200}
                />
                <div className='text-xs text-gray-400 text-right mt-1'>
                  {note.length}/200
                </div>
              </div>
              {/* Existing Promo Code Section */}
              <div className='flex items-center space-x-2 mb-3'>
                <Gift className='h-5 w-5 text-red-500' />
                <span className='font-medium text-gray-900 dark:text-white'>
                  Apply Promo Code
                </span>
              </div>
              <div className='flex space-x-2'>
                <Input
                  type='text'
                  placeholder='Enter promo code'
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className='flex-1'
                />
                <Button
                  variant='outline'
                  onClick={handleApplyPromo}
                  disabled={isApplyingPromo || !promoCode}
                  className='border-red-500 text-red-500 hover:bg-red-50'>
                  {isApplyingPromo ? 'Applying...' : 'Apply'}
                </Button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className='lg:w-1/3 space-y-6'>
            {/* Pickup Time Input */}
            <div className='bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4'>
              <label
                htmlFor='pickupTime'
                className='block mb-2 font-semibold text-gray-900 dark:text-white'>
                Select Pickup Time
              </label>
              <Input
                id='pickupTime'
                type='datetime-local'
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className='w-full'
              />
              <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                Pickup time must be at least 10 minutes from now.
              </p>
            </div>

            {/* Bill Details */}
            <div className='bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-lg shadow-sm border border-gray-200/50 dark:border-gray-700/50 p-4 sticky top-40'>
              <h2 className='font-semibold text-gray-900 dark:text-white mb-4'>
                Bill Details
              </h2>

              <div className='space-y-3 mb-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Item Total
                  </span>
                  <span className='text-gray-900 dark:text-white'>
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Discount
                    </span>
                    <span className='text-green-600 dark:text-green-400'>
                      -₹{discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Delivery Fee
                  </span>
                  <span className='text-gray-900 dark:text-white'>₹0</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Taxes & Charges
                  </span>
                  <span className='text-gray-900 dark:text-white'>₹0</span>
                </div>
              </div>

              <div className='border-t border-gray-200 dark:border-gray-700 mt-4 pt-4'>
                <div className='flex justify-between font-bold text-lg'>
                  <span className='text-gray-900 dark:text-white'>To Pay</span>
                  <span className='text-gray-900 dark:text-white'>
                    ₹{(totalPrice - discount).toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                className='w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base rounded-lg'
                onClick={handleCheckout}
                disabled={isPlacingOrder}>
                {isPlacingOrder ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Proceeding...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>

              <div className='mt-3 text-center'>
                <Link
                  href='/menu'
                  className='text-sm text-red-500 hover:text-red-600'>
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <RouteProtection>
      <CartPageContent />
    </RouteProtection>
  );
}
