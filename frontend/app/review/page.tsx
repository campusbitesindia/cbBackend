'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Star,
  MessageSquare,
  Clock,
  Heart,
  ThumbsUp,
  Award,
  Sparkles,
  ChefHat,
  Users,
} from 'lucide-react';
import { Order, Review } from '@/types';
import { getMyOrders } from '@/services/orderService';
import { createReview, getItemReviews } from '@/services/reviewService';
import { useAuth } from '@/context/auth-context';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReviewableItem {
  itemId: string;
  itemName: string;
  itemImage?: string;
  canteenId: string;
  canteenName: string;
  orderId: string;
  orderDate: string;
  quantity: number;
  price: number;
}

const StarRating = ({
  rating,
  onRatingChange,
  interactive = false,
  size = 'md',
}: {
  rating: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div className='flex items-center space-x-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          className={`${
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          } transition-all duration-200 ease-in-out`}
          onClick={() => interactive && onRatingChange?.(star)}
          onMouseEnter={() => interactive && setHoverRating(star)}
          onMouseLeave={() => interactive && setHoverRating(0)}
          disabled={!interactive}>
          <Star
            className={`${sizeClasses[size]} transition-all duration-200 ${
              star <= (interactive ? hoverRating || rating : rating)
                ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                : 'text-gray-300 hover:text-yellow-200'
            }`}
          />
        </button>
      ))}
      {rating > 0 && (
        <span className='ml-2 text-sm font-medium text-gray-600'>
          {rating === 5 && '🌟 Perfect!'}
          {rating === 4 && '😊 Great!'}
          {rating === 3 && '👍 Good'}
          {rating === 2 && '😐 Okay'}
          {rating === 1 && '😞 Poor'}
        </span>
      )}
    </div>
  );
};

const ReviewForm = ({
  item,
  onSubmit,
  onCancel,
}: {
  item: ReviewableItem;
  onSubmit: (review: any) => void;
  onCancel: () => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.error('Please add a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      if (
        !item.itemId ||
        typeof item.itemId !== 'string' ||
        !item.canteenId ||
        typeof item.canteenId !== 'string'
      ) {
        throw new Error('Invalid item or canteen ID');
      }

      const reviewData = {
        canteenId: item.canteenId,
        itemId: item.itemId,
        rating,
        comment: comment.trim(),
      };

      const newReview = await createReview(reviewData);
      onSubmit(newReview);
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Item Preview */}
      <div className='bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100'>
        <div className='flex items-center space-x-4'>
          {item.itemImage && (
            <div className='relative'>
              <img
                src={item.itemImage}
                alt={item.itemName}
                className='w-16 h-16 rounded-xl object-cover shadow-lg'
              />
              <div className='absolute -top-1 -right-1 bg-orange-500 rounded-full p-1'>
                <ChefHat className='w-3 h-3 text-white' />
              </div>
            </div>
          )}
          <div>
            <h3 className='font-bold text-lg text-gray-900'>{item.itemName}</h3>
            <p className='text-orange-600 font-medium'>{item.canteenName}</p>
            <p className='text-sm text-gray-500'>
              ₹{item.price} • Qty: {item.quantity}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-3'>
          <label className='block text-sm font-semibold text-gray-900'>
            How was your experience? ✨
          </label>
          <div className='bg-white p-4 rounded-xl border-2 border-gray-100 hover:border-orange-200 transition-colors'>
            <StarRating
              rating={rating}
              onRatingChange={setRating}
              interactive
              size='lg'
            />
          </div>
        </div>

        <div className='space-y-3'>
          <label className='block text-sm font-semibold text-gray-900'>
            Share your thoughts 💭
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder='Tell us what made this meal special... Was it the taste, presentation, or service? Your review helps others discover great food! 🍽️'
            rows={4}
            required
            className='border-2 border-gray-100 focus:border-orange-300 rounded-xl resize-none text-gray-700 placeholder:text-gray-400'
          />
          <div className='text-xs text-gray-500 text-right'>
            {comment.length}/500 characters
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-3 pt-4'>
          <Button
            type='button'
            variant='outline'
            onClick={onCancel}
            className='flex-1 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors'>
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50'>
            {isSubmitting ? (
              <div className='flex items-center space-x-2'>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                <span>Submitting...</span>
              </div>
            ) : (
              <div className='flex items-center space-x-2'>
                <Sparkles className='w-4 h-4' />
                <span>Submit Review</span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

const ItemReviewCard = ({ review }: { review: Review }) => {
  return (
    <Card className='mb-4 border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50'>
      <CardContent className='p-6'>
        <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4'>
          <div className='flex items-start space-x-4'>
            <div className='w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg'>
              {review.student.name.charAt(0).toUpperCase()}
            </div>
            <div className='flex-1'>
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2'>
                <div>
                  <p className='font-semibold text-gray-900'>
                    {review.student.name}
                  </p>
                  <p className='text-sm text-gray-500 flex items-center'>
                    <Clock className='w-3 h-3 mr-1' />
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className='mt-2 sm:mt-0'>
                  <StarRating rating={review.rating} size='sm' />
                </div>
              </div>
              <div className='bg-gray-50 p-4 rounded-xl border-l-4 border-orange-300'>
                <p className='text-gray-700 leading-relaxed'>
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function ReviewPage() {
  const { user, isAuthenticated, token } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewableItems, setReviewableItems] = useState<ReviewableItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ReviewableItem | null>(null);
  const [itemReviews, setItemReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      if (!token) {
        throw new Error('No authentication token');
      }

      const response = await getMyOrders(token);
      const ordersData = response.data;

      const completedOrders = ordersData.filter(
        (order: Order) => order.status === 'completed'
      );
      setOrders(completedOrders);

      const items: ReviewableItem[] = [];
      completedOrders.forEach((order: Order) => {
        order.items.forEach((orderItem: any) => {
          if (
            orderItem.item &&
            orderItem.item._id &&
            typeof orderItem.item._id === 'string'
          ) {
            items.push({
              itemId: orderItem.item._id,
              itemName: orderItem.item.name,
              itemImage: orderItem.item.image,
              canteenId: order.canteen._id,
              canteenName: order.canteen.name,
              orderId: order._id,
              orderDate: order.createdAt,
              quantity: orderItem.quantity,
              price: orderItem.item.price,
            });
          } else {
            console.warn('Invalid item data in order:', orderItem);
          }
        });
      });

      setReviewableItems(items);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (token) {
      fetchOrders();
    }
  }, [isAuthenticated, router, token, fetchOrders]);

  const handleViewReviews = async (item: ReviewableItem) => {
    setSelectedItem(item);
    setReviewsLoading(true);
    try {
      if (!item.itemId || typeof item.itemId !== 'string') {
        throw new Error('Invalid item ID');
      }
      const reviews = await getItemReviews(item.itemId);
      setItemReviews(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleReviewSubmitted = (newReview: Review) => {
    setItemReviews((prev) => [newReview, ...prev]);
    setSelectedItem(null);
    setShowReviewForm(false);

    setTimeout(() => {
      toast.success(
        'Thank you for your review! 😊 Your feedback helps others make great choices!'
      );
    }, 100);
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='text-center'>
            <div className='relative'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto'></div>
              <div className='absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-l-orange-400 animate-ping mx-auto'></div>
            </div>
            <p className='mt-6 text-gray-600 font-medium'>
              Loading your delicious orders...
            </p>
            <div className='flex justify-center mt-4 space-x-1'>
              <div className='w-2 h-2 bg-orange-400 rounded-full animate-bounce'></div>
              <div
                className='w-2 h-2 bg-amber-400 rounded-full animate-bounce'
                style={{ animationDelay: '0.1s' }}></div>
              <div
                className='w-2 h-2 bg-yellow-400 rounded-full animate-bounce'
                style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50'>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <div className='relative inline-block'>
            <h1 className='text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4'>
              Share Your Food Journey ✨
            </h1>
            <div className='absolute -top-2 -right-2 text-2xl animate-bounce'>
              🍽️
            </div>
          </div>
          <p className='text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed'>
            Your reviews help build a community of food lovers and guide others
            to amazing dining experiences
          </p>

          {/* Stats Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto'>
            <div className='bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50'>
              <div className='flex items-center justify-center mb-3'>
                <div className='bg-gradient-to-br from-orange-400 to-amber-400 p-3 rounded-full'>
                  <Award className='w-6 h-6 text-white' />
                </div>
              </div>
              <h3 className='font-bold text-gray-900 text-lg'>
                Quality Reviews
              </h3>
              <p className='text-gray-600 text-sm'>
                Help others discover great food
              </p>
            </div>

            <div className='bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50'>
              <div className='flex items-center justify-center mb-3'>
                <div className='bg-gradient-to-br from-amber-400 to-yellow-400 p-3 rounded-full'>
                  <Users className='w-6 h-6 text-white' />
                </div>
              </div>
              <h3 className='font-bold text-gray-900 text-lg'>
                Community Impact
              </h3>
              <p className='text-gray-600 text-sm'>
                Join thousands of food reviewers
              </p>
            </div>

            <div className='bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50'>
              <div className='flex items-center justify-center mb-3'>
                <div className='bg-gradient-to-br from-yellow-400 to-orange-400 p-3 rounded-full'>
                  <Heart className='w-6 h-6 text-white' />
                </div>
              </div>
              <h3 className='font-bold text-gray-900 text-lg'>Share Love</h3>
              <p className='text-gray-600 text-sm'>
                Express your food experiences
              </p>
            </div>
          </div>
        </div>

        {reviewableItems.length === 0 ? (
          <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-2xl'>
            <CardContent className='py-16 text-center'>
              <div className='relative mb-8'>
                <div className='bg-gradient-to-br from-orange-100 to-amber-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <MessageSquare className='w-12 h-12 text-orange-500' />
                </div>
                <div className='absolute -top-2 -right-8 text-3xl animate-pulse'>
                  🍕
                </div>
                <div
                  className='absolute -bottom-2 -left-8 text-3xl animate-pulse'
                  style={{ animationDelay: '0.5s' }}>
                  🍔
                </div>
              </div>
              <h3 className='text-2xl font-bold text-gray-900 mb-4'>
                Your Food Adventure Awaits! 🚀
              </h3>
              <p className='text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed'>
                Complete some delicious orders to start sharing your amazing
                food experiences with our community
              </p>
              <Button
                onClick={() => router.push('/menu')}
                className='bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
                <div className='flex items-center space-x-2'>
                  <ChefHat className='w-5 h-5' />
                  <span>Explore Canteens</span>
                </div>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-6'>
            <div className='flex items-center justify-between mb-8'>
              <h2 className='text-2xl font-bold text-gray-900'>
                Your Completed Orders
              </h2>
              <div className='bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-orange-200'>
                <span className='text-orange-600 font-semibold'>
                  {reviewableItems.length} items to review
                </span>
              </div>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {reviewableItems.map((item, index) => (
                <Card
                  key={`${item.itemId}-${item.orderId}-${index}`}
                  className='bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden'>
                  <CardContent className='p-0'>
                    <div className='relative'>
                      {item.itemImage && (
                        <div className='relative h-48 overflow-hidden'>
                          <img
                            src={item.itemImage}
                            alt={item.itemName}
                            className='w-full h-full object-cover transition-transform duration-300 hover:scale-110'
                          />
                          <div className='absolute inset-0 bg-gradient-to-t from-black/50 to-transparent'></div>
                          <div className='absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full'>
                            <span className='text-sm font-semibold text-gray-700'>
                              ₹{item.price}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className='p-6'>
                        <div className='mb-4'>
                          <h3 className='font-bold text-xl text-gray-900 mb-2'>
                            {item.itemName}
                          </h3>
                          <div className='flex items-center space-x-2 mb-3'>
                            <div className='bg-gradient-to-r from-orange-500 to-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium'>
                              {item.canteenName}
                            </div>
                          </div>
                          <div className='flex items-center space-x-4 text-sm text-gray-500'>
                            <span className='flex items-center bg-gray-100 px-3 py-1 rounded-full'>
                              <Clock className='w-4 h-4 mr-1' />
                              {new Date(item.orderDate).toLocaleDateString(
                                'en-US',
                                {
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                            <span className='bg-gray-100 px-3 py-1 rounded-full'>
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <div className='flex gap-3'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handleViewReviews(item)}
                            className='flex-1 border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors'>
                            <div className='flex items-center space-x-2'>
                              <MessageSquare className='w-4 h-4' />
                              <span>View Reviews</span>
                            </div>
                          </Button>
                          <Button
                            size='sm'
                            onClick={() => {
                              setSelectedItem(item);
                              setShowReviewForm(true);
                            }}
                            className='flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-200'>
                            <div className='flex items-center space-x-2'>
                              <Star className='w-4 h-4' />
                              <span>Write Review</span>
                            </div>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Review Form Dialog */}
        <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm'>
            <DialogHeader className='text-center pb-4'>
              <DialogTitle className='text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent'>
                Share Your Experience ✨
              </DialogTitle>
              <DialogDescription className='text-gray-600'>
                Your review helps others discover amazing food experiences
              </DialogDescription>
            </DialogHeader>
            {selectedItem && (
              <ReviewForm
                item={selectedItem}
                onSubmit={handleReviewSubmitted}
                onCancel={() => setShowReviewForm(false)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Item Reviews Dialog */}
        <Dialog
          open={!!selectedItem && !showReviewForm}
          onOpenChange={(open) => !open && setSelectedItem(null)}>
          <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm'>
            <DialogHeader className='text-center pb-4'>
              <DialogTitle className='text-2xl font-bold text-gray-900'>
                Reviews for {selectedItem?.itemName} 🌟
              </DialogTitle>
              <DialogDescription className='text-gray-600'>
                {selectedItem?.canteenName} • See what others loved about this
                dish
              </DialogDescription>
            </DialogHeader>

            {reviewsLoading ? (
              <div className='text-center py-12'>
                <div className='relative'>
                  <div className='animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto'></div>
                  <div className='absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-l-orange-400 animate-ping mx-auto'></div>
                </div>
                <p className='mt-4 text-gray-600 font-medium'>
                  Loading delicious reviews...
                </p>
              </div>
            ) : itemReviews.length === 0 ? (
              <div className='text-center py-12'>
                <div className='bg-gradient-to-br from-orange-100 to-amber-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <MessageSquare className='w-10 h-10 text-orange-500' />
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-2'>
                  No reviews yet! 🎉
                </h3>
                <p className='text-gray-600 mb-6 max-w-sm mx-auto'>
                  Be the first to share your experience with this amazing dish
                </p>
                <Button
                  className='bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300'
                  onClick={() => {
                    setShowReviewForm(true);
                  }}>
                  <div className='flex items-center space-x-2'>
                    <Sparkles className='w-4 h-4' />
                    <span>Be the First to Review</span>
                  </div>
                </Button>
              </div>
            ) : (
              <div className='space-y-4'>
                <div className='bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-100 mb-6'>
                  <div className='flex items-center justify-center space-x-4'>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {itemReviews.length}
                      </div>
                      <div className='text-sm text-gray-600'>Reviews</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-2xl font-bold text-gray-900'>
                        {(
                          itemReviews.reduce(
                            (acc, review) => acc + review.rating,
                            0
                          ) / itemReviews.length
                        ).toFixed(1)}
                      </div>
                      <StarRating
                        rating={Math.round(
                          itemReviews.reduce(
                            (acc, review) => acc + review.rating,
                            0
                          ) / itemReviews.length
                        )}
                        size='sm'
                      />
                    </div>
                  </div>
                </div>

                {itemReviews.map((review) => (
                  <ItemReviewCard key={review._id} review={review} />
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
