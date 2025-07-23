'use client';

import { useState, useEffect } from 'react';
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

const CanteenMenuPage = () => {
  const params = useParams();
  const { canteenId } = params;
  const { toast } = useToast();

  const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [menuItems, setMenuItems] = useState<Item[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedItemType, setSelectedItemType] = useState('all'); // For 'All Items' dropdown
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (canteenId) {
      const fetchCanteenDetails = async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.CANTEENS}/${canteenId}`);
          if (!res.ok) throw new Error('Failed to fetch canteen details');
          const data = await res.json();
          setCanteen(data.canteen); // Changed from data.data to data.canteen to match backend response
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
    // You can add more item types if needed
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'All Categories' ||
      item.category === selectedCategory;
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    // You can add more filters for itemTypes if needed
    return matchesCategory && matchesSearch;
  });

  const getCartItemQuantity = (itemId: string) =>
    cart.find((item) => item.id === itemId)?.quantity || 0;

  const handleAddToCart = (item: Item) => {
    addToCart({
      id: item._id,
      name: item.name,
      price: item.price,
      quantity: 1,
      image: item.image || '/placeholder.svg',
    });
    toast({ title: 'Added to cart', description: `${item.name} was added.` });
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

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:bg-gray-950 transition-colors duration-500 flex justify-center items-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-red-500'></div>
      </div>
    );
  }

  if (!canteen) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:bg-gray-950 transition-colors duration-500 flex justify-center items-center'>
        <div className='text-center py-10 text-gray-900 dark:text-white'>
          Canteen not found.
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:bg-gray-950 transition-colors duration-500'>
      <header className='relative h-64 md:h-80'>
        <Image
          src={canteen.image || '/placeholder.svg'}
          alt={canteen.name}
          layout='fill'
          objectFit='cover'
          className='opacity-70'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent' />
        <div className='absolute bottom-0 left-0 p-8'>
          <Link
            href='/menu'
            className='flex items-center gap-2 text-white mb-4 hover:underline transition-colors'>
            <ArrowLeft size={16} /> Back to Restaurants
          </Link>
          <h1 className='text-5xl font-bold text-white drop-shadow-md'>
            {canteen.name}
          </h1>
          <p className='text-lg text-gray-200 drop-shadow-sm'>
            {canteen.cuisine}
          </p>
          <div className='flex items-center gap-4 mt-2 text-gray-200'>
            <div className='flex items-center gap-1'>
              <Star className='w-5 h-5 text-yellow-400 fill-yellow-400' />
              <span>{canteen.rating}</span>
            </div>
            <div className='flex items-center gap-1'>
              <Clock className='w-5 h-5' />
              <span>{canteen.deliveryTime}</span>
            </div>
            <div className='flex items-center gap-1'>
              <MapPin className='w-5 h-5' />
              <span>{canteen.distance}</span>
            </div>
          </div>
        </div>
      </header>

      <div className='container mx-auto px-4 py-8'>
        {/* Filter Bar */}
        <div className='flex flex-col md:flex-row gap-4 mb-8 items-center'>
          <div className='relative w-full md:w-1/2'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5' />
            <Input
              type='text'
              placeholder='Search menu items by name...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-10'
            />
          </div>
          <select
            className='border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-[160px]'
            value={selectedItemType}
            onChange={(e) => setSelectedItemType(e.target.value)}>
            {itemTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            className='border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white min-w-[160px]'
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        {/* End Filter Bar */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Removed aside with categories */}
          <main className='md:col-span-4'>
            {/* Removed old search input here, now in filter bar above */}
            {filteredMenuItems.length > 0 ? (
              <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
                {filteredMenuItems.map((item) => {
                  const quantity = getCartItemQuantity(item._id);
                  return (
                    <Card
                      key={item._id}
                      className='flex flex-col rounded-2xl shadow-lg overflow-hidden bg-white dark:bg-gray-900 border-0 relative'>
                      <div className='relative w-full h-48'>
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            style={{ objectFit: 'cover' }}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center'>
                            <Utensils className='w-12 h-12 text-gray-400' />
                          </div>
                        )}
                        {/* Top-left Active badge */}
                        <div className='absolute top-3 left-3 z-10'>
                          <Badge className='bg-green-500 text-white rounded-full px-3 py-1 text-xs shadow'>
                            Active
                          </Badge>
                        </div>
                        {/* Top-right VEG/NON-VEG badge */}
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
                          <span className='text-gray-500 text-sm dark:text-gray-300'>
                            {item.description
                              ? item.description
                              : 'No description available'}
                          </span>
                        </div>
                        <div className='flex items-center gap-2 mt-2'>
                          <span className='font-bold text-orange-500 text-lg'>
                            ₹{item.price || 'N/A'}
                          </span>
                          <Badge className='bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-medium ml-2'>
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
    </div>
  );
};

export default CanteenMenuPage;
