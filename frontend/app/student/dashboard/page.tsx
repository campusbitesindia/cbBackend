'use client';

import { useState, useEffect } from 'react';
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
  ShoppingCart,
  Star,
  Clock,
  MapPin,
  Filter,
  Heart,
  Users,
  Zap,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Canteen } from '@/types';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { StudentOnlyRoute } from '@/components/RouteProtection';
import NotificationList from '@/components/notification-list';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

function StudentDashboardContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [restaurants, setRestaurants] = useState<Canteen[]>([]);
  const [userCampusId, setUserCampusId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGroupOrderModalOpen, setIsGroupOrderModalOpen] = useState(false);
  const [selectedCanteen, setSelectedCanteen] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newGroupOrderDetails, setNewGroupOrderDetails] = useState<{
    groupOrderId: string;
    groupLink: string;
    qrCodeUrl: string;
  } | null>(null);
  const { cart } = useCart();
  const { token, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Fetch user profile to get campus ID
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;

      try {
        setError(null);
        const response = await fetch(
          'https://campusbites-mxpe.onrender.com/api/v1/users/profile',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user profile');
        }

        const data = await response.json();
        console.log('User Profile:', data);

        if (data.success && data.user?.campus?._id) {
          setUserCampusId(data.user.campus._id);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, [token]);

  const handleCreateGroupOrder = async () => {
    if (!selectedCanteen) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a canteen to create a group order.',
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please log in to create a group order.',
      });
      return;
    }

    setIsCreatingOrder(true);
    try {
      const res = await fetch(
        'https://campusbites-mxpe.onrender.com/api/v1/groupOrder/create-order',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ canteen: selectedCanteen }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create group order');
      }

      const data = await res.json();
      setNewGroupOrderDetails(data.data);
      toast({
        title: 'Group Order Created!',
        description: 'Share the link or QR code with your friends.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating group order',
        description: (error as Error).message,
      });
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const resetGroupOrderFlow = () => {
    setSelectedCanteen(null);
    setNewGroupOrderDetails(null);
    setIsGroupOrderModalOpen(false);
  };

  const fetchCanteens = async () => {
    setLoading(true)
    try{
      const response = await axios.get(`https://campusbites-mxpe.onrender.com/api/v1/canteens?campus=${userCampusId}`)
      if(response?.status === 200) {
           const processedCanteens =
        response?.data?.canteens?.map((canteen: any) => ({
          ...canteen,
          image:
            canteen.owner?.profileImage ||
            canteen.image ||
            '/placeholder.svg',
        })) || [];
        setRestaurants(processedCanteens);
        setLoading(false);
      }
    } catch {
      setLoading(false);
      ('Failed to load restaurants');
      setRestaurants([]);
    }
  };

  // Fetch canteens based on campus
  useEffect(() => {
    if(userCampusId) {

      fetchCanteens();
    }
  }, [userCampusId]);

  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'indian', name: 'Indian', icon: '🍛' },
    { id: 'italian', name: 'Italian', icon: '🍕' },
    { id: 'healthy', name: 'Healthy', icon: '🥗' },
    { id: 'american', name: 'American', icon: '🍔' },
    { id: 'chinese', name: 'Chinese', icon: '🥡' },
  ];

  const filteredRestaurants =
    restaurants?.filter((restaurant) => {
      const matchesSearch =
        restaurant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant?.cuisine?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' ||
        restaurant?.cuisine?.toLowerCase() === selectedCategory;
      return matchesSearch && matchesCategory;
    }) || [];

  // Loading state
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center'>
         <div className='w-12 h-12 border-4 border-t-transparent border-white rounded-full animate-spin mb-4'></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-400 text-xl mb-4'>{error}</div>
          <Button
            onClick={() => window.location.reload()}
            className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'>
            Retry
          </Button>
        </div>
      </div>
    );
  }
  const handleClick = () => {
    setLoading(true);

    // Simulate an async action (like API call)
    setTimeout(() => {
      setLoading(false);
      // Add your actual order logic here
      console.log('Order placed!');
    }, 1000);
  };

  return (
    <div className='min-h-screen bg-background'>
      {/* Background Elements */}
      <div className='absolute inset-0 overflow-hidden -z-10'>
        {/* Light mode background */}
        <div className='absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:opacity-0 opacity-100 transition-opacity duration-1000'>
          <div className='absolute top-0 -left-4 w-72 h-72 bg-purple-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob'></div>
          <div className='absolute top-0 -right-4 w-72 h-72 bg-yellow-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000'></div>
          <div className='absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000'></div>
        </div>
        {/* Dark mode background */}
        <div className='absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black opacity-0 dark:opacity-100 transition-opacity duration-1000'>
          <div className='absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute bottom-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-full blur-2xl animate-pulse delay-1000'></div>
        </div>

        {/* Floating food icons - theme aware */}
        <div className='absolute top-20 left-20 w-16 h-16 bg-blue-500/10 dark:bg-blue-500/20 rounded-full flex items-center justify-center animate-float'>
          <span className='text-2xl'>🍕</span>
        </div>
        <div className='absolute top-40 right-32 w-12 h-12 bg-purple-500/10 dark:bg-purple-500/20 rounded-full flex items-center justify-center animate-float-delayed'>
          <span className='text-xl'>🍔</span>
        </div>
        <div className='absolute bottom-32 left-16 w-14 h-14 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center animate-bounce-slow'>
          <span className='text-xl'>🌮</span>
        </div>
      </div>

      <div className='relative p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-12'>
            <div className='flex items-center justify-between mb-8'>
              <div>
                <h1 className='text-4xl font-bold text-foreground mb-2'>
                  Hey there,{' '}
                  <span className='bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent'>
                    Student!
                  </span>
                </h1>
                <p className='text-muted-foreground text-lg'>
                  What are you craving today?
                </p>
              </div>
              <Link href='/cart'>
                <Button className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:scale-105'>
                  <ShoppingCart className='w-5 h-5 mr-2' />
                  Cart ({cartItemsCount})
                </Button>
              </Link>
            </div>

            {/* Search Bar */}
            <div className='relative max-w-2xl mx-auto mb-8'>
              <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6' />
              <Input
                type='text'
                placeholder='Search for restaurants, cuisines, or dishes...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='w-full pl-12 pr-16 py-4 bg-background/50 border-border rounded-2xl text-foreground placeholder-muted-foreground text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm'
              />
              <Button className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl px-4'>
                <Filter className='w-5 h-5' />
              </Button>
            </div>

            {/* Categories */}
            <div className='flex flex-wrap justify-center gap-4 mb-8'>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  variant={
                    selectedCategory === category.id ? 'default' : 'outline'
                  }
                  className={`${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                      : 'border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground bg-transparent'
                  } rounded-full px-6 py-3 transition-all duration-300 hover:scale-105 font-semibold`}>
                  <span className='mr-2'>{category.icon}</span>
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Group Order Banner */}
          <div className='mb-12'>
            <Card className='border border-red-500 bg-red-600 shadow-xl text-white'>
              <CardContent className='flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4'>
                <div className='flex items-center gap-4'>
                  <Users className='w-8 h-8' />
                  <div>
                    <h3 className='text-xl font-bold'>Order with Friends!</h3>
                    <p className='text-sm opacity-90'>
                      Start a group order and save on delivery fees. Everyone
                      pays for their own items!
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setIsGroupOrderModalOpen(true)}
                  variant='secondary'
                  className='bg-white text-red-600 hover:bg-gray-100 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105'>
                  <Users className='w-4 h-4 mr-2' />
                  Create Group Order
                </Button>
              </CardContent>
            </Card>

            {/* Group Order Modal */}
            <Dialog
              open={isGroupOrderModalOpen}
              onOpenChange={setIsGroupOrderModalOpen}>
              <DialogContent className='sm:max-w-[425px] bg-background text-foreground border-border'>
                <DialogHeader>
                  <DialogTitle className='text-2xl font-bold text-center bg-gradient-to-r from-red-500 to-red-500 bg-clip-text text-transparent pb-2'>
                    Start a New Group Order
                  </DialogTitle>
                  <DialogDescription className='text-muted-foreground text-center'>
                    {newGroupOrderDetails
                      ? 'Share this link or QR code with your friends to join the order.'
                      : 'Select a canteen to create a group order.'}
                  </DialogDescription>
                </DialogHeader>

                {!newGroupOrderDetails ? (
                  <div className='space-y-6 py-4'>
                    <div>
                      <Label
                        htmlFor='canteen-select'
                        className='mb-2 block text-foreground'>
                        Select Canteen
                      </Label>
                      <Select
                        value={selectedCanteen || ''}
                        onValueChange={setSelectedCanteen}>
                        <SelectTrigger
                          id='canteen-select'
                          className='w-full bg-input border-border text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-red-500 focus:border-transparent'>
                          <SelectValue
                            placeholder='Choose a Canteen'
                            className='text-foreground'
                          />
                        </SelectTrigger>
                        <SelectContent className='bg-background border-border text-foreground'>
                          {restaurants.map((canteen) => (
                            <SelectItem
                              key={canteen._id}
                              value={canteen._id}
                              className='hover:bg-gray-700 focus:bg-gray-700'>
                              {canteen.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className='flex justify-end gap-3 pt-2'>
                      <Button
                        variant='outline'
                        onClick={() => setIsGroupOrderModalOpen(false)}
                        className='text-gray-300 border-gray-600 hover:bg-gray-700'>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateGroupOrder}
                        disabled={isCreatingOrder || !selectedCanteen}
                        className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 flex-1'>
                        {isCreatingOrder ? (
                          <>
                            <svg
                              className='animate-spin -ml-1 mr-2 h-5 w-5 text-white'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'>
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'></circle>
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                            </svg>
                            Creating...
                          </>
                        ) : (
                          'Create Group Order'
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-6 text-center py-4'>
                    <h2 className='text-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-400 bg-clip-text text-transparent'>
                      Group Order Created! 🎉
                    </h2>
                    {newGroupOrderDetails.qrCodeUrl && (
                      <div className='mt-4 flex flex-col items-center'>
                        <div className='p-4 bg-white rounded-lg shadow-lg'>
                          <Image
                            src={newGroupOrderDetails.qrCodeUrl}
                            alt='Group Order QR Code'
                            width={200}
                            height={200}
                            className='rounded'
                          />
                        </div>
                        <p className='text-sm text-gray-400 mt-3'>
                          Scan QR code to join
                        </p>
                      </div>
                    )}

                    <div className='bg-gray-700 p-4 rounded-lg border border-gray-600 break-words'>
                      <Label className='block text-gray-300 text-sm font-medium mb-2'>
                        Group Link:
                      </Label>
                      <div className='bg-gray-800 p-3 rounded border border-gray-600 mb-3'>
                        <p className='text-red-400 font-mono text-sm break-all'>
                          {`https://campus-bites-c7pe.vercel.app//group-order?link=${newGroupOrderDetails.groupLink}`}
                        </p>
                      </div>
                      <div className='flex gap-3 justify-center'>
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(
                              `https://campus-bites-c7pe.vercel.app//group-order?link=${newGroupOrderDetails.groupLink}`
                            );
                            toast({
                              description: 'Link copied to clipboard!',
                              className: 'bg-green-600 text-white border-0',
                            });
                          }}
                          variant='outline'
                          size='sm'
                          className='text-gray-300 border-gray-600 hover:bg-gray-700 flex items-center gap-2'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                            />
                          </svg>
                          Copy Link
                        </Button>
                        <Link
                          href={`/group-order?link=${newGroupOrderDetails.groupLink}`}
                          passHref>
                          <Button
                            size='sm'
                            className='bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold'>
                            Go to Group Order
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* All Restaurants */}
          <div>
            <h2 className='text-2xl font-bold text-white mb-6'>
              All Restaurants
            </h2>
            <div className='grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {filteredRestaurants?.map((restaurant) => (
                <Card
                key={restaurant._id}
                className='bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-700/30 backdrop-blur-xl hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-105 group overflow-hidden'>              
                  <div className='relative'>
                    <Image
                      src={restaurant.image || '/placeholder.svg'}
                      alt={restaurant.name || 'Restaurant'}
                      width={300}
                      height={200}
                      className='w-full h-32 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-300'
                    />
                    {restaurant.discount && (
                      <Badge className='absolute top-3 left-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold px-3 py-1'>
                        {restaurant.discount}
                      </Badge>
                    )}
                    {restaurant.featured && (
                      <Badge className='absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1'>
                        ⭐ Featured
                      </Badge>
                    )}
                    <Button
                      size='sm'
                      variant='outline'
                      className='absolute bottom-3 right-3 border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'>
                      <Heart className='w-4 h-4' />
                    </Button>
                    {!restaurant.isOpen && (
                      <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                        <Badge
                          variant='destructive'
                          className='text-lg px-4 py-2'>
                          Closed
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between'>
                      <div>
                        <CardTitle className='text-lg text-black dark:text-white mb-1'>
                          {restaurant.name}
                        </CardTitle>
                        <CardDescription className='text-gray-600 dark:text-gray-400'>
                          {restaurant.cuisine}
                        </CardDescription>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Star className='w-4 h-4 text-yellow-400 fill-current' />
                        <span className='text-white font-semibold text-sm'>
                          {restaurant.rating}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className='pt-0'>
                    <div className='flex items-center justify-between text-sm text-gray-400 mb-4'>
                      <div className='flex items-center gap-1'>
                        <Clock className='w-4 h-4' />
                        <span>{restaurant.deliveryTime}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <MapPin className='w-4 h-4' />
                        <span>{restaurant.distance}</span>
                      </div>
                    </div>
                    <Link href={`/menu/${restaurant._id}`}>
                    <Button
      className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-2 rounded-xl transition-all duration-300 ${
        !restaurant.isOpen || loading ? 'opacity-70 cursor-not-allowed' : ''
      }`}
      disabled={!restaurant.isOpen || loading}
      onClick={handleClick}
    >
      {loading && (
        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
      )}
      {restaurant.isOpen ? (loading ? 'Ordering...' : 'Order Now') : 'Closed'}
    </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {filteredRestaurants?.length === 0 && (
            <div className='text-center py-12'>
              <div className='w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6'>
                <Search className='w-12 h-12 text-gray-400' />
              </div>
              <h3 className='text-2xl font-bold text-white mb-2'>
                No restaurants found
              </h3>
              <p className='text-gray-400'>
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <StudentOnlyRoute>
      <StudentDashboardContent />
    </StudentOnlyRoute>
  );
}
