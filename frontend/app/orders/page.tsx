'use client';

import React, { useState, useEffect, useReducer, useMemo, memo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RouteProtection } from '@/components/RouteProtection';
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { Order, Review } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Receipt,
  ChefHat,
  Package,
  CheckCircle2,
  XCircle,
  CreditCard,
  ShoppingBag,
  ArrowRight,
  Loader2,
  Clock,
  Star,
  Heart,
  MessageSquare,
  Plus,
  Calendar,
  Eye,
  RefreshCw,
  AlertCircle,
  Truck,
  MapPin,
  Inbox,
} from 'lucide-react';
import { getMyOrders, getOrderById, AuthError } from '@/services/orderService';
import { createReview, getItemReviews } from '@/services/reviewService';
import { toast } from 'sonner';
import {
  motion,
  AnimatePresence,
  useInView,
  useSpring,
  useTransform,
  useMotionValue,
  Transition,
} from 'framer-motion';
import ItemReviewSelector from '@/components/ItemReviewSelector';

// Shared Helper Functions
type OrderStatus =
  | 'placed'
  | 'payment_pending'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

interface StatusConfig {
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: React.ComponentType<any>;
  label: string;
  description: string;
}

const statusConfigs: Record<OrderStatus, StatusConfig> = {
  placed: {
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-blue-700 dark:text-blue-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Receipt,
    label: 'Order Placed',
    description: 'Your order has been received',
  },
  payment_pending: {
    color: 'bg-orange-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-orange-700 dark:text-orange-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Receipt,
    label: 'Payment Pending',
    description: 'Payment is pending for this order',
  },
  preparing: {
    color: 'bg-yellow-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: ChefHat,
    label: 'Preparing',
    description: 'Your food is being prepared',
  },
  ready: {
    color: 'bg-purple-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-purple-700 dark:text-purple-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: Package,
    label: 'Ready for Pickup',
    description: 'Your order is ready',
  },
  completed: {
    color: 'bg-green-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-green-700 dark:text-green-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: CheckCircle2,
    label: 'Completed',
    description: 'Order delivered successfully',
  },
  cancelled: {
    color: 'bg-red-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/50',
    textColor: 'text-red-700 dark:text-red-300',
    borderColor: 'border-blue-200 dark:border-blue-800',
    icon: XCircle,
    label: 'Cancelled',
    description: 'Order was cancelled',
  },
};

const getStatusConfig = (status: string): StatusConfig =>
  statusConfigs[status as OrderStatus] ?? statusConfigs.placed;

type PaymentMethod = 'cod' | 'upi' | 'card';

interface PaymentConfig {
  icon: React.ComponentType<any>;
  label: string;
  color: string;
}

const paymentConfigs: Record<PaymentMethod, PaymentConfig> = {
  cod: {
    icon: Package,
    label: 'Cash on Delivery',
    color:
      'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50',
  },
  upi: {
    icon: CreditCard,
    label: 'UPI Payment',
    color: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50',
  },
  card: {
    icon: CreditCard,
    label: 'Card Payment',
    color:
      'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50',
  },
};
// Define Review State and Actions
type ReviewState = {
  showDialog: boolean;
  selectedItem: any | null;
  selectedOrder: Order | null;
  rating: number;
  comment: string;
  submitting: boolean;
  showThankYou: boolean;
};

type ReviewAction =
  | { type: 'openDialog'; item: any; order: Order }
  | { type: 'closeDialog' }
  | { type: 'setRating'; rating: number }
  | { type: 'setComment'; comment: string }
  | { type: 'setSubmitting'; submitting: boolean }
  | { type: 'showThankYou' }
  | { type: 'reset' };

// Initial state for review
const initialReviewState: ReviewState = {
  showDialog: false,
  selectedItem: null,
  selectedOrder: null,
  rating: 0,
  comment: '',
  submitting: false,
  showThankYou: false,
};

// Reducer function to manage review state
function reviewReducer(state: ReviewState, action: ReviewAction): ReviewState {
  switch (action.type) {
    case 'openDialog':
      return {
        ...state,
        showDialog: true,
        selectedItem: action.item,
        selectedOrder: action.order,
      };
    case 'closeDialog':
      return {
        ...state,
        showDialog: false,
        selectedItem: null,
        selectedOrder: null,
        rating: 0,
        comment: '',
        submitting: false,
        showThankYou: false,
      };
    case 'setRating':
      return { ...state, rating: action.rating };
    case 'setComment':
      return { ...state, comment: action.comment };
    case 'setSubmitting':
      return { ...state, submitting: action.submitting };
    case 'showThankYou':
      return { ...state, showThankYou: true };
    case 'reset':
      return initialReviewState;
    default:
      return state;
  }
}

const getPaymentConfig = (method: string): PaymentConfig =>
  paymentConfigs[method as PaymentMethod] ?? paymentConfigs.cod;

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Date not available';

  const date = new Date(dateString);
  if (isNaN(date.valueOf())) return 'Invalid date';

  return dateFormatter.format(date);
};

// Memoized Animated Counter Component
const AnimatedCounter = memo(function AnimatedCounter({
  value,
  duration = 1,
}: {
  value: number;
  duration?: number;
}) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });

  // useMotionValue hook to get the current value of spring
  const [displayValue, setDisplayValue] = useState(Math.round(value));

  useEffect(() => {
    spring.set(value);
    // subscribe to spring updates and update displayValue state
    return spring.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
  }, [value, spring]);

  return <motion.span>{displayValue}</motion.span>;
});

