'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Loader2,
  Sparkles,
  Users,
} from 'lucide-react';
import { Order, Review } from '@/types';
import { getItemReviews } from '@/services/reviewService';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';

interface ItemReviewSelectorProps {
  order: Order;
  onWriteReview: (item: any) => void;
  onViewReviews: (item: any) => void;
  hasViewedReviews?: (itemId: string) => boolean;
  className?: string;
}

interface ItemReviewStatus {
  [itemId: string]: {
    hasUserReviewed: boolean;
    totalReviews: number;
    averageRating: number;
    loading: boolean;
  };
}

export default function ItemReviewSelector({
  order,
  onWriteReview,
  onViewReviews,
  hasViewedReviews,
  className = '',
}: ItemReviewSelectorProps) {
  const { user } = useAuth();
  const [reviewStatus, setReviewStatus] = useState<ItemReviewStatus>({});
  const [initialLoading, setInitialLoading] = useState(true);

  // Check review status for all items
  useEffect(() => {
    const checkReviewStatus = async () => {
      if (!user?.id || !order.items.length) {
        setInitialLoading(false);
        return;
      }

      const statusChecks = order.items.map(async (item) => {
        const itemId =
          typeof item.item === 'string' ? item.item : item.item._id;

        setReviewStatus((prev) => ({
          ...prev,
          [itemId]: { ...prev[itemId], loading: true },
        }));

        try {
          const reviews = await getItemReviews(itemId);
          const hasUserReviewed = reviews.some(
            (review) => review.student._id === user.id
          );

          const totalReviews = reviews.length;
          const averageRating =
            totalReviews > 0
              ? reviews.reduce((sum, review) => sum + review.rating, 0) /
                totalReviews
              : 0;

          setReviewStatus((prev) => ({
            ...prev,
            [itemId]: {
              hasUserReviewed,
              totalReviews,
              averageRating,
              loading: false,
            },
          }));
        } catch (error) {
          console.error(
            `Error checking review status for item ${itemId}:`,
            error
          );
          setReviewStatus((prev) => ({
            ...prev,
            [itemId]: {
              hasUserReviewed: false,
              totalReviews: 0,
              averageRating: 0,
              loading: false,
            },
          }));
        }
      });

      await Promise.all(statusChecks);
      setInitialLoading(false);
    };

    checkReviewStatus();
  }, [user?.id, order.items]);

  const handleWriteReview = (item: any) => {
    const itemId = typeof item.item === 'string' ? item.item : item.item._id;
    const status = reviewStatus[itemId];

    if (status?.hasUserReviewed) {
      toast.info('You have already reviewed this item! 😊');
      return;
    }

    onWriteReview(item);
  };

  const handleViewReviews = (item: any) => {
    onViewReviews(item);
  };

  if (initialLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg'>
          <Loader2 className='h-6 w-6 text-white' />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className='text-center mb-4 sm:mb-6'>
        <div className='flex justify-center mb-2 sm:mb-3'>
          <div className='w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg'>
            <Sparkles className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
          </div>
        </div>
        <h3 className='text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-1'>
          Share Your Experience
        </h3>
        <p className='text-gray-600 dark:text-gray-400 text-xs sm:text-sm'>
          Help fellow students by reviewing items from your order
        </p>
      </motion.div>

      {/* Items Grid */}
      <div className='grid gap-3 sm:gap-4'>
        <AnimatePresence mode='popLayout'>
          {order.items.map((item, index) => {
            const itemId =
              typeof item.item === 'string' ? item.item : item.item._id;
            const status = reviewStatus[itemId] || {
              hasUserReviewed: false,
              totalReviews: 0,
              averageRating: 0,
              loading: false,
            };

            return (
              <motion.div
                key={`${item._id}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.1,
                  ease: [0.32, 0.72, 0, 1],
                }}
                whileHover={{ y: -2 }}
                className='group'>
                <Card className='overflow-hidden border-0 shadow-md hover:shadow-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm transition-all duration-300 relative'>
                  {/* Background gradient overlay */}
                  <div className='absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-500/5 dark:to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

                  <CardContent className='p-3 sm:p-4 relative z-10'>
                    <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
                      {/* Item Image and Basic Info */}
                      <div className='flex items-center gap-3 flex-1'>
                        <div className='relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden bg-gray-200 dark:bg-slate-600 flex-shrink-0 shadow-md'>
                          <Image
                            src={item.item?.image || '/placeholder.svg'}
                            alt={item.item?.name || 'Item'}
                            fill
                            className='object-cover transition-transform duration-300 group-hover:scale-110'
                          />
                          {status.hasUserReviewed && (
                            <div className='absolute inset-0 bg-black/20 flex items-center justify-center'>
                              <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg'>
                                <CheckCircle2 className='w-3 h-3 text-white' />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className='flex-1 min-w-0'>
                          <h4 className='font-semibold text-sm sm:text-base text-gray-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300 truncate'>
                            {item.item?.name || 'Unknown Item'}
                          </h4>
                          <div className='flex items-center gap-2 sm:gap-3 text-xs text-gray-600 dark:text-gray-400'>
                            <span className='flex items-center gap-1'>
                              <span className='font-medium'>Qty:</span>
                              <Badge
                                variant='outline'
                                className='text-xs px-1.5 py-0.5 h-auto'>
                                {item.quantity}
                              </Badge>
                            </span>
                            <span className='flex items-center gap-1'>
                              <span className='font-medium'>
                                ₹{item.item?.price || 0}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Review Stats - Hidden on mobile, shown on sm+ */}
                      {status.totalReviews > 0 && (
                        <div className='hidden sm:flex flex-col items-end gap-1 flex-shrink-0'>
                          <div className='flex items-center gap-1'>
                            <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                            <span className='font-semibold text-xs text-gray-700 dark:text-gray-300'>
                              {status.averageRating.toFixed(1)}
                            </span>
                          </div>
                          <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                            <Users className='w-3 h-3' />
                            <span>{status.totalReviews}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mobile Review Stats */}
                    {status.totalReviews > 0 && (
                      <div className='flex items-center justify-center gap-4 mt-2 sm:hidden'>
                        <div className='flex items-center gap-1'>
                          <Star className='w-3 h-3 fill-yellow-400 text-yellow-400' />
                          <span className='font-semibold text-xs text-gray-700 dark:text-gray-300'>
                            {status.averageRating.toFixed(1)}
                          </span>
                        </div>
                        <div className='flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400'>
                          <Users className='w-3 h-3' />
                          <span>
                            {status.totalReviews} review
                            {status.totalReviews !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    <Separator className='my-3' />

                    {/* Action Buttons */}
                    <div className='flex flex-col sm:flex-row gap-2'>
                      {/* Write Review Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='flex-1'>
                        <Button
                          onClick={() => handleWriteReview(item)}
                          disabled={status.hasUserReviewed || status.loading}
                          size='sm'
                          className={`w-full h-8 sm:h-9 text-xs font-medium shadow-md transition-all duration-300 ${
                            status.hasUserReviewed
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-2 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30 cursor-default'
                              : 'bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white hover:shadow-lg border-0'
                          }`}>
                          {status.loading ? (
                            <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                          ) : status.hasUserReviewed ? (
                            <CheckCircle2 className='w-3 h-3 mr-1' />
                          ) : (
                            <Star className='w-3 h-3 mr-1 fill-current' />
                          )}
                          {status.hasUserReviewed
                            ? 'Reviewed ✓'
                            : 'Write Review'}
                        </Button>
                      </motion.div>

                      {/* View Reviews Button */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className='flex-1'>
                        <Button
                          onClick={() => handleViewReviews(item)}
                          variant='outline'
                          size='sm'
                          disabled={status.loading}
                          className={`w-full h-8 sm:h-9 border-2 text-xs font-medium shadow-md hover:shadow-lg transition-all duration-300 ${
                            hasViewedReviews && hasViewedReviews(itemId)
                              ? 'border-green-200 dark:border-green-700 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 bg-green-50/50 dark:bg-green-950/20'
                              : 'border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                          }`}>
                          {status.loading ? (
                            <Loader2 className='w-3 h-3 mr-1 animate-spin' />
                          ) : hasViewedReviews && hasViewedReviews(itemId) ? (
                            <CheckCircle2 className='w-3 h-3 mr-1' />
                          ) : (
                            <MessageSquare className='w-3 h-3 mr-1' />
                          )}
                          <span className='hidden sm:inline'>
                            {hasViewedReviews && hasViewedReviews(itemId)
                              ? 'Viewed ✓'
                              : 'View Reviews'}
                          </span>
                          <span className='sm:hidden'>
                            {hasViewedReviews && hasViewedReviews(itemId)
                              ? 'Viewed'
                              : 'Reviews'}
                          </span>
                          {status.totalReviews > 0 && (
                            <Badge
                              className={`ml-1 text-xs h-auto px-1.5 py-0.5 ${
                                hasViewedReviews && hasViewedReviews(itemId)
                                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                              }`}>
                              {status.totalReviews}
                            </Badge>
                          )}
                        </Button>
                      </motion.div>
                    </div>

                    {/* User Already Reviewed Message */}
                    {status.hasUserReviewed && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className='mt-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg'>
                        <div className='flex items-center gap-2 text-green-700 dark:text-green-400 text-xs'>
                          <CheckCircle2 className='w-3 h-3 flex-shrink-0' />
                          <span className='font-medium'>
                            Already reviewed! Thanks for helping! 🌟
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {/* Reviews Viewed Indicator */}
                    {hasViewedReviews &&
                      hasViewedReviews(itemId) &&
                      !status.hasUserReviewed && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className='mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
                          <div className='flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs'>
                            <CheckCircle2 className='w-3 h-3 flex-shrink-0' />
                            <span className='font-medium'>
                              Reviews viewed 👀
                            </span>
                          </div>
                        </motion.div>
                      )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className='text-center mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg border border-orange-200 dark:border-orange-800'>
        <p className='text-xs sm:text-sm text-gray-700 dark:text-gray-300'>
          <span className='font-semibold'>💡 Pro tip:</span> Your reviews help
          fellow students make better food choices!
        </p>
      </motion.div>
    </div>
  );
}
