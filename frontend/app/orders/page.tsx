'use client';

import { useState, useEffect } from 'react';
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
import { useAuth } from '@/context/auth-context';
import { useCart } from '@/context/cart-context';
import Image from 'next/image';
import { Order, Review } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Loader2,
  Inbox,
  AlertCircle,
  Eye,
  Clock,
  MapPin,
  CreditCard,
  Package,
  ChefHat,
  CheckCircle2,
  XCircle,
  Truck,
  Receipt,
  Calendar,
  ShoppingBag,
  Star,
  ArrowRight,
  RefreshCw,
  MessageSquare,
  Heart,
  Plus,
} from 'lucide-react';
import { getMyOrders, getOrderById, AuthError } from '@/services/orderService';
import { createReview } from '@/services/reviewService';
import { toast } from 'sonner';
import {
  motion,
  AnimatePresence,
  useInView,
  useSpring,
  useTransform,
} from 'framer-motion';

// Shared Helper Functions
const getStatusConfig = (status: string) => {
  const configs = {
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
      bgColor: 'bg-orange-50 dark:bg-orange-950/50',
      textColor: 'text-orange-700 dark:text-orange-300',
      borderColor: 'border-orange-200 dark:border-orange-800',
      icon: Receipt,
      label: 'Payment Pending',
      description: 'Payment is pending for this order',
    },
    preparing: {
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/50',
      textColor: 'text-yellow-700 dark:text-yellow-300',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: ChefHat,
      label: 'Preparing',
      description: 'Your food is being prepared',
    },
    ready: {
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-950/50',
      textColor: 'text-purple-700 dark:text-purple-300',
      borderColor: 'border-purple-200 dark:border-purple-800',
      icon: Package,
      label: 'Ready for Pickup',
      description: 'Your order is ready',
    },
    completed: {
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-950/50',
      textColor: 'text-green-700 dark:text-green-300',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: CheckCircle2,
      label: 'Completed',
      description: 'Order delivered successfully',
    },
    cancelled: {
      color: 'bg-red-500',
      bgColor: 'bg-red-50 dark:bg-red-950/50',
      textColor: 'text-red-700 dark:text-red-300',
      borderColor: 'border-red-200 dark:border-red-800',
      icon: XCircle,
      label: 'Cancelled',
      description: 'Order was cancelled',
    },
  };
  return configs[status as keyof typeof configs] || configs.placed;
};

