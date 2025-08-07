import api from '@/lib/axios';
import {
  Review,
  CreateReviewPayload,
  ReviewsResponse,
  AverageRatingResponse,
} from '@/types';

// Custom error class for authentication issues
export class AuthError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// Helper function to handle auth errors
const handleAuthError = (error: any) => {
  if (error.response?.status === 401 || error.response?.status === 403) {
    const errorData = error.response.data;
    if (errorData?.message === 'You are banned by admin.') {
      throw new Error(errorData.message);
    }
    if (errorData?.code === 'TOKEN_EXPIRED') {
      localStorage.removeItem('token');
      window.location.href =
        '/login?message=Session expired, please login again';
      throw new AuthError(
        'Your session has expired. Please login again.',
        'TOKEN_EXPIRED'
      );
    }
    throw new AuthError(
      'Authentication failed. Please login again.',
      'AUTH_FAILED'
    );
  }
  throw error;
};

// Get reviews for a canteen
export const getCanteenReviews = async (
  canteenId: string
): Promise<Review[]> => {
  try {
    const response = await api.get(`/api/v1/reviews/${canteenId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch reviews');
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch canteen reviews'
    );
  }
};

// Get all reviews for an item
export const getItemReviews = async (itemId: string): Promise<Review[]> => {
  try {
    const response = await api.get(`/api/v1/reviews/item-reviews/${itemId}`);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch item reviews');
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch item reviews'
    );
  }
};

// Get average rating for an item
export const getItemAverageRating = async (itemId: string): Promise<number> => {
  try {
    const response = await api.get(
      `/api/v1/reviews/item-average-rating/${itemId}`
    );
    if (response.data.success) {
      return response.data.data.AverageRating;
    }
    throw new Error(response.data.message || 'Failed to fetch average rating');
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch item average rating'
    );
  }
};

// Get average rating for a canteen
export const getCanteenAverageRating = async (
  canteenId: string
): Promise<number> => {
  try {
    const response = await api.get(
      `/api/v1/reviews/canteen-average-rating/${canteenId}`
    );
    if (response.data.success) {
      return response.data.data.AverageRating;
    }
    throw new Error(response.data.message || 'Failed to fetch average rating');
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(
      error.response?.data?.message || 'Failed to fetch canteen average rating'
    );
  }
};

// Create a new review
export const createReview = async (
  reviewData: CreateReviewPayload
): Promise<Review> => {
  try {
    const response = await api.post('/api/v1/reviews/create', reviewData);
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create review');
  } catch (error: any) {
    handleAuthError(error);
    throw new Error(error.response?.data?.message || 'Failed to create review');
  }
};
