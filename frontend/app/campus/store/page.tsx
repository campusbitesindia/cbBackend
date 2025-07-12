'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import {
  Search,
  Filter,
  Store,
  MapPin,
  Clock,
  Loader2,
  Star,
  Phone,
  Mail,
  ExternalLink,
  Heart,
  Utensils,
  ChefHat,
  Sparkles,
} from 'lucide-react';

interface FoodVendor {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  location: string;
  operatingHours: string;
  rating: number;
  image: string;
  phone: string;
  email: string;
  isOpen: boolean;
  specialties: string[];
  priceRange: 'Budget' | 'Moderate' | 'Premium';
}

export default function CampusStorePage() {
  const [vendors, setVendors] = useState<FoodVendor[]>([]);
  const [filteredVendors, setFilteredVendors] = useState<FoodVendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { toast } = useToast();

  const cuisines = [
    'all',
    'indian',
    'chinese',
    'italian',
    'continental',
    'fast-food',
    'beverages',
    'desserts',
    'multi-cuisine',
  ];

  const priceRanges = ['all', 'budget', 'moderate', 'premium'];

  // Animation variants
  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  const searchVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 120,
        damping: 20,
      },
    },
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
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
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

  useEffect(() => {
    async function fetchVendors() {
      try {
        setIsLoading(true);
        // Simulate API call - replace with actual API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Sample vendor data
        const sampleVendors: FoodVendor[] = [
          {
            id: 1,
            name: 'Spice Garden',
            description:
              'Authentic North Indian cuisine with fresh ingredients and traditional recipes. Famous for butter chicken and naan bread.',
            cuisine: 'indian',
            location: 'Block A, Student Center',
            operatingHours: '9:00 AM - 11:00 PM',
            rating: 4.5,
            image:
              'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop',
            phone: '+91 98765 43210',
            email: 'spicegarden@campus.edu',
            isOpen: true,
            specialties: ['Butter Chicken', 'Biryani', 'Naan Bread'],
            priceRange: 'Moderate',
          },
          {
            id: 2,
            name: 'Pizza Corner',
            description:
              'Wood-fired pizzas with fresh toppings and crispy crust. Perfect for quick meals and group orders.',
            cuisine: 'italian',
            location: 'Block B, Food Court',
            operatingHours: '11:00 AM - 12:00 AM',
            rating: 4.2,
            image:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            phone: '+91 98765 43211',
            email: 'pizzacorner@campus.edu',
            isOpen: true,
            specialties: [
              'Margherita Pizza',
              'Pepperoni Pizza',
              'Garlic Bread',
            ],
            priceRange: 'Budget',
          },
          {
            id: 3,
            name: 'Healthy Bites',
            description:
              'Nutritious and delicious meals focused on health-conscious students. Fresh salads and protein-rich options.',
            cuisine: 'continental',
            location: 'Block C, Health Center',
            operatingHours: '7:00 AM - 10:00 PM',
            rating: 4.7,
            image:
              'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop',
            phone: '+91 98765 43212',
            email: 'healthybites@campus.edu',
            isOpen: true,
            specialties: ['Quinoa Bowl', 'Grilled Chicken', 'Smoothies'],
            priceRange: 'Premium',
          },
          {
            id: 4,
            name: 'Wok & Roll',
            description:
              'Authentic Chinese cuisine with wok-fried dishes and traditional flavors. Quick service and generous portions.',
            cuisine: 'chinese',
            location: 'Block D, International Hub',
            operatingHours: '10:00 AM - 11:00 PM',
            rating: 4.3,
            image:
              'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
            phone: '+91 98765 43213',
            email: 'wokandroll@campus.edu',
            isOpen: false,
            specialties: ['Fried Rice', 'Noodles', 'Spring Rolls'],
            priceRange: 'Budget',
          },
          {
            id: 5,
            name: 'Burger Junction',
            description:
              'Juicy burgers with fresh buns and premium ingredients. Perfect for quick bites between classes.',
            cuisine: 'fast-food',
            location: 'Block E, Sports Complex',
            operatingHours: '10:00 AM - 11:00 PM',
            rating: 4.0,
            image:
              'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400&h=300&fit=crop',
            phone: '+91 98765 43214',
            email: 'burgerjunction@campus.edu',
            isOpen: true,
            specialties: ['Classic Burger', 'Chicken Burger', 'French Fries'],
            priceRange: 'Budget',
          },
          {
            id: 6,
            name: 'Coffee House',
            description:
              'Premium coffee and tea with freshly baked pastries. Perfect study spot with comfortable seating.',
            cuisine: 'beverages',
            location: 'Library Building, Ground Floor',
            operatingHours: '7:00 AM - 9:00 PM',
            rating: 4.6,
            image:
              'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=300&fit=crop',
            phone: '+91 98765 43215',
            email: 'coffeehouse@campus.edu',
            isOpen: true,
            specialties: ['Cappuccino', 'Croissants', 'Sandwiches'],
            priceRange: 'Moderate',
          },
          {
            id: 7,
            name: 'Sweet Treats',
            description:
              'Artisanal desserts and pastries made fresh daily. Perfect for celebrations and sweet cravings.',
            cuisine: 'desserts',
            location: 'Block F, Student Union',
            operatingHours: '9:00 AM - 8:00 PM',
            rating: 4.8,
            image:
              'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop',
            phone: '+91 98765 43216',
            email: 'sweettreats@campus.edu',
            isOpen: true,
            specialties: ['Chocolate Cake', 'Ice Cream', 'Cupcakes'],
            priceRange: 'Premium',
          },
          {
            id: 8,
            name: 'Global Kitchen',
            description:
              'Multi-cuisine restaurant offering dishes from around the world. Perfect for diverse taste preferences.',
            cuisine: 'multi-cuisine',
            location: 'Block G, International Center',
            operatingHours: '11:00 AM - 11:00 PM',
            rating: 4.4,
            image:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            phone: '+91 98765 43217',
            email: 'globalkitchen@campus.edu',
            isOpen: true,
            specialties: ['Pasta', 'Curry', 'Salads'],
            priceRange: 'Moderate',
          },
        ];

        setVendors(sampleVendors);
        setFilteredVendors(sampleVendors);
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast({
          variant: 'destructive',
          title: 'Failed to load vendors',
          description: 'Please try again later.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendors();
  }, [toast]);

  useEffect(() => {
    let filtered = vendors;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          vendor.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          vendor.specialties.some((specialty) =>
            specialty.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    // Filter by cuisine
    if (selectedCuisine !== 'all') {
      filtered = filtered.filter(
        (vendor) => vendor.cuisine === selectedCuisine
      );
    }

    // Filter by price range
    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(
        (vendor) => vendor.priceRange.toLowerCase() === selectedPriceRange
      );
    }

    setFilteredVendors(filtered);
  }, [vendors, searchQuery, selectedCuisine, selectedPriceRange]);

  const handleOrderNow = (vendor: FoodVendor) => {
    // Navigate to vendor's menu page or open ordering interface
    toast({
      title: `Ordering from ${vendor.name}`,
      description: 'Redirecting to menu...',
    });
    // Add navigation logic here
  };

  const getPriceRangeColor = (priceRange: string) => {
    switch (priceRange.toLowerCase()) {
      case 'budget':
        return 'bg-green-100 text-green-800';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800';
      case 'premium':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderVendorsContent = () => {
    if (isLoading) {
      return (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-primary' />
          <span className='ml-2 text-lg'>Loading vendors...</span>
        </div>
      );
    }

    if (filteredVendors.length === 0) {
      return (
        <div className='text-center py-12'>
          <Store className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No vendors found
          </h3>
          <p className='text-gray-500'>
            {searchQuery
              ? 'Try adjusting your search terms'
              : 'No vendors available at the moment'}
          </p>
        </div>
      );
    }

    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {filteredVendors.map((vendor, index) => (
          <div key={vendor.id} className='group relative'>
            <Card className='bg-white/10 backdrop-blur-xl border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-500 h-full'>
              <div className='relative overflow-hidden'>
                <div className='relative'>
                  <img
                    src={vendor.image}
                    alt={vendor.name}
                    className='w-full h-64 object-cover'
                  />

                  {/* Cinematic overlay */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
                </div>

                {/* Floating badges */}
                <div className='absolute top-4 left-4 flex flex-col gap-2'>
                  <div>
                    <Badge className='bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-3 py-1 shadow-lg'>
                      {vendor.priceRange}
                    </Badge>
                  </div>
                </div>

                {/* Heart button */}
                <div className='absolute top-4 right-4'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='border-white/30 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 rounded-full w-10 h-10 p-0'>
                    <Heart className='w-4 h-4' />
                  </Button>
                </div>

                {/* Closed overlay */}
                {!vendor.isOpen && (
                  <div className='absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center'>
                    <Badge
                      variant='destructive'
                      className='text-lg px-6 py-2 font-bold'>
                      Closed
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className='pb-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <CardTitle className='text-2xl text-white mb-2 group-hover:text-red-200 transition-colors flex items-center gap-2'>
                      {vendor.name}
                      <span className='ml-2 px-2 py-0.5 rounded bg-white/10 text-xs text-gray-400'>
                        ID: {vendor.id}
                      </span>
                    </CardTitle>
                    <CardDescription className='text-gray-300 flex items-center gap-2'>
                      <ChefHat className='w-4 h-4' />
                      {vendor.cuisine}
                    </CardDescription>
                  </div>
                  <div className='flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full'>
                    <Star className='w-4 h-4 text-yellow-400 fill-current' />
                    <span className='text-white font-bold'>
                      {vendor.rating}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className='pt-0'>
                <p className='text-sm text-gray-300 line-clamp-2 mb-4'>
                  {vendor.description}
                </p>

                <div className='flex items-center justify-between text-sm text-gray-300 mb-4'>
                  <div className='flex items-center gap-2'>
                    <Clock className='w-4 w-4 text-purple-400' />
                    <span>{vendor.operatingHours}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <MapPin className='w-4 w-4 text-purple-400' />
                    <span>{vendor.location}</span>
                  </div>
                </div>

                <div className='mb-4'>
                  <p className='text-sm font-medium text-gray-300 mb-2'>
                    Specialties:
                  </p>
                  <div className='flex flex-wrap gap-1'>
                    {vendor.specialties.slice(0, 3).map((specialty, index) => (
                      <Badge
                        key={index}
                        variant='outline'
                        className='text-xs bg-white/10 border-white/20 text-white'>
                        {specialty}
                      </Badge>
                    ))}
                    {vendor.specialties.length > 3 && (
                      <Badge
                        variant='outline'
                        className='text-xs bg-white/10 border-white/20 text-white'>
                        +{vendor.specialties.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                <Link href={`/menu/${vendor.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    <Button className='w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-red-500/25' disabled={!vendor.isOpen}>
                      <Utensils className='w-5 h-5 mr-2' />
                      {vendor.isOpen ? 'View Menu' : 'Closed'}
                    </Button>
                  </motion.div>
                </Link>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-[#0a192f] via-[#1e3a5f] to-[#0f172a] relative overflow-hidden'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          variants={floatingVariants}
          animate='animate'
          className='absolute top-20 left-20 w-32 h-32 bg-red-500/10 rounded-full blur-xl'
        />
        <motion.div
          variants={floatingVariants}
          animate='animate'
          style={{ animationDelay: '2s' }}
          className='absolute top-40 right-32 w-24 h-24 bg-red-500/15 rounded-full blur-xl'
        />
        <motion.div
          variants={floatingVariants}
          animate='animate'
          style={{ animationDelay: '4s' }}
          className='absolute bottom-32 left-16 w-40 h-40 bg-white/5 rounded-full blur-2xl'
        />

        {/* Subtle light rays */}
        <motion.div
          initial={{ opacity: 0, rotate: 0 }}
          animate={{ opacity: [0.05, 0.15, 0.05], rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className='absolute top-0 left-1/2 w-96 h-96 bg-gradient-conic from-red-500/10 via-transparent to-red-500/10 -translate-x-1/2 -translate-y-1/2'
        />
      </div>

      <div className='relative z-10'>
        {/* Header */}
        <motion.section
          initial='hidden'
          animate='visible'
          variants={searchVariants}
          className='pt-24 pb-16 px-6'>
          <div className='max-w-7xl mx-auto text-center'>
            <motion.div
              initial={{ opacity: 0, y: -30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
              className='mb-8'>
              <h1 className='text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-white via-red-200 to-rose-200 bg-clip-text text-transparent'>
                Campus Food Vendors
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className='w-24 h-1 bg-gradient-to-r from-red-500 to-rose-500 mx-auto mb-6'
              />
              <p className='text-xl text-gray-300 max-w-2xl mx-auto font-light'>
                Discover and order from the best food outlets on campus
              </p>
              <div className='flex items-center justify-center gap-4 mt-4 text-sm text-gray-400'>
                <div className='flex items-center gap-1'>
                  <Store className='h-4 w-4' />
                  <span>{filteredVendors.length} vendors available</span>
                </div>
                <div className='flex items-center gap-1'>
                  <Clock className='h-4 w-4' />
                  <span>Order anytime</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Cinematic Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className='relative max-w-2xl mx-auto px-6 pb-8'>
          <div className='relative group'>
            <Search className='absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 group-hover:text-red-400 transition-colors duration-300' />
            <Input
              type='text'
              placeholder='Search vendors, cuisines, or specialties...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-16 pr-6 py-6 bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl text-white placeholder-gray-400 text-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 hover:bg-white/15'
            />
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: searchQuery ? 1 : 0 }}
              className='absolute right-6 top-1/2 transform -translate-y-1/2'>
              <Sparkles className='w-5 h-5 text-red-400' />
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className='px-6 pb-8'>
          <div className='max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center'>
            {/* Cuisine Filter */}
            <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
              <SelectTrigger className='w-full sm:w-48 bg-white/10 backdrop-blur-xl border-white/20 text-white focus:ring-2 focus:ring-red-500'>
                <Filter className='h-4 w-4 mr-2' />
                <SelectValue placeholder='Cuisine' />
              </SelectTrigger>
              <SelectContent>
                {cuisines.map((cuisine) => (
                  <SelectItem key={cuisine} value={cuisine}>
                    {cuisine === 'all'
                      ? 'All Cuisines'
                      : cuisine
                          .split('-')
                          .map(
                            (word) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Range Filter */}
            <Select
              value={selectedPriceRange}
              onValueChange={setSelectedPriceRange}>
              <SelectTrigger className='w-full sm:w-48 bg-white/10 backdrop-blur-xl border-white/20 text-white focus:ring-2 focus:ring-red-500'>
                <SelectValue placeholder='Price Range' />
              </SelectTrigger>
              <SelectContent>
                {priceRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range === 'all'
                      ? 'All Prices'
                      : range.charAt(0).toUpperCase() + range.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Vendors Grid */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {renderVendorsContent()}
        </div>
      </div>
    </div>
  );
}
