'use client';

import { useState, useEffect } from 'react';
import { RouteProtection } from '@/components/RouteProtection';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Star,
  Clock,
  MapPin,
  Heart,
  Utensils,
  ChefHat,
  Sparkles,
  Badge as BadgeIcon,
  Users,
  TrendingUp,
  Award,
  Zap,
  Shield,
  CheckCircle,
  Router,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { API_ENDPOINTS } from '@/lib/constants';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

interface Campus {
  _id: string;
  name: string;
  code: string;
  city: string;
}

interface Owner {
  _id: string;
  name: string;
  email: string;
}

interface Canteen {
  _id: string;
  name: string;
  campus: Campus;
  owner: Owner | null;
  isOpen: boolean;
  items: any[];
  images: string[];
  isDeleted: boolean;
  isApproved: boolean;
  isBanned?: boolean;
  isSuspended: boolean;
  cuisine?: string;
  rating?: number;
  deliveryTime?: string;
  distance?: string;
  featured?: boolean;
  discount?: string | null;
  description?: string;
  createdAt: string;
  updatedAt: string;
  approvalStatus: string;
  approvedAt?: string;
  approvedBy?: string;
}

const CUISINE_FILTERS = [
  { value: 'all', label: 'All Cuisines', icon: '🍽️' },
  { value: 'Multi-Cuisine', label: 'Multi-Cuisine', icon: '🌍' },
  { value: 'Indian', label: 'Indian', icon: '🍛' },
  { value: 'Italian', label: 'Italian', icon: '🍕' },
  { value: 'Fast Food', label: 'Fast Food', icon: '🍔' },
  { value: 'Healthy', label: 'Healthy', icon: '🥗' },
  { value: 'Beverages', label: 'Beverages', icon: '☕' },
  { value: 'Mixed', label: 'Mixed', icon: '🍜' },
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured First' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'delivery', label: 'Fastest Delivery' },
  { value: 'discount', label: 'Best Offers' },
];

