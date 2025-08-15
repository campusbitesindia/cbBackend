import api from '@/lib/axios';
import { Order } from '@/types';

// Simple in-memory cache for requests
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache TTL in milliseconds (5 minutes for orders, 1 minute for order details)
const CACHE_TTL = {
  orders: 5 * 60 * 1000,
  orderDetails: 1 * 60 * 1000,
  default: 2 * 60 * 1000,
};

// Cache utility functions
const getCacheKey = (url: string, params?: any): string => {
  return `${url}${params ? JSON.stringify(params) : ''}`;
};

const getFromCache = (key: string): any | null => {
  const cached = cache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > cached.ttl) {
    cache.delete(key);
    return null;
  }

  return cached.data;
};

const setCache = (
  key: string,
  data: any,
  ttl: number = CACHE_TTL.default
): void => {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
};

// Clear cache for specific patterns
const clearCachePattern = (pattern: string): void => {
  for (const key of cache.keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
};

// Export cache management utilities
export const cacheUtils = {
  clear: () => cache.clear(),
  clearPattern: clearCachePattern,
  size: () => cache.size,
};

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
      // Clear expired token
      localStorage.removeItem('token');
      // Trigger a page reload to reset auth state
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

export interface CreateOrderPayload {
  items: string; // Stringified JSON array as expected by backend
  pickUpTime: string; // Required by backend
}

export interface OrdersResponse {
  success: boolean;
  count: number;
  data: Order[];
}

export interface CreateOrderResponse {
  success: boolean;
  data: Order;
}

// Get user's orders with caching
export const getMyOrders = async (
  token: string,
  useCache: boolean = true
): Promise<OrdersResponse> => {
  const cacheKey = getCacheKey('/api/v1/order/getStudentAllOrders', {
    token: token.slice(-10),
  }); // Use last 10 chars for cache key

  // Try cache first if enabled
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await api.get<OrdersResponse>(
      '/api/v1/order/getStudentAllOrders',
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Cache the response
    if (useCache) {
      setCache(cacheKey, response.data, CACHE_TTL.orders);
    }

    return response.data;
  } catch (error) {
    console.log(error);
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Create a new order
export const createOrder = async (
  orderData: CreateOrderPayload,
  token: string
): Promise<CreateOrderResponse> => {
  try {
    const response = await api.post<CreateOrderResponse>(
      '/api/v1/order/CreateOrder',
      orderData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Clear orders cache after creating new order
    clearCachePattern('/api/v1/order/getStudentAllOrders');

    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Get order by ID with caching
export const getOrderById = async (
  orderId: string,
  token: string,
  useCache: boolean = true
): Promise<{ success: boolean; data: Order }> => {
  const cacheKey = getCacheKey(`/api/v1/order/getOrderDetails/${orderId}`, {
    token: token.slice(-10),
  });

  // Try cache first if enabled
  if (useCache) {
    const cached = getFromCache(cacheKey);
    if (cached) {
      return cached;
    }
  }

  try {
    const response = await api.get<{ success: boolean; data: Order }>(
      `/api/v1/order/getOrderDetails/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Cache the response
    if (useCache) {
      setCache(cacheKey, response.data, CACHE_TTL.orderDetails);
    }

    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  token: string
): Promise<{ success: boolean; data: Order }> => {
  try {
    const response = await api.post<{ success: boolean; data: Order }>(
      `/api/v1/order/ChangeStatus/${orderId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Clear relevant caches after status update
    clearCachePattern('/api/v1/order/getStudentAllOrders');
    clearCachePattern(`/api/v1/order/getOrderDetails/${orderId}`);

    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Delete an order
export const deleteOrder = async (
  orderId: string,
  token: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.delete(`/api/v1/order/deleteOrder/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Get all deleted orders
export const getDeletedOrders = async (
  token: string
): Promise<OrdersResponse> => {
  try {
    const response = await api.get('/api/v1/order/getDeletedOrders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Get all orders for a canteen
export const getAllOrdersByCanteen = async (
  token: string
): Promise<OrdersResponse> => {
  try {
    const response = await api.get('/api/v1/order/getCanteenAllOrders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};
