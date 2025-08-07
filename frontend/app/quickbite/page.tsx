'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Add custom animations
const customStyles = `
  @keyframes gradient-x {
    0%, 100% {
      background-size: 200% 200%;
      background-position: left center;
    }
    50% {
      background-size: 200% 200%;
      background-position: right center;
    }
  }
  
  @keyframes fade-in-up {
    from {
      opacity: 0;
      transform: translate3d(0, 30px, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
  }
  
  .animate-gradient-x {
    animation: gradient-x 3s ease infinite;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.6s ease-out both;
  }
  
  .border-3 {
    border-width: 3px;
  }
`;
import {
  Clock,
  CheckCircle,
  Leaf,
  MapPin,
  Star,
  Search,
  Plus,
  Minus,
  X,
  Thermometer,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MenuItem, getReadyItemsOfAllCanteens } from '@/services/menuService';
import { getAllCampuses, Campus } from '@/services/campusService';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
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

interface QuickBiteItemProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  onUpdateQuantity: (item: MenuItem, quantity: number) => void;
  currentQuantity: number;
  onCanteenClick?: (canteenId: string) => void;
}

const QuickBiteItemCard: React.FC<QuickBiteItemProps> = ({
  item,
  onAddToCart,
  onUpdateQuantity,
  currentQuantity,
  onCanteenClick,
}) => {
  const canteenId =
    typeof item.canteen === 'object' && item.canteen && '_id' in item.canteen
      ? item.canteen._id
      : typeof item.canteen === 'string'
      ? item.canteen
      : '';

  const canteenName =
    typeof item.canteen === 'object' && item.canteen && 'name' in item.canteen
      ? item.canteen.name
      : 'Unknown Canteen';

  const isCanteenValid = canteenId && canteenName !== 'Unknown Canteen';
  return (
    <Card className='group relative overflow-hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-xl rounded-2xl transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10 dark:hover:shadow-red-400/10 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white dark:hover:bg-slate-800 w-full'>
      {/* Enhanced Image Section */}
      <div className='relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-800'>
        <div className='aspect-[5/4] relative overflow-hidden'>
          <img
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            className='w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:rotate-1'
          />
          <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent' />
          <div className='absolute inset-0 bg-gradient-to-br from-red-500/0 via-transparent to-orange-500/0 group-hover:from-red-500/10 group-hover:to-orange-500/10 transition-all duration-500' />
        </div>

        {/* Enhanced Status Badges */}
        <div className='absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-0'>
          {/* Ready Badge */}
          <span className='inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border border-emerald-400/50 backdrop-blur-sm shadow-lg shadow-emerald-500/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-emerald-500/40'>
            <CheckCircle className='w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse' />
            <span className='hidden sm:inline'>Ready Now!</span>
            <span className='sm:hidden'>Ready</span>
          </span>

          {/* Enhanced Veg/Non-Veg Badge */}
          <span
            className={`inline-flex items-center gap-1 sm:gap-1.5 text-xs font-bold px-2 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl backdrop-blur-sm border shadow-lg transition-all duration-300 group-hover:scale-105 ${
              item.isVeg
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400/50 shadow-green-500/25 group-hover:shadow-green-500/40'
                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white border-orange-400/50 shadow-orange-500/25 group-hover:shadow-orange-500/40'
            }`}>
            <Leaf
              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${
                !item.isVeg ? 'rotate-180' : ''
              } transition-transform duration-300`}
            />
            <span className='hidden sm:inline'>
              {item.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}
            </span>
            <span className='sm:hidden'>{item.isVeg ? '🥬' : '🍖'}</span>
          </span>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <CardContent className='p-3 sm:p-4 space-y-2 sm:space-y-3'>
        {/* Enhanced Header */}
        <div className='space-y-2'>
          <div className='space-y-1'>
            <h3 className='font-bold text-base sm:text-lg text-slate-900 dark:text-slate-100 leading-tight line-clamp-1 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300'>
              {item.name}
            </h3>
            {/* Enhanced Canteen Name */}
            <div className='flex items-center gap-1'>
              <MapPin
                className={`w-3 h-3 ${
                  isCanteenValid
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-red-400 dark:text-red-500'
                }`}
              />
              {isCanteenValid ? (
                <button
                  onClick={() => onCanteenClick?.(canteenId)}
                  className='text-xs text-slate-500 dark:text-slate-400 font-medium truncate hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200 hover:underline cursor-pointer'>
                  {canteenName}
                </button>
              ) : (
                <div className='flex items-center gap-1'>
                  <p className='text-xs text-red-500 dark:text-red-400 font-medium truncate'>
                    Canteen Unavailable
                  </p>
                  <span className='text-xs text-red-400'>⚠️</span>
                </div>
              )}
            </div>
          </div>
          {item.description && (
            <p className='text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed'>
              {item.description}
            </p>
          )}
        </div>

        {/* Enhanced Price, Rating and Category */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-lg sm:text-xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-orange-500 dark:from-red-400 dark:via-red-500 dark:to-orange-400 bg-clip-text text-transparent'>
                ₹{item.price}
              </span>
              <span className='text-xs text-slate-500 dark:text-slate-400 font-medium'></span>
            </div>

            {/* Rating Display */}
            <div className='flex items-center gap-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 px-2 py-1 rounded-full border border-yellow-400/30'>
              <Star className='w-3 h-3 fill-yellow-500 text-yellow-500' />
              <span className='text-xs font-bold text-yellow-600 dark:text-yellow-400'>
                {getItemRating(item).toFixed(1)}
              </span>
            </div>
          </div>

          <div className='flex items-center justify-between gap-1'>
            {item.category && (
              <Badge
                variant='secondary'
                className='text-xs bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 px-2 sm:px-3 py-1 rounded-full font-medium truncate flex-shrink-0'>
                <span className='truncate max-w-[60px] sm:max-w-none'>
                  {item.category}
                </span>
              </Badge>
            )}

            {/* Cuisine Badge - Hide Continental */}
            {getItemCuisine(item) !== 'Continental' && (
              <Badge
                variant='outline'
                className='text-xs bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 px-2 sm:px-3 py-1 rounded-full font-medium truncate flex-shrink-0'>
                <span className='truncate max-w-[60px] sm:max-w-none'>
                  {getItemCuisine(item)}
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Enhanced Add to Cart Button or Quantity Controls */}
        {currentQuantity === 0 ? (
          <Button
            onClick={() => onAddToCart(item)}
            disabled={!isCanteenValid}
            className={`w-full font-bold transition-all duration-300 rounded-xl shadow-lg py-2 sm:py-2.5 text-xs sm:text-sm ${
              isCanteenValid
                ? 'bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 dark:from-red-600 dark:via-red-700 dark:to-red-800 dark:hover:from-red-700 dark:hover:via-red-800 dark:hover:to-red-900 text-white hover:shadow-xl hover:shadow-red-500/25 dark:hover:shadow-red-400/25 hover:scale-105'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
            size='sm'>
            <div className='flex items-center gap-2'>
              <span></span>
              <span>{isCanteenValid ? 'Add' : 'Unavailable'}</span>
            </div>
          </Button>
        ) : (
          <div className='flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-600/50 rounded-xl p-2 sm:p-2.5 border border-slate-200/50 dark:border-slate-600/50'>
            <Button
              onClick={() => onUpdateQuantity(item, currentQuantity - 1)}
              variant='ghost'
              size='sm'
              className='h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg bg-white dark:bg-slate-600 shadow-lg hover:shadow-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-slate-500 border border-red-200 dark:border-red-700/50 transition-all duration-300 hover:scale-110'>
              <Minus className='h-4 w-4' />
            </Button>

            <div className='flex flex-col items-center px-2 sm:px-3'>
              <span className='text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100'>
                {currentQuantity}
              </span>
              <span className='text-xs text-slate-500 dark:text-slate-400 font-medium'>
                in cart 🛒
              </span>
            </div>

            <Button
              onClick={() => onUpdateQuantity(item, currentQuantity + 1)}
              variant='ghost'
              size='sm'
              className='h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg bg-white dark:bg-slate-600 shadow-lg hover:shadow-xl text-emerald-500 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-500 border border-emerald-200 dark:border-emerald-700/50 transition-all duration-300 hover:scale-110'>
              <Plus className='h-4 w-4' />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

type SortOption =
  | 'relevance'
  | 'name'
  | 'price-low'
  | 'price-high'
  | 'rating'
  | 'campus'
  | 'canteen'
  | 'category';

type DietType = 'all' | 'veg' | 'non-veg' | 'vegan';
type SpiceLevel = 'any' | 'mild' | 'medium' | 'spicy';

interface FilterState {
  searchQuery: string;
  selectedCanteens: string[];
  selectedCuisines: string[];
  dietType: DietType;
  spiceLevel: SpiceLevel;
  priceRange: [number, number];
  minRating: number;
  sortBy: SortOption;
}

// Mock data for cuisines (in real app, this would come from API)
const CUISINES = [
  'North Indian',
  'South Indian',
  'Chinese',
  'Italian',
  'Continental',
  'Fast Food',
  'Beverages',
  'Desserts',
  'Street Food',
  'Healthy',
];

// Mock function to get rating (in real app, this would be part of MenuItem)
const getItemRating = (item: MenuItem): number => {
  // Generate a mock rating based on item price and name
  const priceScore = Math.min(item.price / 100, 1);
  const nameScore = (item.name.length % 5) / 5;
  return Math.max(3, Math.min(5, 3.5 + priceScore + nameScore));
};

// Mock function to get cuisine (in real app, this would be part of MenuItem)
const getItemCuisine = (item: MenuItem): string => {
  const category = item.category?.toLowerCase() || '';
  if (category.includes('pizza') || category.includes('pasta'))
    return 'Italian';
  if (category.includes('noodles') || category.includes('fried rice'))
    return 'Chinese';
  if (category.includes('dosa') || category.includes('idli'))
    return 'South Indian';
  if (category.includes('roti') || category.includes('dal'))
    return 'North Indian';
  if (category.includes('burger') || category.includes('sandwich'))
    return 'Fast Food';
  if (category.includes('juice') || category.includes('coffee'))
    return 'Beverages';
  if (category.includes('ice cream') || category.includes('cake'))
    return 'Desserts';
  return 'Continental';
};

// Mock function to get spice level (in real app, this would be part of MenuItem)
const getItemSpiceLevel = (item: MenuItem): SpiceLevel => {
  const name = item.name.toLowerCase();
  if (name.includes('spicy') || name.includes('hot') || name.includes('chili'))
    return 'spicy';
  if (
    name.includes('mild') ||
    name.includes('sweet') ||
    name.includes('ice cream')
  )
    return 'mild';
  return 'medium';
};

export default function QuickBitePage() {
  const [readyItems, setReadyItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [showCanteenConflictDialog, setShowCanteenConflictDialog] =
    useState(false);
  const [pendingItem, setPendingItem] = useState<MenuItem | null>(null);

  const [availableCanteens, setAvailableCanteens] = useState<string[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCanteens: [],
    selectedCuisines: [],
    dietType: 'all',
    spiceLevel: 'any',
    priceRange: [10, 500],
    minRating: 0,
    sortBy: 'relevance',
  });

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addToCart, cart, removeFromCart } = useCart();
  const router = useRouter();

  // Load ready items on mount
  useEffect(() => {
    loadReadyItems();
  }, []);

  // Sync cart items (simplified version)
  useEffect(() => {
    // Initialize cart items state when component mounts
    setCartItems({});
  }, []);

  // Sort function
  const sortItems = (items: MenuItem[], sortOption: SortOption): MenuItem[] => {
    const sortedItems = [...items];

    switch (sortOption) {
      case 'relevance':
        // Sort by search query relevance, then by rating
        return sortedItems.sort((a, b) => {
          if (filters.searchQuery) {
            const queryLower = filters.searchQuery.toLowerCase();
            const aNameMatch = a.name.toLowerCase().includes(queryLower);
            const bNameMatch = b.name.toLowerCase().includes(queryLower);

            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;
          }

          // Secondary sort by rating
          return getItemRating(b) - getItemRating(a);
        });

      case 'name':
        return sortedItems.sort((a, b) => a.name.localeCompare(b.name));

      case 'price-low':
        return sortedItems.sort((a, b) => a.price - b.price);

      case 'price-high':
        return sortedItems.sort((a, b) => b.price - a.price);

      case 'rating':
        return sortedItems.sort((a, b) => getItemRating(b) - getItemRating(a));

      case 'campus':
        return sortedItems.sort((a, b) => {
          const campusA =
            typeof a.canteen === 'object' && a.canteen && 'campus' in a.canteen
              ? typeof a.canteen.campus === 'object' &&
                a.canteen.campus &&
                'name' in a.canteen.campus
                ? a.canteen.campus.name
                : String(a.canteen.campus)
              : 'Unknown Campus';
          const campusB =
            typeof b.canteen === 'object' && b.canteen && 'campus' in b.canteen
              ? typeof b.canteen.campus === 'object' &&
                b.canteen.campus &&
                'name' in b.canteen.campus
                ? b.canteen.campus.name
                : String(b.canteen.campus)
              : 'Unknown Campus';
          return campusA.localeCompare(campusB);
        });

      case 'canteen':
        return sortedItems.sort((a, b) => {
          const canteenA =
            typeof a.canteen === 'object' && a.canteen && 'name' in a.canteen
              ? a.canteen.name
              : 'Unknown Canteen';
          const canteenB =
            typeof b.canteen === 'object' && b.canteen && 'name' in b.canteen
              ? b.canteen.name
              : 'Unknown Canteen';
          return canteenA.localeCompare(canteenB);
        });

      case 'category':
        return sortedItems.sort((a, b) => {
          const categoryA = a.category || 'Other';
          const categoryB = b.category || 'Other';
          return categoryA.localeCompare(categoryB);
        });

      default:
        return sortedItems;
    }
  };

  // Comprehensive filter function
  const applyFilters = (items: MenuItem[]): MenuItem[] => {
    let filtered = [...items];

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          (item.description &&
            item.description.toLowerCase().includes(query)) ||
          (typeof item.canteen === 'object' &&
            item.canteen &&
            'name' in item.canteen &&
            item.canteen.name.toLowerCase().includes(query)) ||
          getItemCuisine(item).toLowerCase().includes(query)
      );
    }

    // Apply canteen filter
    if (filters.selectedCanteens.length > 0) {
      filtered = filtered.filter((item) => {
        const canteenName =
          typeof item.canteen === 'object' &&
          item.canteen &&
          'name' in item.canteen
            ? item.canteen.name
            : 'Unknown Canteen';
        return filters.selectedCanteens.includes(canteenName);
      });
    }

    // Apply cuisine filter
    if (filters.selectedCuisines.length > 0) {
      filtered = filtered.filter((item) =>
        filters.selectedCuisines.includes(getItemCuisine(item))
      );
    }

    // Apply diet type filter
    if (filters.dietType === 'veg') {
      filtered = filtered.filter((item) => item.isVeg);
    } else if (filters.dietType === 'non-veg') {
      filtered = filtered.filter((item) => !item.isVeg);
    } else if (filters.dietType === 'vegan') {
      // For now, treat vegan same as veg (in real app, would have separate vegan field)
      filtered = filtered.filter((item) => item.isVeg);
    }

    // Apply spice level filter
    if (filters.spiceLevel !== 'any') {
      filtered = filtered.filter(
        (item) => getItemSpiceLevel(item) === filters.spiceLevel
      );
    }

    // Apply price range filter
    filtered = filtered.filter(
      (item) =>
        item.price >= filters.priceRange[0] &&
        item.price <= filters.priceRange[1]
    );

    // Apply rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(
        (item) => getItemRating(item) >= filters.minRating
      );
    }

    // Apply sorting
    filtered = sortItems(filtered, filters.sortBy);

    return filtered;
  };

  // Filter and sort items based on all filters
  useEffect(() => {
    const filtered = applyFilters(readyItems);
    setFilteredItems(filtered);
  }, [readyItems, filters]);

  const loadReadyItems = async () => {
    setLoading(true);
    try {
      // Get all campuses first, then fetch items from all of them
      const campusResponse = await getAllCampuses();
      const campuses = campusResponse.campuses;

      // Fetch items from all campuses
      const allItems: MenuItem[] = [];

      for (const campus of campuses) {
        try {
          const items = await getReadyItemsOfAllCanteens(campus._id);
          if (items && items.length > 0) {
            allItems.push(...items);
          }
        } catch (error) {
          console.warn(
            `Failed to load items from campus ${campus.name}:`,
            error
          );
        }
      }

      // Filter out items with invalid canteen data
      const validItems = allItems.filter((item) => {
        const canteenId =
          typeof item.canteen === 'object' &&
          item.canteen &&
          '_id' in item.canteen
            ? item.canteen._id
            : typeof item.canteen === 'string'
            ? item.canteen
            : '';

        const canteenName =
          typeof item.canteen === 'object' &&
          item.canteen &&
          'name' in item.canteen
            ? item.canteen.name
            : 'Unknown Canteen';

        return canteenId && canteenName !== 'Unknown Canteen';
      });

      // Count invalid items for user feedback
      const invalidItemsCount = allItems.length - validItems.length;

      setReadyItems(validItems);

      // Extract available canteens
      const canteens = Array.from(
        new Set(
          validItems
            .map((item) =>
              typeof item.canteen === 'object' &&
              item.canteen &&
              'name' in item.canteen
                ? item.canteen.name
                : 'Unknown Canteen'
            )
            .filter((name) => name !== 'Unknown Canteen')
        )
      );
      setAvailableCanteens(canteens);

      // Show feedback about invalid items if any
      if (invalidItemsCount > 0) {
        toast({
          title: 'Some Items Filtered Out',
          description: `${invalidItemsCount} item${
            invalidItemsCount > 1 ? 's' : ''
          } with invalid canteen data ${
            invalidItemsCount > 1 ? 'were' : 'was'
          } filtered out.`,
          variant: 'default',
        });
      }

      // Show informative message if no valid items found
      if (validItems.length === 0) {
        toast({
          title: 'No Ready Items',
          description:
            'No ready items found across all campuses. Items may not be marked as ready yet.',
          variant: 'default',
        });
      }
    } catch (error: any) {
      console.error('Error loading ready items:', error);
      setReadyItems([]);
      toast({
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to load ready items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for filter management
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCanteens: [],
      selectedCuisines: [],
      dietType: 'all',
      spiceLevel: 'any',
      priceRange: [10, 500],
      minRating: 0,
      sortBy: 'relevance',
    });
  };

  const handleAddToCart = (item: MenuItem) => {
    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to add items to cart',
        variant: 'destructive',
      });
      return;
    }

    // Validate canteen information
    const canteenId =
      typeof item.canteen === 'object' && item.canteen && '_id' in item.canteen
        ? item.canteen._id
        : typeof item.canteen === 'string'
        ? item.canteen
        : '';

    const canteenName =
      typeof item.canteen === 'object' && item.canteen && 'name' in item.canteen
        ? item.canteen.name
        : 'Unknown Canteen';

    // Prevent adding items with invalid canteen data
    if (!canteenId || canteenName === 'Unknown Canteen') {
      toast({
        title: 'Canteen Not Available',
        description:
          'This item cannot be added to cart as the canteen information is not available. Please try refreshing the page.',
        variant: 'destructive',
      });
      return;
    }

    addToCart(
      {
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image ?? '',
        canteenId,
        quantity: 1,
      },
      () => {
        // Handle canteen conflict
        setPendingItem(item);
        setShowCanteenConflictDialog(true);
      }
    );

    // Only update local state and show toast if no conflict
    const wasAdded = cart.length === 0 || cart[0].canteenId === canteenId;
    if (wasAdded) {
      // Update local state
      setCartItems((prev) => ({
        ...prev,
        [item._id]: 1,
      }));

      toast({
        title: 'Added to cart',
        description: `${item.name} has been added to your cart from ${canteenName}`,
      });
    }
  };

  const handleConfirmCanteenSwitch = () => {
    if (pendingItem) {
      // Clear cart and add the new item
      cart.forEach((cartItem) => removeFromCart(cartItem.id));

      const canteenId =
        typeof pendingItem.canteen === 'object' &&
        pendingItem.canteen &&
        '_id' in pendingItem.canteen
          ? pendingItem.canteen._id
          : typeof pendingItem.canteen === 'string'
          ? pendingItem.canteen
          : '';

      addToCart({
        id: pendingItem._id,
        name: pendingItem.name,
        price: pendingItem.price,
        image: pendingItem.image ?? '',
        canteenId,
        quantity: 1,
      });

      // Update local state
      setCartItems({ [pendingItem._id]: 1 });

      toast({
        title: 'Cart cleared and item added',
        description: `Previous items removed. ${pendingItem.name} was added.`,
      });
    }

    setShowCanteenConflictDialog(false);
    setPendingItem(null);
  };

  const handleUpdateQuantity = (item: MenuItem, quantity: number) => {
    if (!isAuthenticated) {
      toast({
        title: 'Please login',
        description: 'You need to be logged in to update cart',
        variant: 'destructive',
      });
      return;
    }

    // Validate canteen information
    const canteenId =
      typeof item.canteen === 'object' && item.canteen && '_id' in item.canteen
        ? item.canteen._id
        : typeof item.canteen === 'string'
        ? item.canteen
        : '';

    const canteenName =
      typeof item.canteen === 'object' && item.canteen && 'name' in item.canteen
        ? item.canteen.name
        : 'Unknown Canteen';

    // Prevent updating items with invalid canteen data
    if (!canteenId || canteenName === 'Unknown Canteen') {
      toast({
        title: 'Canteen Not Available',
        description:
          'This item cannot be updated as the canteen information is not available. Please try refreshing the page.',
        variant: 'destructive',
      });
      return;
    }

    if (quantity <= 0) {
      // Remove item from cart
      setCartItems((prev) => {
        const newItems = { ...prev };
        delete newItems[item._id];
        return newItems;
      });

      toast({
        title: 'Removed from cart',
        description: `${item.name} has been removed from your cart`,
      });
    } else {
      // Update quantity using addToCart (which should handle updates)
      addToCart({
        id: item._id,
        name: item.name,
        price: item.price,
        image: item.image ?? '',
        canteenId,
        quantity,
      });

      setCartItems((prev) => ({
        ...prev,
        [item._id]: quantity,
      }));

      toast({
        title: 'Cart updated',
        description: `${item.name} quantity updated to ${quantity}`,
      });
    }
  };

  const handleCanteenClick = (canteenId: string) => {
    router.push(`/menu/${canteenId}`);
  };

  return (
    <React.Fragment>
      {/* Inject custom styles */}
      <style jsx global>
        {customStyles}
      </style>

      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pt-24 pb-12 transition-colors duration-300 relative overflow-hidden'>
        {/* Background Decorations */}
        <div className='absolute inset-0 overflow-hidden pointer-events-none'>
          <div className='absolute -top-4 -right-4 w-72 h-72 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse'></div>
          <div className='absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-emerald-500/5 to-green-500/5 rounded-full blur-3xl animate-pulse delay-1000'></div>
          <div className='absolute bottom-20 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-3xl animate-pulse delay-2000'></div>
        </div>

        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          {/* Enhanced Header Card with Dynamic Elements */}
          <div className='max-w-6xl mx-auto mb-12'>
            <div className='relative group bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl p-8 border-2 border-dashed border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-slate-200/20 dark:shadow-slate-900/20 hover:border-slate-300/80 dark:hover:border-slate-600/80 transition-all duration-500 hover:shadow-3xl hover:-translate-y-1'>
              {/* Decorative Corner Elements */}
              <div className='absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-slate-300/50 dark:border-slate-600/50 rounded-tl-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300'></div>
              <div className='absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-slate-300/50 dark:border-slate-600/50 rounded-tr-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300'></div>
              <div className='absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-slate-300/50 dark:border-slate-600/50 rounded-bl-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300'></div>
              <div className='absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-slate-300/50 dark:border-slate-600/50 rounded-br-xl opacity-60 group-hover:opacity-100 transition-opacity duration-300'></div>

              {/* Floating Dots Pattern */}
              <div className='absolute inset-0 overflow-hidden rounded-3xl pointer-events-none'>
                <div className='absolute top-16 left-16 w-2 h-2 bg-slate-300/30 dark:bg-slate-600/30 rounded-full animate-pulse'></div>
                <div className='absolute top-24 right-20 w-1.5 h-1.5 bg-slate-300/40 dark:bg-slate-600/40 rounded-full animate-pulse delay-500'></div>
                <div className='absolute bottom-20 left-24 w-1 h-1 bg-slate-300/50 dark:bg-slate-600/50 rounded-full animate-pulse delay-1000'></div>
                <div className='absolute bottom-16 right-16 w-2.5 h-2.5 bg-slate-300/20 dark:bg-slate-600/20 rounded-full animate-pulse delay-700'></div>
              </div>

              <div className='text-center relative z-10'>
                <div className='relative inline-block mb-8'>
                  {/* Animated Background Rings */}
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div
                      className='w-48 h-48 border-2 border-slate-200/20 dark:border-slate-700/20 rounded-full animate-spin'
                      style={{ animationDuration: '15s' }}></div>
                    <div
                      className='absolute w-64 h-64 border border-slate-200/10 dark:border-slate-700/10 rounded-full animate-spin'
                      style={{
                        animationDuration: '20s',
                        animationDirection: 'reverse',
                      }}></div>
                  </div>

                  <h1 className='text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-4 relative z-10 tracking-tight transform hover:scale-105 transition-transform duration-300'>
                    <span className='inline-block hover:animate-bounce'>Q</span>
                    <span
                      className='inline-block hover:animate-bounce'
                      style={{ animationDelay: '0.1s' }}>
                      u
                    </span>
                    <span
                      className='inline-block hover:animate-bounce'
                      style={{ animationDelay: '0.2s' }}>
                      i
                    </span>
                    <span
                      className='inline-block hover:animate-bounce'
                      style={{ animationDelay: '0.3s' }}>
                      c
                    </span>
                    <span
                      className='inline-block hover:animate-bounce'
                      style={{ animationDelay: '0.4s' }}>
                      k
                    </span>
                    <span
                      className='text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-orange-500 dark:from-red-400 dark:via-red-500 dark:to-orange-400 animate-gradient-x inline-block hover:animate-bounce'
                      style={{ animationDelay: '0.5s' }}>
                      Bites
                    </span>
                  </h1>
                  <div className='absolute -top-4 -left-4 w-full h-full bg-gradient-to-r from-red-500/15 to-orange-500/15 rounded-3xl blur-2xl -z-10 animate-pulse group-hover:blur-xl transition-all duration-500'></div>
                </div>

                {/* Enhanced Description with Icons */}
                <div className='relative mb-8'>
                  <div className='flex items-center justify-center gap-4 mb-4'>
                    <div className='w-px h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent'></div>
                    <div className='text-3xl animate-bounce'>🍽️</div>
                    <div className='w-px h-12 bg-gradient-to-b from-transparent via-slate-300 dark:via-slate-600 to-transparent'></div>
                  </div>

                  <p className='text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-medium mb-3'>
                    Ready-to-serve items from all canteens across all campuses
                  </p>
                  <div className='flex items-center justify-center gap-3'>
                    <div className='w-8 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent'></div>
                    <p className='text-lg text-slate-500 dark:text-slate-400 font-light flex items-center gap-2'>
                      Order now and skip the wait!
                      <span className='text-2xl animate-pulse'>⚡</span>
                    </p>
                    <div className='w-8 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent'></div>
                  </div>
                </div>

                {/* Enhanced Stats with Animations */}
                <div className='flex flex-wrap justify-center gap-6'>
                  <div className='group/stat relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-br from-red-500/5 to-orange-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300'></div>
                    <div className='relative z-10'>
                      <div className='text-3xl font-black text-red-500 dark:text-red-400 group-hover/stat:animate-pulse'>
                        {readyItems.length}
                      </div>
                      <div className='text-sm text-slate-600 dark:text-slate-300 font-medium'>
                        Ready Items
                      </div>
                    </div>
                    <div className='absolute -top-2 -right-2 w-4 h-4 bg-red-400/20 rounded-full animate-ping'></div>
                  </div>

                  <div className='group/stat relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-green-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300'></div>
                    <div className='relative z-10'>
                      <div className='text-3xl font-black text-emerald-500 dark:text-emerald-400 group-hover/stat:animate-pulse'>
                        ⚡
                      </div>
                      <div className='text-sm text-slate-600 dark:text-slate-300 font-medium'>
                        Instant Pickup
                      </div>
                    </div>
                    <div className='absolute -top-2 -right-2 w-4 h-4 bg-emerald-400/20 rounded-full animate-ping delay-300'></div>
                  </div>

                  <div className='group/stat relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-8 py-4 border-2 border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl transform hover:-translate-y-2 hover:scale-105 transition-all duration-300 overflow-hidden'>
                    <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300'></div>
                    <div className='relative z-10'>
                      <div className='text-3xl font-black text-blue-500 dark:text-blue-400 group-hover/stat:animate-pulse'>
                        🏫
                      </div>
                      <div className='text-sm text-slate-600 dark:text-slate-300 font-medium'>
                        All Canteens
                      </div>
                    </div>
                    <div className='absolute -top-2 -right-2 w-4 h-4 bg-blue-400/20 rounded-full animate-ping delay-500'></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Simplified Search and Filters */}
          <div className='  mx-auto mb-12'>
            <div className='bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg'>
              <div className='space-y-6'>
                {/* Search Bar */}
                <div className='relative'>
                  <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500' />
                  <Input
                    placeholder='Search food items... 🔍'
                    value={filters.searchQuery}
                    onChange={(e) =>
                      updateFilter('searchQuery', e.target.value)
                    }
                    className='pl-12 pr-4 py-3 text-base bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-red-500 dark:focus:border-red-400 transition-all duration-300'
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => updateFilter('searchQuery', '')}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-slate-100 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-full flex items-center justify-center transition-all duration-300'>
                      ✕
                    </button>
                  )}
                </div>

                {/* Diet Type Filter and Refresh Button */}
                <div className='flex flex-col sm:flex-row gap-4 items-center justify-between'>
                  {/* Diet Type */}
                  <div className='flex gap-2'>
                    {(['all', 'veg', 'non-veg'] as DietType[]).map((diet) => (
                      <button
                        key={diet}
                        onClick={() => updateFilter('dietType', diet)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                          filters.dietType === diet
                            ? 'bg-red-500 dark:bg-red-600 text-white shadow-md'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}>
                        <div className='flex items-center gap-2'>
                          <span>
                            {diet === 'all' && '🍽️'}
                            {diet === 'veg' && '🥬'}
                            {diet === 'non-veg' && '🍖'}
                          </span>
                          <span className='capitalize'>
                            {diet === 'non-veg' ? 'Non-Veg' : diet}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Refresh Button */}
                  <Button
                    onClick={loadReadyItems}
                    disabled={loading}
                    className='bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg'>
                    <div className='flex items-center gap-2'>
                      <span className={loading ? 'animate-spin' : ''}>🔄</span>
                      <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
                    </div>
                  </Button>
                </div>

                {/* Search Results Info */}
                {filters.searchQuery && (
                  <div className='text-center'>
                    <span className='inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-lg text-sm font-medium'>
                      ✨ Found {filteredItems.length} result
                      {filteredItems.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Content */}
            {loading ? (
              <div className='space-y-8'>
                <div className='text-center'>
                  <div className='inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-6 py-4 border border-slate-200/50 dark:border-slate-700/50 shadow-lg'>
                    <div className='w-6 h-6 border-3 border-red-500/30 border-t-red-500 rounded-full animate-spin'></div>
                    <span className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                      Finding delicious ready items... 🍽️
                    </span>
                  </div>
                </div>
                <div className='w-full px-2 sm:px-4 py-10'>
                  <div className='mx-auto max-w-screen-2xl'>
                    <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6'>
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className='w-full animate-pulse bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg rounded-2xl overflow-hidden'>
                          <div className='aspect-[5/4] bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700' />
                          <div className='p-3 sm:p-4 space-y-2 sm:space-y-3'>
                            <div className='h-4 sm:h-6 w-3/4 bg-slate-200 dark:bg-slate-600 rounded-lg' />
                            <div className='h-3 sm:h-4 w-full bg-slate-200 dark:bg-slate-600 rounded' />
                            <div className='h-3 sm:h-4 w-2/3 bg-slate-200 dark:bg-slate-600 rounded' />
                            <div className='h-8 sm:h-10 w-full bg-slate-200 dark:bg-slate-600 rounded-xl' />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className='text-center py-20'>
                <div className='relative'>
                  <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='w-32 h-32 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse'></div>
                  </div>
                  <div className='relative z-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-12 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl max-w-lg mx-auto'>
                    <div className='text-6xl mb-6 animate-bounce'>
                      {readyItems.length === 0 ? '🍽️' : '🔍'}
                    </div>
                    <h3 className='text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4'>
                      {readyItems.length === 0
                        ? 'No Ready Items Yet'
                        : 'No Matching Items'}
                    </h3>
                    <p className='text-lg text-slate-600 dark:text-slate-400 leading-relaxed'>
                      {readyItems.length === 0
                        ? 'Our chefs are preparing something delicious! Check back in a few minutes for fresh, ready-to-serve items. ⏰'
                        : "We couldn't find items matching your search. Try different keywords or browse all categories! 🔄"}
                    </p>

                    {readyItems.length === 0 && (
                      <Button
                        onClick={loadReadyItems}
                        className='mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'>
                        Check Again 🔄
                      </Button>
                    )}

                    {readyItems.length > 0 && filteredItems.length === 0 && (
                      <Button
                        onClick={clearAllFilters}
                        className='mt-6 px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105'>
                        Show All Items 🍽️
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Enhanced Results Count */}
                <div className='text-center mt-8'>
                  <div className='inline-flex items-center gap-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl px-6 py-3 border border-slate-200/50 dark:border-slate-700/50 shadow-lg'>
                    <span className='text-2xl'>🎯</span>
                    <p className='text-lg font-medium text-slate-700 dark:text-slate-300'>
                      Showing{' '}
                      <span className='font-bold text-red-500 dark:text-red-400'>
                        {filteredItems.length}
                      </span>{' '}
                      delicious ready-to-serve item
                      {filteredItems.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Enhanced Items Grid */}
                <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 max-w-screen-2xl mx-auto px-2 sm:px-4 py-10'>
                  {filteredItems.map((item, index) => (
                    <div
                      key={item._id}
                      className='w-full animate-fade-in-up'
                      style={{ animationDelay: `${index * 100}ms` }}>
                      <QuickBiteItemCard
                        item={item}
                        onAddToCart={handleAddToCart}
                        onUpdateQuantity={handleUpdateQuantity}
                        currentQuantity={cartItems[item._id] || 0}
                        onCanteenClick={handleCanteenClick}
                      />
                    </div>
                  ))}
                </div>

                {/* Motivational Footer */}
                <div className='text-center mt-16 py-8'>
                  <div className='bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 rounded-3xl p-8 border border-red-200/30 dark:border-red-700/30'>
                    <p className='text-lg text-slate-600 dark:text-slate-400 font-medium'>
                      🎉 Amazing choices! Ready for instant pickup across all
                      campuses
                    </p>
                    <p className='text-sm text-slate-500 dark:text-slate-500 mt-2'>
                      Order now and skip the wait ⚡
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
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
              current cart and add this item?
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
    </React.Fragment>
  );
}