const getPaymentConfig = (method: string) => {
  const configs = {
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
  return configs[method as keyof typeof configs] || configs.cod;
};

const formatDate = (dateString: string) => {
  if (!dateString) return 'Date not available';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};

// Animated Counter Component
function AnimatedCounter({
  value,
  duration = 1,
}: {
  value: number;
  duration?: number;
}) {
  const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

export default function OrdersPage() {
  const { isAuthenticated, token } = useAuth();
  const { addToCart, clearCart } = useCart();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Review related state
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedItemForReview, setSelectedItemForReview] = useState<any>(null);
  const [selectedOrderForReview, setSelectedOrderForReview] =
    useState<Order | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showItemSelection, setShowItemSelection] = useState(false);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);

  useEffect(() => {
    if (isAuthenticated && token) {
      fetchOrders();
    }
  }, [isAuthenticated, token]);

  // Function to map API response to expected Order structure
  const mapApiResponseToOrder = (apiOrder: any): Order => {
    return {
      _id: apiOrder._id,
      student: apiOrder.student?.name || 'Unknown Student',
      canteen: {
        _id: apiOrder.canteen?._id || '',
        name: apiOrder.canteen?.name || 'Unknown Canteen',
      },
      items: apiOrder.items.map((item: any) => ({
        _id: item._id,
        item: {
          _id: item.item || '',
          name: item.nameAtPurchase || 'Unknown Item',
          price: item.priceAtPurchase || 0,
          image: undefined, // API doesn't provide image in this response
        },
        quantity: item.quantity || 0,
      })),
      total: apiOrder.total || 0,
      status: apiOrder.status,
      payment: {
        method: 'cod', // Default to COD since API doesn't specify
        status: apiOrder.status === 'payment_pending' ? 'pending' : 'completed',
      },
      createdAt: apiOrder.createdAt,
      updatedAt: apiOrder.updatedAt,
    };
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyOrders(token!);
      // Map the API response to match the expected Order structure
      const mappedOrders = response.data.map(mapApiResponseToOrder);
      setOrders(mappedOrders);
    } catch (err: any) {
      if (err instanceof AuthError) {
        setError('Session expired. Please login again to view your orders.');
      } else {
        setError(err.message || 'Failed to fetch orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId: string) => {
    try {
      setOrderDetailLoading(true);
      setSelectedOrder(null); // Clear previous order
      setIsDetailModalOpen(true); // Open modal immediately to show loading
      const response = await getOrderById(orderId, token!);
      setSelectedOrder(response.data);
    } catch (err: any) {
      console.error('Failed to fetch order details:', err);
      setIsDetailModalOpen(false); // Close modal on error
      // Show error toast or message
      alert('Failed to load order details. Please try again.');
    } finally {
      setOrderDetailLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 flex items-center justify-center relative overflow-hidden'>
        {/* Enhanced Background Elements */}
        <div className='absolute inset-0'>
          <motion.div
            className='absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 dark:from-blue-600/20 dark:to-purple-600/20 rounded-full blur-3xl'
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className='absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-pink-400/20 dark:from-orange-600/20 dark:to-pink-600/20 rounded-full blur-3xl'
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2,
            }}
          />
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
                  <Link href='/login'>
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

    if (reviewRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!reviewComment.trim()) {
      toast.error('Please add a comment');
      return;
    }

    if (!selectedItemForReview || !selectedOrderForReview) {
      toast.error('Invalid review data');
      return;
    }

    setReviewSubmitting(true);
    try {
      const reviewData = {
        canteenId: selectedOrderForReview.canteen._id,
        itemId:
          typeof selectedItemForReview.item === 'string'
            ? selectedItemForReview.item
            : selectedItemForReview.item._id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      };

      await createReview(reviewData);

      // Close review dialog and reset form
      setShowReviewDialog(false);
      setReviewRating(0);
      setReviewComment('');
      setSelectedItemForReview(null);
      setSelectedOrderForReview(null);

      // Show thank you dialog
      setShowThankYouDialog(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Reorder functionality
  const handleReorder = (order: Order) => {
    try {
      // Clear current cart first
      clearCart();

      // Add all items from the order to cart
      let itemsAdded = 0;
      order.items.forEach((orderItem) => {
        if (orderItem.item && orderItem.item._id) {
          addToCart({
            id: orderItem.item._id,
            name: orderItem.item.name,
            price: orderItem.item.price,
            quantity: orderItem.quantity,
            image: orderItem.item.image || '/placeholder.svg',
            canteenId: order.canteen._id,
          });
          itemsAdded++;
        }
      });

      if (itemsAdded > 0) {
        toast.success(`${itemsAdded} items added to cart! 🛒`, {
          description: 'Redirecting to cart...',
          duration: 2000,
        });

        // Navigate to cart page after a short delay
        setTimeout(() => {
          router.push('/cart');
        }, 1000);
      } else {
        toast.error('No items could be added to cart');
      }
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('Failed to reorder. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900'>
        {/* Modern Header */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent'>
                  My Orders
                </h1>
                <p className='text-gray-600 dark:text-slate-300 mt-1 text-sm sm:text-base'>
                  Track your delicious journey
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <motion.div
            className='flex flex-col items-center justify-center py-20'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}>
            <div className='relative'>
              <motion.div
                className='w-20 h-20 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-8 shadow-2xl'
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}>
                <Loader2 className='h-10 w-10 text-white animate-spin' />
              </motion.div>
              <motion.div
                className='absolute -inset-6 bg-gradient-to-r from-orange-200/40 via-red-200/40 to-pink-200/40 dark:from-orange-500/20 dark:via-red-500/20 dark:to-pink-500/20 rounded-3xl blur-2xl'
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
              <p className='text-gray-700 dark:text-slate-300 text-lg font-medium mb-2'>
                Loading your orders...
              </p>
              <p className='text-gray-500 dark:text-slate-400 text-sm'>
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
        {/* Modern Header */}
        <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <h1 className='text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent'>
              My Orders
            </h1>
          </div>
        </div>

        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-12'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className='max-w-2xl mx-auto'>
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

  // Split orders into active and history
  const activeOrders = orders.filter((o) =>
    ['placed', 'preparing', 'ready', 'payment_pending'].includes(o.status)
  );

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-900 relative overflow-hidden'>
      {/* Animated Background Elements */}
      <div className='absolute inset-0 overflow-hidden'>
        <motion.div
          className='absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-400/10 via-purple-400/10 to-pink-400/10 dark:from-blue-600/10 dark:via-purple-600/10 dark:to-pink-600/10 rounded-full blur-3xl'
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className='absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-orange-400/10 via-red-400/10 to-pink-400/10 dark:from-orange-600/10 dark:via-red-600/10 dark:to-pink-600/10 rounded-full blur-3xl'
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 0.8, 1],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2,
          }}
        />
      </div>

      {/* Modern Header with Stats */}
      <div className='bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-slate-700/50 sticky top-0 z-50'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
            <div>
              <h1 className='text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent'>
                My Orders
              </h1>
              <p className='text-gray-600 dark:text-slate-300 mt-2 text-sm sm:text-base'>
                Track your delicious journey across campus
              </p>
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
            className='text-center py-16 lg:py-24'>
            <div className='max-w-md mx-auto'>
              <motion.div
                className='w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl flex items-center justify-center'
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <Inbox className='w-12 h-12 text-orange-500' />
              </motion.div>
              <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
                No orders yet
              </h3>
              <p className='text-gray-600 dark:text-gray-300 mb-8 leading-relaxed'>
                Start your food journey by exploring our amazing campus
                restaurants and placing your first order.
              </p>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}>
                <Button
                  asChild
                  className='bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300'>
                  <Link href='/menu'>
                    <Plus className='w-5 h-5 mr-2' />
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
                  <div className='w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center'>
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
                      onWriteReview={() => {
                        setSelectedOrderForReview(order);
                        setShowItemSelection(true);
                      }}
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
                <div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center'>
                  <Receipt className='w-4 h-4 text-white' />
                </div>
                <h2 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white'>
                  Order History
                </h2>
                <Badge className='bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
                  {
                    orders.filter((o) =>
                      ['completed', 'cancelled'].includes(o.status)
                    ).length
                  }
                </Badge>
              </div>
              <div className='grid gap-4 lg:gap-6'>
                {orders
                  .filter((o) => ['completed', 'cancelled'].includes(o.status))
                  .map((order, index) => (
                    <OrderCard
                      key={order._id}
                      order={order}
                      index={index}
                      onViewDetails={handleViewDetails}
                      onReorder={handleReorder}
                      onWriteReview={() => {
                        setSelectedOrderForReview(order);
                        setShowItemSelection(true);
                      }}
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
      <Dialog open={showItemSelection} onOpenChange={setShowItemSelection}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto mx-4'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold'>
              Select Item to Review
            </DialogTitle>
            <DialogDescription className='text-base'>
              Choose an item from this order to write a review
            </DialogDescription>
          </DialogHeader>

          {selectedOrderForReview && (
            <div className='space-y-4'>
              {selectedOrderForReview.items.map((orderItem, index) => (
                <Card
                  key={`${orderItem._id}-${index}`}
                  className='hover:shadow-lg transition-all duration-300 border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm'>
                  <CardContent className='p-4'>
                    <div className='flex items-center justify-between flex-wrap gap-4'>
                      <div className='flex items-center space-x-4 flex-1 min-w-0'>
                        <div className='relative w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0'>
                          <Image
                            src={orderItem.item?.image || '/placeholder.svg'}
                            alt={orderItem.item?.name || 'Item'}
                            fill
                            className='object-cover'
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='font-semibold text-lg text-gray-900 dark:text-white truncate'>
                            {orderItem.item?.name}
                          </h3>
                          <div className='flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-gray-400'>
                            <span>Qty: {orderItem.quantity}</span>
                            <span>₹{orderItem.item?.price}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        size='sm'
                        className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
                        onClick={() => {
                          handleWriteReview(selectedOrderForReview, orderItem);
                          setShowItemSelection(false);
                        }}>
                        <Star className='w-4 h-4 mr-1' />
                        Write Review
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Write Review Dialog */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className='max-w-2xl mx-4'>
          <DialogHeader>
            <DialogTitle className='text-xl font-bold'>
              Write a Review
            </DialogTitle>
            <DialogDescription className='text-base'>
              Share your experience with {selectedItemForReview?.item?.name}{' '}
              from {selectedOrderForReview?.canteen?.name}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitReview} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300'>
                Rating
              </label>
              <div className='flex items-center space-x-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type='button'
                    className='cursor-pointer transition-all duration-200'
                    onClick={() => setReviewRating(star)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}>
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        star <= reviewRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300'>
                Comment
              </label>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder='Share your experience with this item...'
                rows={5}
                required
                className='resize-none'
              />
            </div>

            <div className='flex gap-3 justify-end pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowReviewDialog(false)}>
                Cancel
              </Button>
              <Button
                type='submit'
                disabled={reviewSubmitting}
                className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white'>
                {reviewSubmitting ? (
                  <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                    Submitting...
                  </>
                ) : (
                  'Submit Review'
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Thank You Dialog */}
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent className='max-w-md text-center mx-4'>
          <DialogHeader>
            <div className='flex justify-center mb-6'>
              <motion.div
                className='w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-2xl'
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
                  <Heart className='w-12 h-12 text-white fill-current' />
                </motion.div>
              </motion.div>
            </div>
            <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
              Thank You! 🎉
            </DialogTitle>
            <DialogDescription className='text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-8'>
              Your review has been submitted successfully! Your feedback helps
              us improve our service and makes other students happy! ✨
            </DialogDescription>
          </DialogHeader>

          <motion.div
            className='space-y-6'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}>
            <div className='bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-4 rounded-xl border border-orange-200 dark:border-orange-800'>
              <p className='text-sm text-gray-700 dark:text-gray-300'>
                <strong>🌟 Your voice matters!</strong> Thanks for helping
                fellow students make great food choices.
              </p>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowThankYouDialog(false)}
                className='w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 py-3'>
                Continue Exploring
              </Button>
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Enhanced Order Card Component
function OrderCard({
  order,
  index,
  onViewDetails,
  onReorder,
  onWriteReview,
  orderDetailLoading,
  isDetailModalOpen,
  setIsDetailModalOpen,
  selectedOrder,
}: {
  order: Order;
  index: number;
  onViewDetails: (orderId: string) => void;
  onReorder: (order: Order) => void;
  onWriteReview: () => void;
  orderDetailLoading: boolean;
  isDetailModalOpen: boolean;
  setIsDetailModalOpen: (open: boolean) => void;
  selectedOrder: Order | null;
}) {
  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

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
      <Card className='overflow-hidden border-0 shadow-xl hover:shadow-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm transition-all duration-300 group relative'>
        <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

        {/* Header */}
        <CardHeader
          className={`${statusConfig.bgColor} ${statusConfig.borderColor} border-b-2 relative z-10`}>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-4'>
              <motion.div
                className={`w-14 h-14 ${statusConfig.color} rounded-2xl flex items-center justify-center shadow-lg`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}>
                <StatusIcon className='w-7 h-7 text-white' />
              </motion.div>
              <div className='flex-1'>
                <CardTitle className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white'>
                  Order #{order._id.slice(-6).toUpperCase()}
                </CardTitle>
                <CardDescription className='flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1'>
                  <Calendar className='w-4 h-4' />
                  {formatDate(order.createdAt)}
                </CardDescription>
              </div>
            </div>
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
              <div className='w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center'>
                <ChefHat className='w-5 h-5 text-white' />
              </div>
              <div>
                <span className='font-semibold text-gray-900 dark:text-white text-lg'>
                  {order.canteen?.name || 'Unknown Restaurant'}
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
          <div className='space-y-3 mb-6'>
            {order.items.slice(0, 3).map((item, itemIndex) => (
              <motion.div
                key={item._id}
                className='flex items-center gap-4 p-4 bg-gray-50/80 dark:bg-slate-700/50 rounded-xl backdrop-blur-sm'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + itemIndex * 0.05 }}>
                <div className='relative w-14 h-14 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0'>
                  <Image
                    src={item.item?.image || '/placeholder.svg'}
                    alt={item.item?.name || 'Item'}
                    fill
                    className='object-cover'
                  />
                </div>
                <div className='flex-1 min-w-0'>
                  <h4 className='font-semibold text-gray-900 dark:text-white truncate text-base'>
                    {item.item?.name || 'Item No Longer Available'}
                  </h4>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    Qty: {item.quantity}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-semibold text-gray-800 dark:text-gray-200 text-base'>
                    ₹{(item.quantity * (item.item?.price || 0)).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            ))}
            {order.items.length > 3 && (
              <div className='text-center py-3 text-gray-500 dark:text-gray-400 text-sm font-medium bg-gray-50/50 dark:bg-slate-700/30 rounded-xl'>
                +{order.items.length - 3} more item
                {order.items.length - 3 !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <Separator className='my-6' />

          {/* Footer */}
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
              <Clock className='w-4 h-4' />
              <span className='text-sm'>{statusConfig.description}</span>
            </div>

            <div className='flex flex-wrap gap-3'>
              <Dialog
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}>
                <DialogTrigger asChild>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    <Button
                      variant='outline'
                      className='border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50'
                      onClick={() => onViewDetails(order._id)}
                      disabled={orderDetailLoading}>
                      {orderDetailLoading ? (
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      ) : (
                        <Eye className='w-4 h-4 mr-2' />
                      )}
                      View Details
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className='max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 mx-4'>
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
                      <DialogHeader className='border-b pb-6 dark:border-slate-700'>
                        <div className='flex items-center gap-4'>
                          <div
                            className={`w-16 h-16 ${
                              getStatusConfig(selectedOrder.status).color
                            } rounded-2xl flex items-center justify-center shadow-lg`}>
                            {(() => {
                              const StatusIcon = getStatusConfig(
                                selectedOrder.status
                              ).icon;
                              return (
                                <StatusIcon className='w-8 h-8 text-white' />
                              );
                            })()}
                          </div>
                          <div>
                            <DialogTitle className='text-2xl font-bold text-gray-900 dark:text-white'>
                              Order #{selectedOrder._id.slice(-8).toUpperCase()}
                            </DialogTitle>
                            <p className='text-gray-600 dark:text-gray-400 mt-1'>
                              {formatDate(selectedOrder.createdAt)}
                            </p>
                          </div>
                        </div>
                      </DialogHeader>
                      <OrderDetailsContent order={selectedOrder} />
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

              {order.status === 'completed' && (
                <>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    <Button
                      variant='outline'
                      className='border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/50'
                      onClick={onWriteReview}>
                      <Star className='w-4 h-4 mr-2' />
                      Review
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => onReorder(order)}
                      className='bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300'>
                      <RefreshCw className='w-4 h-4 mr-2' />
                      Reorder
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Order Details Content Component (Enhanced)
function OrderDetailsContent({ order }: { order: Order | null }) {
  if (!order) return null;

  const getOrderTimeline = (order: Order) => {
    // Handle payment_pending status
    if (order.status === 'payment_pending') {
      return [
        {
          status: 'payment_pending',
          label: 'Payment Pending',
          icon: Receipt,
          completed: true,
        },
      ];
    }

    // Handle cancelled status
    if (order.status === 'cancelled') {
      return [
        {
          status: 'placed',
          label: 'Order Placed',
          icon: Receipt,
          completed: true,
        },
        {
          status: 'cancelled',
          label: 'Cancelled',
          icon: XCircle,
          completed: true,
        },
      ];
    }

    const timeline = [
      {
        status: 'placed',
        label: 'Order Placed',
        icon: Receipt,
        completed: ['placed', 'preparing', 'ready', 'completed'].includes(
          order.status
        ),
      },
      {
        status: 'preparing',
        label: 'Preparing',
        icon: ChefHat,
        completed: ['preparing', 'ready', 'completed'].includes(order.status),
      },
      {
        status: 'ready',
        label: 'Ready',
        icon: Package,
        completed: ['ready', 'completed'].includes(order.status),
      },
      {
        status: 'completed',
        label: 'Completed',
        icon: CheckCircle2,
        completed: order.status === 'completed',
      },
    ];

    return timeline;
  };

  return (
    <div className='grid lg:grid-cols-2 gap-8 py-6'>
      {/* Order Timeline */}
      <div>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2'>
          <Truck className='w-5 h-5' />
          Order Timeline
        </h3>
        <div className='space-y-6 relative'>
          {/* Progress Line */}
          <div className='absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-slate-700'>
            <motion.div
              className='bg-gradient-to-b from-green-500 to-blue-500 w-full origin-top'
              initial={{ scaleY: 0 }}
              animate={{
                scaleY:
                  getOrderTimeline(order).filter((s) => s.completed).length /
                  getOrderTimeline(order).length,
              }}
              transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
            />
          </div>

          {getOrderTimeline(order).map((step, index) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.status}
                className='flex items-center gap-4 relative z-10'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}>
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-lg ${
                    step.completed
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
                    className={`w-6 h-6 ${
                      step.completed
                        ? 'text-white'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}
                  />
                </motion.div>
                <div className='flex-1'>
                  <motion.div
                    className={`font-medium text-base ${
                      step.completed
                        ? 'text-gray-800 dark:text-gray-200'
                        : 'text-gray-400 dark:text-slate-500'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.2 + 0.5 }}>
                    {step.label}
                  </motion.div>
                  {step.completed && order.status === step.status && (
                    <motion.div
                      className='text-sm text-green-600 dark:text-green-400 font-medium'
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

      {/* Restaurant & Payment Info */}
      <div className='space-y-6'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2'>
            <MapPin className='w-5 h-5' />
            Restaurant Details
          </h3>
          <Card className='p-6 bg-gray-50/80 border-gray-200 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur-sm'>
            <div className='flex items-center gap-4'>
              <div className='w-14 h-14 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg'>
                <ChefHat className='w-7 h-7 text-white' />
              </div>
              <div>
                <h4 className='font-semibold text-gray-800 dark:text-gray-200 text-lg'>
                  {order.canteen?.name || 'Unknown Restaurant'}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Campus Restaurant
                </p>
              </div>
            </div>
          </Card>
        </div>

        {order.payment && (
          <div>
            <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2'>
              <CreditCard className='w-5 h-5' />
              Payment Information
            </h3>
            <Card className='p-6 bg-gray-50/80 border-gray-200 dark:bg-slate-800/80 dark:border-slate-700 backdrop-blur-sm'>
              <div className='space-y-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Method:
                  </span>
                  <span className='font-medium capitalize dark:text-gray-200 text-base'>
                    {order.payment.method}
                  </span>
                </div>
                <div className='flex justify-between items-center'>
                  <span className='text-gray-600 dark:text-gray-400'>
                    Status:
                  </span>
                  <Badge
                    className={`${
                      order.payment.status === 'completed'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : order.payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    } border-0`}>
                    {order.payment.status}
                  </Badge>
                </div>
                {order.payment.transactionId && (
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      Transaction ID:
                    </span>
                    <span className='font-mono text-sm dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded'>
                      {order.payment.transactionId}
                    </span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className='lg:col-span-2 border-t pt-8 dark:border-slate-700'>
        <h3 className='text-lg font-semibold text-gray-800 dark:text-gray-200 mb-6 flex items-center gap-2'>
          <ShoppingBag className='w-5 h-5' />
          Order Items ({order.items.length})
        </h3>
        <div className='space-y-4'>
          {order.items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}>
              <Card className='p-6 border-gray-200 dark:border-slate-700 dark:bg-slate-800/50 hover:shadow-lg transition-all duration-300 backdrop-blur-sm'>
                <div className='flex items-center gap-6'>
                  <div className='relative w-20 h-20 rounded-xl overflow-hidden bg-gray-200 dark:bg-slate-700 flex-shrink-0'>
                    <Image
                      src={item.item?.image || '/placeholder.svg'}
                      alt={item.item?.name || 'Item'}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-800 dark:text-gray-200 text-lg'>
                      {item.item?.name || 'Item No Longer Available'}
                    </h4>
                    <div className='flex items-center gap-6 mt-3'>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-600 dark:text-gray-400 text-sm'>
                          Quantity:
                        </span>
                        <span className='font-medium text-gray-800 dark:text-gray-200'>
                          {item.quantity || 'N/A'}
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <span className='text-gray-600 dark:text-gray-400 text-sm'>
                          Unit Price:
                        </span>
                        <span className='font-medium text-gray-800 dark:text-gray-200'>
                          ₹{item.item?.price || 0}
                        </span>
                      </div>
                    </div>
                    {(!item.item ||
                      item.item.name === 'Item No Longer Available') && (
                      <p className='text-sm text-red-500 italic mt-2'>
                        This item may have been removed from the menu
                      </p>
                    )}
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-gray-800 dark:text-gray-200'>
                      ₹
                      {((item.quantity || 0) * (item.item?.price || 0)).toFixed(
                        2
                      )}
                    </div>
                    <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                      Subtotal
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Order Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          <Card className='mt-8 p-8 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 dark:bg-gradient-to-r dark:from-slate-800 dark:to-slate-700 dark:border-slate-700 shadow-lg'>
            <div className='flex justify-between items-center'>
              <div className='text-xl font-semibold text-gray-800 dark:text-gray-200'>
                Total Amount
              </div>
              <div className='text-4xl font-bold text-gray-900 dark:text-gray-100'>
                ₹{order.total.toFixed(2)}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