export default function MenuPage() {
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [filteredCanteens, setFilteredCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const router = useRouter();

  const { token } = useAuth();
  const fetchCanteens = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching canteens from:', API_ENDPOINTS.CANTEENS);
      const response = await fetch(API_ENDPOINTS.CANTEENS);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch canteens: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('📋 Received data:', data);

      const visibleCanteens = (data.canteens || []).filter(
        (c: Canteen) =>
          c.isApproved === true &&
          c.isBanned !== true &&
          c.isSuspended !== true &&
          c.isDeleted === false
      );
      console.log('📋 Visible canteens:', visibleCanteens);
      setCanteens(visibleCanteens);
      setFilteredCanteens(visibleCanteens);
    } catch (error) {
      console.error('❌ Error fetching canteens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      router.push('/student/dashboard');
      return;
    }
    fetchCanteens();
  }, []);

  useEffect(() => {
    let filtered = canteens.filter((canteen) => {
      const matchesSearch =
        canteen.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (canteen.cuisine || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (canteen.description || '')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        canteen.campus?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCuisine =
        selectedCuisine === 'all' ||
        (canteen.cuisine || 'Multi-Cuisine') === selectedCuisine;

      return matchesSearch && matchesCuisine;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          const aFeatured = a.featured || false;
          const bFeatured = b.featured || false;
          if (aFeatured !== bFeatured) return bFeatured ? 1 : -1;
          return (b.rating || 0) - (a.rating || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'delivery':
          const aTime = parseInt((a.deliveryTime || '30-40 min').split('-')[0]);
          const bTime = parseInt((b.deliveryTime || '30-40 min').split('-')[0]);
          return aTime - bTime;
        case 'discount':
          if (a.discount && !b.discount) return -1;
          if (!a.discount && b.discount) return 1;
          return 0;
        default:
          return 0;
      }
    });

    setFilteredCanteens(filtered);
  }, [searchQuery, selectedCuisine, sortBy, canteens]);

  const toggleFavorite = (canteenId: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(canteenId)) {
        newFavorites.delete(canteenId);
      } else {
        newFavorites.add(canteenId);
      }
      return newFavorites;
    });
  };

  const getCanteenImage = (canteen: Canteen) => {
    if (
      canteen.images &&
      canteen.images.length > 0 &&
      canteen.images[0] !== '/placeholder.jpg'
    ) {
      return canteen.images[0];
    }
    // Return cuisine-specific placeholder
    const cuisineImages: { [key: string]: string } = {
      'Multi-Cuisine': '🍽️',
      Indian: '🍛',
      Italian: '🍕',
      'Fast Food': '🍔',
      Healthy: '🥗',
      Beverages: '☕',
      Mixed: '🍜',
    };
    return cuisineImages[canteen.cuisine || 'Multi-Cuisine'] || '🍽️';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
        duration: 0.6,
      },
    },
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center'>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className='text-center'>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className='w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full mx-auto mb-4'
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className='text-slate-700 dark:text-slate-300 text-xl font-medium'>
            Discovering campus delicacies...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900'>
      {/* Hero Section */}
      <section className='relative pt-24 pb-12 px-6 overflow-hidden'>
        {/* Background Elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className='absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-r from-red-500/10 via-rose-500/10 to-pink-500/10 rounded-full blur-3xl'
          />
          <motion.div
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 180, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className='absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 rounded-full blur-3xl'
          />
        </div>

        <div className='relative z-10 max-w-7xl mx-auto text-center'>
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className='mb-8'>
            <h1 className='text-5xl md:text-7xl lg:text-8xl font-bold mb-6'>
              <span className='bg-gradient-to-r from-slate-900 via-red-600 to-rose-600 dark:from-white dark:via-red-300 dark:to-rose-300 bg-clip-text text-transparent'>
                Campus
              </span>
              <br />
              <span className='bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 dark:from-red-300 dark:via-rose-300 dark:to-pink-300 bg-clip-text text-transparent'>
                Delicacies
              </span>
            </h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className='w-32 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto mb-6'
            />
            <p className='text-xl md:text-2xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto font-light leading-relaxed'>
              Discover exceptional dining experiences across campus. From local
              favorites to international cuisines, all delivered fresh to your
              doorstep.
            </p>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className='flex flex-wrap justify-center gap-8 mb-12'>
            <div className='text-center'>
              <div className='text-3xl font-bold text-slate-900 dark:text-white'>
                {canteens.length}
              </div>
              <div className='text-slate-600 dark:text-slate-400 text-sm'>
                Active Canteens
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-slate-900 dark:text-white'>
                {canteens.filter((c) => c.isOpen).length}
              </div>
              <div className='text-slate-600 dark:text-slate-400 text-sm'>
                Open Now
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-slate-900 dark:text-white'>
                {canteens.filter((c) => c.featured).length}
              </div>
              <div className='text-slate-600 dark:text-slate-400 text-sm'>
                Featured
              </div>
            </div>
            <div className='text-center'>
              <div className='text-3xl font-bold text-slate-900 dark:text-white'>
                {canteens.length > 0
                  ? (
                      canteens
                        .filter((c) => c.rating)
                        .reduce((sum, c) => sum + (c.rating || 0), 0) /
                      canteens.filter((c) => c.rating).length
                    ).toFixed(1)
                  : '0.0'}
                ⭐
              </div>
              <div className='text-slate-600 dark:text-slate-400 text-sm'>
                Avg Rating
              </div>
            </div>
          </motion.div>

          {/* Search and Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className='max-w-4xl mx-auto'>
            <div className='bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-200/50 dark:border-slate-700/50'>
              {/* Search Bar */}
              <div className='relative mb-6'>
                <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
                <Input
                  type='text'
                  placeholder='Search canteens, cuisines, or locations...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='pl-12 pr-16 h-14 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent'
                />
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant='outline'
                  size='sm'
                  className='absolute right-2 top-2 h-10 px-4 bg-white dark:bg-slate-600 border-slate-200 dark:border-slate-500'>
                  <Filter className='w-4 h-4 mr-2' />
                  Filters
                </Button>
              </div>

              {/* Filter Options */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className='space-y-4'>
                    <Separator />

                    {/* Cuisine Filter */}
                    <div>
                      <h3 className='font-semibold text-slate-700 dark:text-slate-300 mb-3'>
                        Cuisine Type
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {CUISINE_FILTERS.map((cuisine) => (
                          <Button
                            key={cuisine.value}
                            onClick={() => {
                              // Toggle behavior: if already selected, go back to 'all', otherwise select this cuisine
                              if (
                                selectedCuisine === cuisine.value &&
                                cuisine.value !== 'all'
                              ) {
                                setSelectedCuisine('all');
                              } else {
                                setSelectedCuisine(cuisine.value);
                              }
                            }}
                            variant={
                              selectedCuisine === cuisine.value
                                ? 'default'
                                : 'outline'
                            }
                            size='sm'
                            className={`${
                              selectedCuisine === cuisine.value
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-600'
                            }`}>
                            <span className='mr-2'>{cuisine.icon}</span>
                            {cuisine.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <h3 className='font-semibold text-slate-700 dark:text-slate-300 mb-3'>
                        Sort By
                      </h3>
                      <div className='flex flex-wrap gap-2'>
                        {SORT_OPTIONS.map((option) => (
                          <Button
                            key={option.value}
                            onClick={() => {
                              // Toggle behavior: if already selected, go back to 'featured', otherwise select this option
                              if (
                                sortBy === option.value &&
                                option.value !== 'featured'
                              ) {
                                setSortBy('featured');
                              } else {
                                setSortBy(option.value);
                              }
                            }}
                            variant={
                              sortBy === option.value ? 'default' : 'outline'
                            }
                            size='sm'
                            className={`${
                              sortBy === option.value
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'hover:bg-slate-100 dark:hover:bg-slate-600'
                            }`}>
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className='px-6 pb-24'>
        <div className='max-w-7xl mx-auto'>
          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='flex items-center justify-between mb-8'>
            <div>
              <h2 className='text-2xl font-bold text-slate-900 dark:text-white mb-2'>
                Available Canteens
              </h2>
              <p className='text-slate-600 dark:text-slate-400'>
                {filteredCanteens.length} of {canteens.length} canteens
                {searchQuery && <span> matching "{searchQuery}"</span>}
              </p>
            </div>
          </motion.div>

          {/* Canteen Grid */}
          <AnimatePresence mode='wait'>
            {filteredCanteens.length > 0 ? (
              <motion.div
                key='canteens'
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {filteredCanteens.map((canteen, index) => (
                  <motion.div
                    key={canteen._id}
                    variants={cardVariants}
                    whileHover={{ y: -8, scale: 1.02 }}
                    onHoverStart={() => setHoveredCard(canteen._id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className='group'>
                    <Card className='bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 h-full'>
                      {/* Image Section */}
                      <div className='relative overflow-hidden h-48'>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          className='relative w-full h-full bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 flex items-center justify-center'>
                          <span className='text-6xl'>
                            {getCanteenImage(canteen)}
                          </span>

                          {/* Gradient Overlay */}
                          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                        </motion.div>

                        {/* Status Badges */}
                        <div className='absolute top-3 left-3 flex flex-col gap-2'>
                          {canteen.featured && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 }}>
                              <Badge className='bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 shadow-lg'>
                                <Award className='w-3 h-3 mr-1' />
                                Featured
                              </Badge>
                            </motion.div>
                          )}
                          {canteen.discount && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.1 }}>
                              <Badge className='bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold px-3 py-1 shadow-lg'>
                                <Zap className='w-3 h-3 mr-1' />
                                {canteen.discount}
                              </Badge>
                            </motion.div>
                          )}
                          {canteen.isApproved && (
                            <Badge className='bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium px-2 py-1'>
                              <CheckCircle className='w-3 h-3 mr-1' />
                              Verified
                            </Badge>
                          )}
                        </div>

                        {/* Favorite Button */}
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className='absolute top-3 right-3'>
                          <Button
                            onClick={() => toggleFavorite(canteen._id)}
                            size='sm'
                            variant='outline'
                            className='bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border-white/50 hover:bg-white dark:hover:bg-slate-700 rounded-full w-9 h-9 p-0'>
                            <Heart
                              className={`w-4 h-4 ${
                                favorites.has(canteen._id)
                                  ? 'fill-red-500 text-red-500'
                                  : 'text-slate-600 dark:text-slate-400'
                              }`}
                            />
                          </Button>
                        </motion.div>

                        {/* Closed Overlay */}
                        <AnimatePresence>
                          {!canteen.isOpen && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className='absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center'>
                              <Badge
                                variant='destructive'
                                className='text-lg px-4 py-2 font-bold'>
                                Currently Closed
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Content Section */}
                      <CardHeader className='pb-3'>
                        <div className='flex items-start justify-between mb-2'>
                          <CardTitle className='text-lg font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors leading-tight'>
                            {canteen.name}
                          </CardTitle>
                          {canteen.rating && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              className='flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full'>
                              <Star className='w-3 h-3 text-yellow-500 fill-current' />
                              <span className='text-sm font-bold text-slate-900 dark:text-white'>
                                {canteen.rating}
                              </span>
                            </motion.div>
                          )}
                        </div>

                        <div className='space-y-2'>
                          <CardDescription className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                            <ChefHat className='w-4 h-4 text-red-500' />
                            {canteen.cuisine || 'Multi-Cuisine'}
                          </CardDescription>

                          {canteen.description && (
                            <p className='text-xs text-slate-500 dark:text-slate-400 line-clamp-2'>
                              {canteen.description}
                            </p>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className='pt-0 pb-4'>
                        {/* Info Grid */}
                        <div className='grid grid-cols-2 gap-3 mb-4 text-sm'>
                          <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                            <Clock className='w-4 h-4 text-red-500' />
                            <span>{canteen.deliveryTime || '30-40 min'}</span>
                          </div>
                          <div className='flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                            <MapPin className='w-4 h-4 text-red-500' />
                            <span className='truncate'>
                              {canteen.distance || 'Campus'}
                            </span>
                          </div>
                          {canteen.campus && (
                            <div className='col-span-2 flex items-center gap-2 text-slate-600 dark:text-slate-400'>
                              <BadgeIcon className='w-4 h-4 text-red-500' />
                              <span className='truncate'>
                                {canteen.campus.name}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Button */}
                        <Link href={`/menu/${canteen._id}`}>
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}>
                            <Button
                              className={`w-full font-semibold py-2.5 rounded-lg transition-all duration-300 ${
                                canteen.isOpen
                                  ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-red-500/25'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                              }`}
                              disabled={!canteen.isOpen}>
                              <Utensils className='w-4 h-4 mr-2' />
                              {canteen.isOpen
                                ? 'Explore Menu'
                                : 'Currently Closed'}
                            </Button>
                          </motion.div>
                        </Link>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key='no-results'
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className='text-center py-20'>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 100, delay: 0.2 }}
                  className='w-32 h-32 bg-gradient-to-r from-red-500/20 to-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-8'>
                  <Search className='w-16 h-16 text-red-400' />
                </motion.div>
                <h3 className='text-3xl font-bold text-slate-900 dark:text-white mb-4'>
                  No canteens found
                </h3>
                <p className='text-slate-600 dark:text-slate-400 text-lg max-w-md mx-auto mb-6'>
                  Try adjusting your search criteria or filters to discover
                  amazing campus dining options
                </p>
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCuisine('all');
                    setSortBy('featured');
                  }}
                  variant='outline'
                  className='border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950'>
                  Clear All Filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
