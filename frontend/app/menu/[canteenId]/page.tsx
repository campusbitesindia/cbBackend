'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Star,
  Clock,
  MapPin,
  Filter,
  Heart,
  Plus,
  Minus,
  Utensils,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import { Canteen, Item } from '@/types';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/lib/constants';
import { useSocket } from '@/context/socket-context';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CanteenMenuPage = () => {
  const params = useParams();
  const { canteenId } = params;
  const { toast } = useToast();
  const { getSocket, connectSocket, disconnectSocket } = useSocket();
  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [menuItems, setMenuItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedItemType, setSelectedItemType] = useState('all');
  const [under99Filter, setUnder99Filter] = useState(false);
  const [isReadyFilter, setIsReadyFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [loading, setLoading] = useState(true);
  const [showCanteenConflictDialog, setShowCanteenConflictDialog] =
    useState(false);
  const [pendingItem, setPendingItem] = useState<Item | null>(null);

  const cartref = useRef(cart);

  useEffect(() => {
    cartref.current = cart;
  }, [cart]);

  useEffect(() => {
    connectSocket();
    const socket = getSocket();
    socket?.emit('Join_Room', canteenId);

    return () => {
      console.log(cartref.current);
      if (cartref.current.length === 0) {
        disconnectSocket();
      }
    };
  }, [canteenId]);

  useEffect(() => {
    if (canteenId) {
      const fetchCanteenDetails = async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.CANTEENS}/${canteenId}`);
          if (!res.ok) throw new Error('Failed to fetch canteen details');
          const data = await res.json();
          setCanteen(data.canteen);
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch canteen details.',
          });
        }
      };

      const fetchMenuItems = async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.MENU}/${canteenId}`);
          if (!res.ok) throw new Error('Failed to fetch menu');
          const data = await res.json();
          setMenuItems(data.data || []);
        } catch (error) {
          console.error(error);
          toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not fetch menu items.',
          });
        }
      };

      Promise.all([fetchCanteenDetails(), fetchMenuItems()]).finally(() =>
        setLoading(false)
      );
    }
  }, [canteenId, toast]);

  const categories = [
    'All Categories',
    ...Array.from(new Set(menuItems.map((item) => item.category))).filter(
      Boolean
    ),
  ];

  const itemTypes = [
    { label: `All Items (${menuItems.length})`, value: 'all' },
  ];

  const maxPrice =
    menuItems.length > 0
      ? Math.ceil(Math.max(...menuItems.map((item) => item.price || 0)))
      : 1000;

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Categories' ||
      item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesUnder99 = !under99Filter || (item.price && item.price < 99);
    const matchesPriceRange =
      item.price && item.price >= priceRange[0] && item.price <= priceRange[1];
    const matchesIsReady = !isReadyFilter || item.isReady === true;
    return (
      matchesCategory &&
      matchesSearch &&
      matchesUnder99 &&
      matchesPriceRange &&
      matchesIsReady
    );
  });

  const getCartItemQuantity = (itemId: string) =>
    cart.find((item) => item.id === itemId)?.quantity || 0;

  const handleAddToCart = (item: Item) => {
    addToCart(
      {
        canteenId: item.canteen,
        id: item._id,
        name: item.name,
        price: item.price,
        quantity: 1,
        image: item.image || '/placeholder.svg',
      },
      () => {
        // Handle canteen conflict
        setPendingItem(item);
        setShowCanteenConflictDialog(true);
      }
    );

    // Only show success toast if no conflict (item was actually added)
    const wasAdded = cart.length === 0 || cart[0].canteenId === item.canteen;
    if (wasAdded) {
      toast({ title: 'Added to cart', description: `${item.name} was added.` });
    }
  };

  const handleConfirmCanteenSwitch = () => {
    if (pendingItem) {
      // Clear cart and add the new item
      cart.forEach((cartItem) => removeFromCart(cartItem.id));

      addToCart({
        canteenId: pendingItem.canteen,
        id: pendingItem._id,
        name: pendingItem.name,
        price: pendingItem.price,
        quantity: 1,
        image: pendingItem.image || '/placeholder.svg',
      });

      toast({
        title: 'Cart cleared and item added',
        description: `Previous items removed. ${pendingItem.name} was added.`,
      });
    }

    setShowCanteenConflictDialog(false);
    setPendingItem(null);
  };

  const handleIncrement = (item: Item) => {
    updateQuantity(item._id, getCartItemQuantity(item._id) + 1);
  };

  const handleDecrement = (item: Item) => {
    const currentQuantity = getCartItemQuantity(item._id);
    if (currentQuantity === 1) {
      removeFromCart(item._id);
      toast({
        title: 'Removed from cart',
        description: `${item.name} was removed.`,
      });
    } else {
      updateQuantity(item._id, currentQuantity - 1);
    }
  };

  const handlePriceRangeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [min, max] = priceRange;
    const value = Number(e.target.value);
    if (e.target.id === 'min-price') {
      setPriceRange([Math.min(value, max), max]);
    } else {
      setPriceRange([min, Math.max(value, min)]);
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-500 flex justify-center items-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500'></div>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-500 flex justify-center items-center'>
        <div className='text-center py-10 text-gray-900 dark:text-white'>
          Canteen not found.
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 transition-colors duration-500'>
      <header className="relative h-48 sm:h-64 md:h-80">
  <Image
    src={canteen.image || '/placeholder.svg'}
    alt={canteen.name}
    fill
    className="object-cover opacity-70"
    priority
  />
  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 to-transparent" />
  <div className="absolute bottom-0 left-0 p-4 sm:p-8">
    <Link
      href="/menu"
      className="flex items-center gap-2 text-white mb-2 sm:mb-4 hover:underline"
    >
      <ArrowLeft size={14} className="sm:size-4" /> 
      <span className="text-sm sm:text-base">Back to Restaurants</span>
    </Link>
    <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white drop-shadow-md">
      {canteen.name}
    </h1>
    <p className="text-sm sm:text-lg text-gray-200 drop-shadow-sm">{canteen.cuisine}</p>
    <div className="flex flex-wrap items-center gap-3 mt-2 text-gray-200 text-xs sm:text-sm">
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
        <span>{canteen.rating}</span>
      </div>
      <div className="flex items-center gap-1">
        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{canteen.deliveryTime}</span>
      </div>
      <div className="flex items-center gap-1">
        <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
        <span>{canteen.distance}</span>
      </div>
    </div>
  </div>
</header>


      <div className='container mx-auto px-4 py-8'>
        {/* Filter Bar */}
        <div className='flex flex-col gap-6 mb-8 bg-white dark:bg-gray-900 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700'>
          <div className='flex flex-col md:flex-row flex-wrap gap-4 items-center'>
            <div className='relative w-full md:w-1/3'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
              <Input
                type='text'
                placeholder='Search menu items by name...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10 rounded-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500'
              />
            </div>
            <select
              className='w-full sm:w-1/4 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/4'
              value={selectedItemType}
              onChange={(e) => setSelectedItemType(e.target.value)}>
              {itemTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              className=' w-full sm:w-1/4 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-full md:w-1/4'
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-col sm:flex-row gap-4 items-center'>
            <div className='flex items-center gap-4'>
              <label className='flex items-center gap-2 text-gray-900 dark:text-white cursor-pointer'>
                <input
                  type='checkbox'
                  checked={under99Filter}
                  onChange={(e) => setUnder99Filter(e.target.checked)}
                  className='h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600'
                />
                <span className='text-sm font-medium'>Under ₹99</span>
              </label>
              <label className='flex items-center gap-2 text-gray-900 dark:text-white cursor-pointer'>
                <input
                  type='checkbox'
                  checked={isReadyFilter}
                  onChange={(e) => setIsReadyFilter(e.target.checked)}
                  className='h-5 w-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-600'
                />
                <span className='text-sm font-medium'>Quick Bites</span>
              </label>
            </div>
            <div className='flex flex-col w-full sm:w-auto'>
              <span className='text-gray-900 dark:text-white text-sm font-medium mb-2'>
                Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </span>
              <div className='flex flex-col sm:flex-row gap-4 w-full'>
                <input
                  type='range'
                  id='min-price'
                  min='0'
                  max={maxPrice}
                  value={priceRange[0]}
                  onChange={handlePriceRangeChange}
                  className='w-full sm:w-32 accent-blue-500'
                />
                <input
                  type='range'
                  id='max-price'
                  min='0'
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={handlePriceRangeChange}
                  className='w-full sm:w-32 accent-blue-500'
                />
              </div>
            </div>
          </div>
        </div>
        {/* End Filter Bar */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          <main className='md:col-span-4'>
            {filteredMenuItems.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
                {filteredMenuItems.map((item) => {
                  const quantity = getCartItemQuantity(item._id);
                  return (
                    <Card
                      key={item._id}
                      className='flex flex-col rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 relative'>
                      <div className='relative w-full h-40 sm:h-48'>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'>
                            <Utensils className='w-12 h-12 text-gray-400' />
                          </div>
                        )}
                        <div className='absolute top-3 left-3 z-10'>
                          <Badge className='bg-green-500 text-white rounded-full px-3 py-1 text-xs shadow'>
                            Active
                          </Badge>
                        </div>
                        <div className='absolute top-3 right-3 z-10'>
                          <Badge
                            className={
                              item.isVeg
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }>
                            {item.isVeg ? 'VEG' : 'NON-VEG'}
                          </Badge>
                        </div>
                      </div>
                      <div className='flex flex-col flex-1 p-5 gap-2'>
                        <div className='flex flex-col gap-1'>
                          <span className='font-bold text-lg capitalize text-gray-900 dark:text-white'>
                            {item.name}
                          </span>
                          <span className='text-gray-600 dark:text-gray-300 text-sm'>
                            {item.description
                              ? item.description
                              : 'No description available'}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                          <span className='font-bold text-orange-500 text-lg'>
                            ₹{item.price || 'N/A'}
                          </span>
                          <Badge className='bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium ml-2'>
                            {item.category || 'Uncategorized'}
                          </Badge>
                        </div>
                        <div className='flex-1' />
                        {quantity === 0 ? (
                          <Button
                            onClick={() => handleAddToCart(item)}
                            className='w-full bg-red-500 hover:bg-red-600 text-white rounded-full font-semibold mt-4 py-2 transition-colors'>
                            <Plus size={16} className='mr-2' /> Add to cart
                          </Button>
                        ) : (
                          <div className='flex items-center justify-between mt-4'>
                            <Button
                              size='icon'
                              onClick={() => handleDecrement(item)}
                              className='bg-red-500 hover:bg-red-600 text-white rounded-full'>
                              <Minus size={16} />
                            </Button>
                            <span className='font-bold text-lg'>
                              {quantity}
                            </span>
                            <Button
                              size='icon'
                              onClick={() => handleIncrement(item)}
                              className='bg-green-500 hover:bg-green-600 text-white rounded-full'>
                              <Plus size={16} />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className='text-center py-10 text-gray-600 dark:text-gray-400'>
                No menu items found.
              </p>
            )}
          </main>
        </div>
      </div>

      {/* Canteen Conflict Dialog */}
      <AlertDialog
        open={showCanteenConflictDialog}
        onOpenChange={setShowCanteenConflictDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Different Canteen Detected</AlertDialogTitle>
            <AlertDialogDescription>
              You have items from a different canteen in your cart. You can only
              order from one canteen at a time. Would you like to clear your
              current cart and add this item from {canteen?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowCanteenConflictDialog(false);
                setPendingItem(null);
              }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCanteenSwitch}
              className='bg-red-600 hover:bg-red-700'>
              Clear Cart & Add Item
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CanteenMenuPage;