function OrdersPageContent() {
  const { isAuthenticated, token } = useAuth();
  const { addToCart, clearCart } = useCart();
  const router = useRouter();

  // Orders data
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected order & detail modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Review state managed by reducer
  const [reviewState, dispatchReview] = useReducer(
    reviewReducer,
    initialReviewState
  );

  // Viewed reviews tracking
  const [viewedReviews, setViewedReviews] = useState<Set<string>>(new Set());

  // To add viewed review id immutably:
  const markReviewAsViewed = (reviewId: string) => {
    setViewedReviews((prev) => new Set(prev).add(reviewId));
  };
  const [selectedOrderForReview, setSelectedOrderForReview] =
    useState<Order | null>(null);
  const [selectedItemForReview, setSelectedItemForReview] = useState<
    any | null
  >(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  const [showViewReviewDialog, setShowViewReviewDialog] = useState(false);
  const [selectedItemForViewReview, setSelectedItemForViewReview] = useState<
    any | null
  >(null);

  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [existingReviews, setExistingReviews] = useState<Review[]>([]);

  const [selectedOrderForSelector, setSelectedOrderForSelector] =
    useState<Order | null>(null);
  const [showItemSelectorDialog, setShowItemSelectorDialog] = useState(false);

  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const [showThankYouDialog, setShowThankYouDialog] = useState(false);

  // Load viewed reviews from localStorage on component mount
  useEffect(() => {
    const savedViewedReviews = localStorage.getItem('viewedReviews');
    if (savedViewedReviews) {
      try {
        const parsed = JSON.parse(savedViewedReviews);
        setViewedReviews(new Set(parsed));
      } catch (error) {
        console.error('Error loading viewed reviews:', error);
      }
    }
  }, []);

  // Save viewed reviews to localStorage whenever it changes
  useEffect(() => {
    const savedViewedReviews = localStorage.getItem('viewedReviews');
    if (savedViewedReviews) {
      try {
        const parsed = JSON.parse(savedViewedReviews);
        setViewedReviews(new Set(parsed));
      } catch (error) {
        console.error('Error loading viewed reviews:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getMyOrders(token!);
      setOrders(response.data);
    } catch (err: any) {
      const errorMsg =
        err instanceof AuthError
          ? 'Session expired. Please login again to view your orders.'
          : err?.message ?? 'Failed to fetch orders';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (data: any) => {
    // setOrderDetailLoading(true);
    setSelectedOrder(data);
    setIsDetailModalOpen(true);

    // try {
    //   const { data } = await getOrderById(orderId, token!);
    //   setSelectedOrder(data);
    // } catch (err) {
    //   console.error('Failed to fetch order details:', err);
    //   setIsDetailModalOpen(false);
    //   alert('Failed to load order details. Please try again.');
    // } finally {
    //   setOrderDetailLoading(false);
    // }
  };

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center relative overflow-hidden'>
        {/* Background Animated Blurs */}
        <div className='absolute inset-0'>
          {[
            {
              className:
                'absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full blur-3xl',
              animate: { scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] },
              transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            },
            {
              className:
                'absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-pink-400/20 dark:from-orange-600/20 dark:to-pink-600/20 rounded-full blur-3xl',
              animate: { scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] },
              transition: {
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              },
            },
          ].map(({ className, animate, transition }, i) => (
            <motion.div
              key={i}
              className={className}
              animate={animate}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className='relative z-10'>
          <Card className='w-full max-w-md mx-4 shadow-2xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-transparent dark:from-slate-800/50' />
            <CardContent className='pt-12 pb-8 px-8 text-center relative z-10'>
              <motion.div
                className='w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl'
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <ShoppingBag className='w-10 h-10 text-white' />
              </motion.div>

              <CardTitle className='text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100'>
                Welcome Back!
              </CardTitle>

              <CardDescription className='text-gray-600 dark:text-gray-300 mb-8 text-base leading-relaxed'>
                Sign in to view your order history and track your delicious
                campus meals.
              </CardDescription>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  className='w-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'>
                  <Link
                    href='/login'
                    className='flex items-center justify-center'>
                    <ArrowRight className='w-5 h-5 mr-2' />
                    Sign In to Continue
                  </Link>
                </Button>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Review helper functions
  const handleWriteReview = (order: Order, item: any) => {
    setSelectedOrderForReview(order);
    setSelectedItemForReview(item);
    setReviewRating(0);
    setReviewComment('');
    setShowReviewDialog(true);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reviewRating === 0) return toast.error('Please select a rating');
    if (!reviewComment.trim()) return toast.error('Please add a comment');
    if (!selectedItemForReview || !selectedOrderForReview)
      return toast.error('Invalid review data');

    setReviewSubmitting(true);
    try {
      const itemId =
        typeof selectedItemForReview.item === 'string'
          ? selectedItemForReview.item
          : selectedItemForReview.item._id;

      const reviewData = {
        canteenId: selectedOrderForReview.canteen._id,
        itemId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      };

      await createReview(reviewData);

      // Reset and close review dialog
      setShowReviewDialog(false);
      setReviewRating(0);
      setReviewComment('');
      setSelectedItemForReview(null);
      setSelectedOrderForReview(null);

      setShowThankYouDialog(true);

      // Refresh reviews if viewing same item review dialog
      if (showViewReviewDialog && selectedItemForViewReview) {
        const viewItemId =
          typeof selectedItemForViewReview.item === 'string'
            ? selectedItemForViewReview.item
            : selectedItemForViewReview.item._id;
        if (viewItemId === itemId) {
          // Small delay to allow backend processing
          setTimeout(() => fetchItemReviews(itemId), 1000);
        }
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // View review helper functions
  // View review helper functions
  const handleViewReviews = (order: Order, item: any) => {
    setSelectedOrderForReview(order);
    setSelectedItemForViewReview(item);

    const itemId = typeof item.item === 'string' ? item.item : item.item._id;

    // Mark this item's reviews as viewed (frontend only)
    setViewedReviews((prev) => {
      if (prev.has(itemId)) return prev;
      return new Set(prev).add(itemId);
    });

    setShowViewReviewDialog(true);

    // Delay to ensure recent reviews are fetched
    setTimeout(() => fetchItemReviews(itemId), 500);
  };

  // Item selector helper functions
  const handleOpenItemSelector = (order: Order) => {
    setSelectedOrderForSelector(order);
    setShowItemSelectorDialog(true);
  };

  const handleItemSelectorWriteReview = (item: any) => {
    if (!selectedOrderForSelector) return;
    setShowItemSelectorDialog(false);
    handleWriteReview(selectedOrderForSelector, item);
  };

  const handleItemSelectorViewReviews = (item: any) => {
    if (!selectedOrderForSelector) return;
    handleViewReviews(selectedOrderForSelector, item);
  };

  // Fetch item reviews from backend
  const fetchItemReviews = async (itemId: string) => {
    setReviewsLoading(true);
    try {
      const reviews = await getItemReviews(itemId);
      setExistingReviews(reviews);

      if (reviews.length === 0) {
        toast.info('No reviews found for this item yet.');
      } else {
        toast.success(`Found ${reviews.length} review(s) for this item.`);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
      setExistingReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  // Helper to check if item's reviews viewed (frontend only)
  const hasViewedReviews = (itemId: string) => viewedReviews.has(itemId);

  // Helper to clear viewed reviews and localStorage
  const clearViewedReviews = () => {
    setViewedReviews(new Set());
    localStorage.removeItem('viewedReviews');
    toast.success('Viewed reviews cleared! 🧹');
  };

  // Reorder functionality
  const handleReorder = (order: Order) => {
    try {
      clearCart();

      // Add all valid items to cart
      const itemsAdded = order.items.reduce((count, orderItem) => {
        const item = orderItem.item;
        if (item?._id) {
          addToCart({
            id: item._id,
            name: item.name,
            price: item.price,
            quantity: orderItem.quantity,
            image: item.image ?? '/placeholder.svg',
            canteenId: order.canteen._id,
          });
          return count + 1;
        }
        return count;
      }, 0);

      if (itemsAdded > 0) {
        toast.success(
          `${itemsAdded} item${itemsAdded > 1 ? 's' : ''} added to cart! 🛒`,
          {
            description: 'Redirecting to cart...',
            duration: 2000,
          }
        );
        setTimeout(() => router.push('/cart'), 1000);
      } else {
        toast.error('No items could be added to cart');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder. Please try again.');
    }
  };
  // Memoize expensive computations
  const activeOrders = useMemo(
    () =>
      orders.filter((o) =>
        ['placed', 'preparing', 'ready', 'payment_pending'].includes(o.status)
      ),
    [orders]
  );

  const completedOrders = useMemo(
    () => orders.filter((o) => ['completed', 'cancelled'].includes(o.status)),
    [orders]
  );
  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900'>
        {/* Loading Header */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent'>
              My Orders
            </h1>
            <p className='text-gray-600 dark:text-slate-300 mt-1 text-sm sm:text-base'>
              Track your delicious journey
            </p>
          </div>
        </div>

        {/* Loading animation */}
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <motion.div
            className='flex flex-col items-center justify-center py-20'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}>
            <div className='relative'>
              <motion.div
                className='w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6 sm:mb-8 shadow-2xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500'
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}>
                <Loader2 className='h-8 w-8 sm:h-10 sm:w-10 text-white animate-spin' />
              </motion.div>

              <motion.div
                className='absolute -inset-4 sm:-inset-6 rounded-3xl blur-2xl bg-gradient-to-r from-orange-200/40 via-red-200/40 to-pink-200/40 dark:from-orange-500/20 dark:via-red-500/20 dark:to-pink-500/20'
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </div>

            <motion.div
              className='text-center'
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}>
              <p className='text-gray-700 dark:text-slate-300 text-base sm:text-lg font-medium mb-1 sm:mb-2'>
                Loading your orders...
              </p>
              <p className='text-gray-500 dark:text-slate-400 text-xs sm:text-sm'>
                This won't take long
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900'>
        {/* Error Header */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent'>
              My Orders
            </h1>
          </div>
        </div>

        {/* Error message */}
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='max-w-2xl mx-auto'
            role='alert'>
            <Alert className='border-red-200/50 bg-red-50/80 dark:border-red-800/50 dark:bg-red-950/20 backdrop-blur-sm shadow-xl'>
              <AlertCircle className='h-5 w-5 text-red-600 dark:text-red-400' />
              <AlertTitle className='text-red-800 dark:text-red-300 font-semibold text-lg'>
                Oops! Something went wrong
              </AlertTitle>
              <AlertDescription className='text-red-700 dark:text-red-400 mb-6 text-base leading-relaxed'>
                {error}
              </AlertDescription>
              <div className='flex flex-col sm:flex-row gap-3'>
                {error.includes('Session expired') && (
                  <Button
                    asChild
                    className='bg-red-600 hover:bg-red-700 text-white shadow-lg'>
                    <Link href='/login'>Login Again</Link>
                  </Button>
                )}
                <Button
                  onClick={fetchOrders}
                  variant='outline'
                  className='border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 shadow-lg'>
                  <RefreshCw className='w-4 h-4 mr-2' />
                  Try Again
                </Button>
              </div>
            </Alert>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='
      min-h-screen
      bg-gradient-to-br
      from-slate-50
      via-blue-50
      to-indigo-100
      dark:from-slate-900
      dark:via-slate-800
      dark:to-indigo-900
      relative
      overflow-hidden
    '>
      {/* Animated Background Elements */}
      {/* <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="
          absolute top-20 left-20 w-96 h-96
          rounded-full blur-3xl
          bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10
          dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10
        "
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="
          absolute bottom-20 right-20 w-80 h-80
          rounded-full blur-3xl
          bg-gradient-to-r from-orange-400/10 via-red-400/10 to-pink-400/10
          dark:from-orange-600/10 dark:via-red-600/10 dark:to-pink-600/10
        "
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div> */}

      {/* Modern Header with Stats */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div>
              <h1
                className='
                text-2xl sm:text-3xl md:text-4xl lg:text-5xl
                font-bold
                bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900
                dark:from-white dark:via-blue-200 dark:to-indigo-200
                bg-clip-text text-transparent
              '>
                My Orders
              </h1>
              <p className='text-gray-600 dark:text-slate-300 mt-1 sm:mt-2 text-xs sm:text-sm md:text-base'>
                Track your delicious journey across campus
              </p>
            </div>

            {/* Utility actions */}
            <div className='flex items-center gap-2 sm:gap-3'>
              {viewedReviews.size > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='flex items-center gap-1.5 sm:gap-2'>
                  <Badge className='bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 text-xs sm:text-sm px-2 sm:px-3 py-1'>
                    {viewedReviews.size} viewed
                  </Badge>
                  <Button
                    onClick={clearViewedReviews}
                    variant='ghost'
                    size='sm'
                    className='text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 h-6 px-1.5 sm:px-2'>
                    Clear
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10'>
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='text-center py-12 sm:py-16 lg:py-24'>
            <div className='max-w-sm sm:max-w-md mx-auto px-4 sm:px-0'>
              <motion.div
                className='
                w-20 h-20 sm:w-24 sm:h-24
                mx-auto mb-6 sm:mb-8
                bg-gradient-to-br from-orange-100 to-red-100
                dark:from-orange-900/30 dark:to-red-900/30
                rounded-2xl flex items-center justify-center
              '
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <Inbox className='w-10 h-10 sm:w-12 sm:h-12 text-orange-500' />
              </motion.div>

              <h3 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4'>
                No orders yet
              </h3>

              <p className='text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base'>
                Start your food journey by exploring our amazing campus
                restaurants and placing your first order.
              </p>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  className='
                  w-full sm:w-auto
                  bg-gradient-to-r from-orange-500 via-red-500 to-pink-500
                  hover:from-orange-600 hover:via-red-600 hover:to-pink-600
                  text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3
                  rounded-xl shadow-lg hover:shadow-xl
                  transition-all duration-300
                  text-sm sm:text-base
                '>
                  <Link href='/menu'>
                    <Plus className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                    Browse Menu
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className='space-y-8 lg:space-y-12'>
            {/* Active Orders Section */}
            {activeOrders.length > 0 && (
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}>
                <div className='flex items-center gap-3 mb-6'>
                  <div className='w-8 h-8 bg-gradient-to-r from-red-500 to-red-500 rounded-lg flex items-center justify-center'>
                    <Clock className='w-4 h-4 text-white' />
                  </div>
                  <h2 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white'>
                    Active Orders
                  </h2>
                  <Badge className='bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300'>
                    {activeOrders.length}
                  </Badge>
                </div>
                <div className='grid gap-4 lg:gap-6'>
                  {activeOrders.map((order, index) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      index={index}
                      onViewDetails={handleViewDetails}
                      onReorder={handleReorder}
                      onOpenItemSelector={() => handleOpenItemSelector(order)}
                      orderDetailLoading={orderDetailLoading}
                      isDetailModalOpen={isDetailModalOpen}
                      setIsDetailModalOpen={setIsDetailModalOpen}
                      selectedOrder={selectedOrder}
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* Order History Section */}
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}>
              <div className='flex items-center gap-3 mb-6'>
                <div className='w-8 h-8 bg-gradient-to-r from-red-500 to-red-500 rounded-lg flex items-center justify-center'>
                  <Receipt className='w-4 h-4 text-white' />
                </div>
                <h2 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white'>
                  Order History
                </h2>
                <Badge className='bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
                  {completedOrders.length}
                </Badge>
              </div>
              <div className='grid gap-4 lg:gap-6'>
                {completedOrders.map((order, index) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    index={index}
                    onViewDetails={handleViewDetails}
                    onReorder={handleReorder}
                    onOpenItemSelector={() => handleOpenItemSelector(order)}
                    orderDetailLoading={orderDetailLoading}
                    isDetailModalOpen={isDetailModalOpen}
                    setIsDetailModalOpen={setIsDetailModalOpen}
                    selectedOrder={selectedOrder}
                  />
                ))}
              </div>
            </motion.section>
          </div>
        )}
      </div>

      {/* Dialogs remain the same but with improved mobile responsiveness */}
      {/* Item Selection Dialog for Review */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className='max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[85vh] overflow-y-auto mx-2 sm:mx-4 bg-white dark:bg-slate-900 border-0 shadow-2xl'>
          <DialogHeader className='text-center pb-4 sm:pb-6 border-b border-gray-100 dark:border-slate-800'>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className='flex justify-center mb-3 sm:mb-4'>
              <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl'>
                <Star className='w-8 h-8 sm:w-10 sm:h-10 text-white fill-current' />
              </div>
            </motion.div>
            <DialogTitle className='text-xl sm:text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent'>
              Share Your Experience
            </DialogTitle>
            <DialogDescription className='text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed px-2 sm:px-0'>
              Tell others about your experience with{' '}
              <span className='font-semibold text-orange-600 dark:text-orange-400'>
                {selectedItemForReview?.item?.name}
              </span>{' '}
              from{' '}
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                {selectedOrderForReview?.canteen?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitReview}
            className='space-y-6 sm:space-y-8 pt-4 sm:pt-6'>
            {/* Item Preview Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-700 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-slate-700'>
              <div className='flex items-center gap-3 sm:gap-4'>
                <div className='relative w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 shadow-lg'>
                  <Image
                    src={
                      selectedItemForReview?.item?.image || '/placeholder.svg'
                    }
                    alt={selectedItemForReview?.item?.name || 'Item'}
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate'>
                    {selectedItemForReview?.item?.name}
                  </h3>
                  <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate'>
                    {selectedOrderForReview?.canteen?.name}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Rating Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}>
              <label className='block text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200'>
                How would you rate this item?
              </label>
              <div className='flex items-center justify-center space-x-2 sm:space-x-3 p-4 sm:p-6 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 rounded-2xl border border-yellow-200 dark:border-yellow-800'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type='button'
                    className='cursor-pointer transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-yellow-300 dark:focus:ring-yellow-600 rounded-full p-1 sm:p-2'
                    onClick={() => setReviewRating(star)}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}>
                    <Star
                      className={`w-8 h-8 sm:w-10 sm:h-10 transition-all duration-300 ${
                        star <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400 drop-shadow-lg'
                          : 'text-gray-300 dark:text-gray-600 hover:text-yellow-300'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
              {reviewRating > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='text-center mt-2 sm:mt-3'>
                  <span className='inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs sm:text-sm font-medium'>
                    {reviewRating} Star{reviewRating !== 1 ? 's' : ''} Selected
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* Comment Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}>
              <label className='block text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-200'>
                Share your thoughts
              </label>
              <div className='relative'>
                <Textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder='What did you love about this item? Was it delicious? Fresh? Would you recommend it to others?'
                  rows={4}
                  required
                  className='resize-none border-2 border-gray-200 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base leading-relaxed focus:border-orange-400 dark:focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-900/30 transition-all duration-300 bg-white dark:bg-slate-800'
                />
                <div className='absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-xs text-gray-400 dark:text-gray-500'>
                  {reviewComment.length}/500
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end pt-4 sm:pt-6 border-t border-gray-100 dark:border-slate-800'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowReviewDialog(false)}
                className='w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 text-sm sm:text-base'>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={reviewSubmitting || reviewRating === 0}
                className='w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'>
                {reviewSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin' />
                    Saving...
                  </>
                ) : (
                  <>
                    <Heart className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                    Save Review
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Thank You Dialog */}
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent className='max-w-sm sm:max-w-md text-center mx-2 sm:mx-4'>
          <DialogHeader>
            <div className='flex justify-center mb-4 sm:mb-6'>
              <motion.div
                className='w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl'
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.68, -0.55, 0.265, 1.55],
                }}>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.4 }}>
                  <Heart className='w-10 h-10 sm:w-12 sm:h-12 text-white fill-current' />
                </motion.div>
              </motion.div>
            </div>
            <DialogTitle className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4'>
              Thank You! 🎉
            </DialogTitle>
            <DialogDescription className='text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-6 sm:mb-8 px-2 sm:px-0'>
              Your review has been saved successfully! Your feedback helps us
              improve our service and makes other students happy! ✨
            </DialogDescription>
          </DialogHeader>

          <motion.div
            className='space-y-4 sm:space-y-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}>
            <div className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 sm:p-4 rounded-xl border border-orange-200 dark:border-orange-800'>
              <p className='text-xs sm:text-sm text-gray-700 dark:text-gray-300'>
                <strong>🌟 Your voice matters!</strong> Thanks for helping
                fellow students make great food choices.
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => {
                  setShowThankYouDialog(false);
                  if (selectedItemForReview && selectedOrderForReview) {
                    // Force refresh reviews to show the newly created/updated review
                    handleViewReviews(
                      selectedOrderForReview,
                      selectedItemForReview
                    );
                  }
                }}
                className='w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-2.5 sm:py-3 mb-2 sm:mb-3 text-sm sm:text-base'>
                <MessageSquare className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                View My Review
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => {
                  setShowThankYouDialog(false);
                }}
                variant='outline'
                className='w-full border-2 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50 shadow-lg hover:shadow-xl transition-all duration-300 py-2.5 sm:py-3 text-sm sm:text-base'>
                Continue Exploring
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* View Reviews Dialog */}
      <Dialog
        open={showViewReviewDialog}
        onOpenChange={setShowViewReviewDialog}>
        <DialogContent className='max-w-sm sm:max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl max-h-[85vh] overflow-y-auto mx-2 sm:mx-4 bg-white dark:bg-slate-900 border-0 shadow-2xl'>
          <DialogHeader className='pb-4 sm:pb-6 border-b border-gray-100 dark:border-slate-800'>
            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0'>
                <MessageSquare className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
              </div>
              <div className='flex-1 text-center sm:text-left'>
                <DialogTitle className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white'>
                  Customer Reviews
                </DialogTitle>
                <DialogDescription className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1'>
                  <span className='font-semibold text-orange-600 dark:text-orange-400'>
                    {selectedItemForViewReview?.item?.name}
                  </span>{' '}
                  from{' '}
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>
                    {selectedOrderForReview?.canteen?.name}
                  </span>
                </DialogDescription>
              </div>
            </div>

            {/* Reviews Stats */}
            {existingReviews.length > 0 && (
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
                <div className='bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-3 sm:p-4 text-center border border-blue-200 dark:border-blue-800'>
                  <div className='text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400'>
                    {existingReviews.length}
                  </div>
                  <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                    Total Reviews
                  </div>
                </div>
                <div className='bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-3 sm:p-4 text-center border border-yellow-200 dark:border-yellow-800'>
                  <div className='text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400'>
                    {existingReviews.length > 0
                      ? (
                          existingReviews.reduce(
                            (sum, review) => sum + (review.rating || 0),
                            0
                          ) / existingReviews.length
                        ).toFixed(1)
                      : '0.0'}
                    ★
                  </div>
                  <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                    Average Rating
                  </div>
                </div>
                <div className='bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 sm:p-4 text-center border border-green-200 dark:border-green-800'>
                  <div className='text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400'>
                    {Math.round(
                      (existingReviews.filter((r) => (r.rating || 0) >= 4)
                        .length /
                        existingReviews.length) *
                        100
                    ) || 0}
                    %
                  </div>
                  <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                    Positive
                  </div>
                </div>
              </div>
            )}
          </DialogHeader>

          <div className='space-y-4 sm:space-y-6 pt-4 sm:pt-6'>
            {reviewsLoading ? (
              <div className='flex flex-col items-center justify-center py-12 sm:py-16'>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className='w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-xl'>
                  <Loader2 className='h-6 w-6 sm:h-8 sm:w-8 text-white' />
                </motion.div>
                <p className='text-gray-600 dark:text-gray-400 text-base sm:text-lg font-medium'>
                  Loading reviews...
                </p>
                <p className='text-gray-500 dark:text-gray-500 text-xs sm:text-sm mt-1'>
                  Please wait while we fetch the latest reviews
                </p>
              </div>
            ) : existingReviews.length > 0 ? (
              <div className='space-y-4 sm:space-y-6'>
                {existingReviews.map((review, index) => (
                  <motion.div
                    key={review._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className='group'>
                    <Card className='border-0 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-slate-800 dark:via-slate-800/50 dark:to-slate-700 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden'>
                      <CardContent className='p-4 sm:p-6 md:p-8'>
                        <div className='flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6'>
                          {/* Avatar */}
                          <div className='relative flex-shrink-0 mx-auto sm:mx-0'>
                            <div className='w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg'>
                              {review.student?.name?.charAt(0)?.toUpperCase() ||
                                'A'}
                            </div>
                            <motion.div
                              className='absolute -inset-2 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                              initial={false}
                            />
                          </div>

                          <div className='flex-1 min-w-0'>
                            {/* Header */}
                            <div className='flex flex-col gap-3 mb-3 sm:mb-4'>
                              <div className='text-center sm:text-left'>
                                <h4 className='font-bold text-base sm:text-lg text-gray-900 dark:text-white'>
                                  {review.student?.name || 'Anonymous Student'}
                                </h4>
                                {(review.createdAt || review.updatedAt) && (
                                  <p className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1'>
                                    {review.updatedAt &&
                                    review.updatedAt !== review.createdAt
                                      ? `Updated on ${formatDate(
                                          review.updatedAt
                                        )}`
                                      : `Posted on ${formatDate(
                                          review.createdAt || review.updatedAt
                                        )}`}
                                  </p>
                                )}
                              </div>

                              {/* Rating */}
                              <div className='flex items-center justify-center sm:justify-start gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 px-3 sm:px-4 py-2 rounded-full border border-yellow-200 dark:border-yellow-800 w-fit mx-auto sm:mx-0'>
                                <div className='flex items-center'>
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                        star <= (review.rating || 0)
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300 dark:text-gray-600'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className='text-xs sm:text-sm font-semibold text-yellow-700 dark:text-yellow-400'>
                                  {review.rating || 0}/5
                                </span>
                              </div>
                            </div>

                            {/* Comment */}
                            <div className='bg-white/60 dark:bg-slate-800/60 rounded-xl p-4 sm:p-5 border border-gray-200 dark:border-slate-700'>
                              <p className='text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base'>
                                "{review.comment}"
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='text-center py-12 sm:py-16'>
                <div className='w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-700 dark:to-slate-600 rounded-2xl flex items-center justify-center shadow-lg'>
                  <MessageSquare className='w-10 h-10 sm:w-12 sm:h-12 text-gray-400 dark:text-gray-500' />
                </div>
                <h3 className='text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3'>
                  No Reviews Yet
                </h3>
                <p className='text-gray-600 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed px-4 sm:px-0'>
                  This item hasn't been reviewed yet. Be the first to share your
                  experience and help other students!
                </p>
                <Button
                  onClick={() => {
                    setShowViewReviewDialog(false);
                    if (selectedItemForViewReview && selectedOrderForReview) {
                      handleWriteReview(
                        selectedOrderForReview,
                        selectedItemForViewReview
                      );
                    }
                  }}
                  className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base px-4 sm:px-6 py-2.5 sm:py-3'>
                  <Plus className='w-4 h-4 sm:w-5 sm:h-5 mr-2' />
                  Write First Review
                </Button>
              </motion.div>
            )}
          </div>

          <div className='flex justify-end pt-4 sm:pt-6 border-t border-gray-100 dark:border-slate-800 mt-6 sm:mt-8'>
            <Button
              onClick={() => setShowViewReviewDialog(false)}
              className='w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base'>
              Close Reviews
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Item Review Selector Dialog */}
      <Dialog
        open={showItemSelectorDialog}
        onOpenChange={setShowItemSelectorDialog}>
        <DialogContent className='max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl max-h-[85vh] overflow-y-auto mx-2 sm:mx-4 bg-white dark:bg-slate-900 border-0 shadow-2xl'>
          <DialogHeader className='pb-3 sm:pb-4 border-b border-gray-100 dark:border-slate-800'>
            <DialogTitle className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white text-center sm:text-left'>
              Review Your Order Items
            </DialogTitle>
            <DialogDescription className='text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 text-center sm:text-left px-1 sm:px-0'>
              Share your experience with items from{' '}
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                {selectedOrderForSelector?.canteen?.name}
              </span>
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForSelector && (
            <ItemReviewSelector
              order={selectedOrderForSelector}
              onWriteReview={handleItemSelectorWriteReview}
              onViewReviews={handleItemSelectorViewReviews}
              hasViewedReviews={hasViewedReviews}
              className='pt-3 sm:pt-4'
            />
          )}

          <div className='flex justify-end pt-3 sm:pt-4 border-t border-gray-100 dark:border-slate-800 mt-4 sm:mt-6'>
            <Button
              onClick={() => setShowItemSelectorDialog(false)}
              variant='outline'
              className='w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 border-2 border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all duration-300 text-xs sm:text-sm'>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
const btnBase =
  'w-full sm:w-auto h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-300';

// Enhanced Order Card Component
interface OrderCardProps {
  order: Order;
  index: number;
  onViewDetails: (order: Order) => void;
  onReorder: (order: Order) => void;
  onOpenItemSelector: () => void;
  orderDetailLoading: boolean;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  selectedOrder: Order | null;
}

const MotionWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className='w-full sm:w-auto'>
    {children}
  </motion.div>
);

const OrderCard: React.FC<OrderCardProps> = memo(
  ({
    order,
    index,
    onViewDetails,
    onReorder,
    onOpenItemSelector,
    orderDetailLoading,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedOrder,
  }) => {
    const statusConfig = useMemo(
      () => getStatusConfig(order.status),
      [order.status]
    );
    const StatusIcon = statusConfig.icon;
    const maxVisible = 3;

    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: index * 0.1,
          ease: [0.32, 0.72, 0, 1],
        }}
        whileHover={{
          y: -8,
          transition: { duration: 0.2 },
        }}>
        <Card className='relative overflow-hidden border-0 shadow-xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl group'>
          {/* Hover gradient overlay */}
          <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />

          {/* Header */}
          <CardHeader
            className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-b-2 relative z-10`}>
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              {/* Left: Status Icon & Order Info */}
              <div className='flex items-center gap-4'>
                <motion.div
                  className={`w-14 h-14 ${statusConfig.color} rounded-2xl flex items-center justify-center shadow-lg`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 300 }}>
                  <StatusIcon className='w-7 h-7 text-white' />
                </motion.div>

                <div className='flex-1'>
                  <CardTitle className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white'>
                    {order?.OrderNumber}
                  </CardTitle>
                  <CardDescription className='flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1'>
                    <Calendar className='w-4 h-4' />
                    {formatDate(order.createdAt)}
                  </CardDescription>
                </div>
              </div>

              {/* Right: Status Badge & Payment Info */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3'>
                <Badge
                  className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 px-4 py-2 font-semibold text-sm`}>
                  {statusConfig.label}
                </Badge>
                <div className='text-left sm:text-right'>
                  <div className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white'>
                    ₹{order.total.toFixed(2)}
                  </div>
                  {order.payment && (
                    <div className='text-sm text-gray-500 dark:text-gray-400 capitalize mt-1'>
                      {getPaymentConfig(order.payment.method).label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className='p-6 relative z-10'>
            {/* Restaurant Info */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4'>
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-gray-500 flex items-center justify-center'>
                  <ChefHat className='w-5 h-5 text-white' />
                </div>
                <div>
                  <span className='block font-semibold text-lg text-gray-900 dark:text-white'>
                    {order.canteen?.name ?? 'Unknown Restaurant'}
                  </span>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Campus Restaurant
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                <ShoppingBag className='w-4 h-4' />
                <span className='text-sm font-medium'>
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className='space-y-3 sm:space-y-4 mb-6 sm:mb-8'>
              {order.items
                .slice(0, maxVisible)
                .map(
                  (
                    { _id, item, quantity, nameAtPurchase, priceAtPurchase },
                    idx
                  ) => {
                    const {
                      name = nameAtPurchase || 'Item No Longer Available',
                      image,
                      price = priceAtPurchase || 0,
                    } = item || {};
                    return (
                      <motion.div
                        key={_id}
                        className='flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r from-white/80 via-gray-50/60 to-white/80 dark:from-slate-700/60 dark:via-slate-800/40 dark:to-slate-700/60 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-gray-100/80 dark:border-slate-600/50 hover:shadow-lg transition-all duration-300'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ scale: 1.02 }}>
                        <div className='flex items-center gap-3 sm:gap-4 flex-1 min-w-0'>
                          <div className='relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 shadow-lg'>
                            <Image
                              src={image || '/placeholder.svg'}
                              alt={name}
                              fill
                              className='object-cover'
                            />
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h4 className='font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg truncate mb-1'>
                              {name}
                            </h4>
                            <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                              <span className='bg-gray-200/80 dark:bg-slate-600/80 px-2 py-1 rounded-lg font-medium'>
                                Qty: {quantity}
                              </span>
                              <span className='text-gray-400 dark:text-gray-500'></span>
                              <span className='font-medium'>
                                ₹{(priceAtPurchase || price).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='text-right flex-shrink-0'>
                          <p className='font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg'>
                            ₹
                            {(quantity * (priceAtPurchase || price)).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  }
                )}

              {order.items.length > maxVisible && (
                <motion.div
                  className='text-center py-3 sm:py-4 text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium bg-gradient-to-r from-gray-50/60 via-white/40 to-gray-50/60 dark:from-slate-700/40 dark:via-slate-800/30 dark:to-slate-700/40 rounded-xl sm:rounded-2xl border border-gray-100/80 dark:border-slate-600/50'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}>
                  <div className='flex items-center justify-center gap-2'>
                    <Plus className='w-4 h-4 text-gray-400' />
                    <span>
                      {order.items.length - maxVisible} more item
                      {order.items.length - maxVisible !== 1 ? 's' : ''}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>

            <Separator className='my-6' />

            {/* Footer */}
            <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
              <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                <Clock className='w-4 h-4' />
                <span className='text-sm'>{statusConfig.description}</span>
              </div>

              {/* Buttons */}
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto'>
                {/* View Details Dialog */}
                <Dialog
                  open={isDetailModalOpen}
                  onOpenChange={setIsDetailModalOpen}>
                  <DialogTrigger asChild>
                    <MotionWrapper>
                      <Button
                        variant='outline'
                        size='sm'
                        className={`${btnBase} bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800`}
                        onClick={() => onViewDetails(order)}>
                        <span className='sm:hidden'>Details</span>
                        <span className='hidden sm:inline'>View Details</span>
                      </Button>
                    </MotionWrapper>
                  </DialogTrigger>

                  <DialogContent className='max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 mx-2 sm:mx-4 p-0'>
                    {orderDetailLoading ? (
                      <>
                        <DialogHeader>
                          <DialogTitle className='text-xl'>
                            Loading Order Details...
                          </DialogTitle>
                        </DialogHeader>
                        <div className='flex items-center justify-center py-20'>
                          <Loader2 className='h-8 w-8 animate-spin text-orange-500' />
                        </div>
                      </>
                    ) : selectedOrder ? (
                      <>
                        <DialogHeader className='border-b pb-4 sm:pb-6 dark:border-slate-700 p-4 sm:p-6'>
                          <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
                            <div
                              className={`w-12 h-12 sm:w-16 sm:h-16 ${statusConfig.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg mx-auto sm:mx-0`}>
                              <statusConfig.icon className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
                            </div>
                            <div className='text-center sm:text-left flex-1'>
                              <DialogTitle className='text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white'>
                                Order #
                                {order?.OrderNumber?.replace('order#', '')}
                              </DialogTitle>
                              <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1'>
                                {formatDate(selectedOrder.createdAt)}
                              </p>
                              <div className='flex items-center justify-center sm:justify-start gap-2 mt-2'>
                                <Badge
                                  className={`${statusConfig.bgColor} ${statusConfig.textColor} border-0 px-3 py-1 font-semibold text-xs sm:text-sm`}>
                                  {statusConfig.label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </DialogHeader>
                        <div className='p-4 sm:p-6'>
                          <OrderDetailsContent order={selectedOrder} />
                        </div>
                      </>
                    ) : (
                      <>
                        <DialogHeader>
                          <DialogTitle>Order Details</DialogTitle>
                        </DialogHeader>
                        <div className='flex items-center justify-center py-20'>
                          <p className='text-gray-500 dark:text-gray-400'>
                            No order selected
                          </p>
                        </div>
                      </>
                    )}
                  </DialogContent>
                </Dialog>

                {/* Completed Order Actions */}
                {order.status === 'completed' && (
                  <>
                    <MotionWrapper>
                      <Button
                        onClick={onOpenItemSelector}
                        variant='outline'
                        size='sm'
                        className={`${btnBase} bg-red-600 text-white border-2 border-red-700 hover:bg-red-700 dark:bg-red-700 dark:border-red-800 dark:hover:bg-red-800 shadow-lg hover:shadow-xl font-semibold`}>
                        <Star className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 fill-current' />
                        <span className='sm:hidden'>Review</span>
                        <span className='hidden sm:inline'>Write Reviews</span>
                      </Button>
                    </MotionWrapper>

                    <MotionWrapper>
                      <Button
                        onClick={() => onReorder(order)}
                        size='sm'
                        className={`${btnBase} bg-gradient-to-r from-red-800 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl font-semibold`}>
                        <RefreshCw className='w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2' />
                        Reorder
                      </Button>
                    </MotionWrapper>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }
);

// Memoized Order Details Content Component
const OrderDetailsContent = memo(function OrderDetailsContent({
  order,
}: {
  order: Order | null;
}) {
  if (!order) return null;

  const isCompleted = (statuses: OrderStatus[]) =>
    statuses.includes(order.status as OrderStatus);

  const isCurrentStatus = (status: string) => order.status === status;

  const getOrderTimeline = () => {
    const baseSteps = [
      {
        status: 'placed',
        label: 'Order Placed',
        icon: Receipt,
        isComplete: isCompleted(['placed', 'preparing', 'ready', 'completed']),
      },
      {
        status: 'preparing',
        label: 'Preparing',
        icon: ChefHat,
        isComplete: isCompleted(['preparing', 'ready', 'completed']),
      },
      {
        status: 'ready',
        label: 'Ready',
        icon: Package,
        isComplete: isCompleted(['ready', 'completed']),
      },
      {
        status: 'completed',
        label: 'Completed',
        icon: CheckCircle2,
        isComplete: order.status === 'completed',
      },
    ];

    if (order.status === 'payment_pending') {
      return [
        {
          status: 'payment_pending',
          label: 'Payment Pending',
          icon: Receipt,
          isComplete: true,
        },
      ];
    }

    if (order.status === 'cancelled') {
      return [
        {
          status: 'placed',
          label: 'Order Placed',
          icon: Receipt,
          isComplete: true,
        },
        {
          status: 'cancelled',
          label: 'Cancelled',
          icon: XCircle,
          isComplete: true,
        },
      ];
    }

    return baseSteps;
  };

  const timeline = getOrderTimeline();
  const maxVisible = 3;
  const progress =
    timeline.filter((step) => step.isComplete).length / timeline.length;

  return (
    <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8'>
      <div className='space-y-6 sm:space-y-8'>
        <div>
          <h3 className='text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 flex items-center gap-2'>
            <Truck className='w-4 h-4 sm:w-5 sm:h-5' />
            Order Timeline
          </h3>

          <div className='space-y-3 sm:space-y-4 md:space-y-6 relative'>
            <div className='absolute left-4 sm:left-5 md:left-6 top-4 sm:top-5 md:top-6 bottom-4 sm:bottom-5 md:bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700'>
              <motion.div
                className='bg-gradient-to-b from-green-500 to-blue-500 w-full origin-top'
                initial={{ scaleY: 0 }}
                animate={{ scaleY: progress }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
              />
            </div>

            {timeline.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = step.isComplete;
              const isCurrent = isCurrentStatus(step.status);

              return (
                <motion.div
                  key={step.status}
                  className='flex items-center gap-2 sm:gap-3 md:gap-4 relative z-10'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}>
                  <motion.div
                    className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 sm:border-3 md:border-4 border-white dark:border-slate-900 shadow-lg ${
                      isCompleted
                        ? step.status === 'cancelled'
                          ? 'bg-red-500'
                          : 'bg-green-500'
                        : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    whileHover={{ scale: 1.1 }}>
                    <StepIcon
                      className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${
                        isCompleted
                          ? 'text-white'
                          : 'text-gray-400 dark:text-slate-500'
                      }`}
                    />
                  </motion.div>

                  <div className='flex-1 min-w-0'>
                    <motion.div
                      className={`font-medium text-xs sm:text-sm md:text-base ${
                        isCompleted
                          ? 'text-gray-800 dark:text-gray-200'
                          : 'text-gray-400 dark:text-slate-500'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.2 + 0.5 }}>
                      {step.label}
                    </motion.div>

                    {isCompleted && isCurrent && (
                      <motion.div
                        className='text-xs text-green-600 dark:text-green-400 font-medium'
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.2 + 0.7 }}>
                        Current Status
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className='text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 sm:mb-6 flex items-center gap-2'>
            <ShoppingBag className='w-4 h-4 sm:w-5 sm:h-5 text-orange-500' />
            Order Summary
          </h3>

          <div className='space-y-3 sm:space-y-4 mb-6 sm:mb-8'>
            {order.items.slice(0, maxVisible).map((orderItem, idx) => {
              const { _id, item, quantity, nameAtPurchase, priceAtPurchase } =
                orderItem;
              const { image } = item || {};
              const name = nameAtPurchase || 'Item No Longer Available';
              const price = priceAtPurchase || 0;

              return (
                <motion.div
                  key={_id}
                  className='flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-gradient-to-r from-gray-50/90 via-white/50 to-gray-50/90 dark:from-slate-700/50 dark:via-slate-800/30 dark:to-slate-700/50 rounded-xl sm:rounded-2xl backdrop-blur-sm border border-gray-100 dark:border-slate-600 hover:shadow-md transition-all duration-200'
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}>
                  <div className='flex items-center gap-3 sm:gap-4 flex-1 min-w-0'>
                    <div className='relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 shadow-lg'>
                      <Image
                        src={image || '/placeholder.svg'}
                        alt={name}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg truncate mb-1'>
                        {name}
                      </h4>
                      <div className='flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                        <span className='bg-gray-200 dark:bg-slate-600 px-2 py-1 rounded-lg font-medium'>
                          Qty: {quantity}
                        </span>
                        <span className='text-gray-400 dark:text-gray-500'></span>
                        <span className='font-medium'>₹{price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  <div className='text-right flex-shrink-0'>
                    <p className='font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg'>
                      ₹{(quantity * price).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              );
            })}

            {order.items.length > maxVisible && (
              <motion.div
                className='text-center py-3 sm:py-4 text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium bg-gradient-to-r from-gray-50/50 via-white/30 to-gray-50/50 dark:from-slate-700/30 dark:via-slate-800/20 dark:to-slate-700/30 rounded-xl sm:rounded-2xl border border-gray-100 dark:border-slate-600'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}>
                <div className='flex items-center justify-center gap-2'>
                  <Plus className='w-4 h-4 text-gray-400' />
                  <span>
                    {order.items.length - maxVisible} more item
                    {order.items.length - maxVisible !== 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Order Total Breakdown */}
          <motion.div
            className='bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-4 sm:p-6 border-2 border-blue-100 dark:border-blue-800 mb-6 sm:mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}>
            <h4 className='text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
              <Receipt className='w-5 h-5 text-blue-500' />
              Order Total
            </h4>

            <div className='space-y-2 sm:space-y-3'>
              {/* Subtotal */}
              <div className='flex justify-between items-center text-sm sm:text-base'>
                <span className='text-gray-600 dark:text-gray-400'>
                  Subtotal ({order.items.length} items)
                </span>
                <span className='font-medium text-gray-800 dark:text-gray-200'>
                  ₹
                  {order.items
                    .reduce(
                      (sum, item) =>
                        sum + item.quantity * (item.priceAtPurchase || 0),
                      0
                    )
                    .toFixed(2)}
                </span>
              </div>

              {/* Additional fees and discounts can be shown here when available */}

              <Separator className='my-3 sm:my-4' />

              {/* Total */}
              <div className='flex justify-between items-center'>
                <span className='text-lg sm:text-xl font-bold text-gray-900 dark:text-white'>
                  Total Amount
                </span>
                <div className='text-right'>
                  <span className='text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent'>
                    ₹{order.total.toFixed(2)}
                  </span>
                  {order.payment && (
                    <div className='text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize'>
                      Paid via {getPaymentConfig(order.payment.method).label}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
});

// Main page component with route protection
export default function OrdersPage() {
  return (
    <RouteProtection requireAuth={true}>
      <OrdersPageContent />
    </RouteProtection>
  );
}
