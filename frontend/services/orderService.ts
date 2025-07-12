import api from '@/lib/axios';
import { Order } from '@/types';

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
  canteen: string;
  items: Array<{
    item: string;
    quantity: number;
  }>;
  total: number;
  payment: {
    method: 'cod' | 'upi' | 'card';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    upiDetails?: {
      upiId: string;
      paymentApp: string;
    };
    cardDetails?: {
      lastFourDigits: string;
      cardType: string;
      holderName: string;
    };
    paidAt?: string;
  };
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

// Get user's orders
export const getMyOrders = async (token: string): Promise<OrdersResponse> => {
  try {
    const response = await api.get('/api/orders', {
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

// Create a new order
export const createOrder = async (
  orderData: CreateOrderPayload,
  token: string
): Promise<CreateOrderResponse> => {
  try {
    const response = await api.post('/api/orders', orderData, {
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

// Get order by ID
export const getOrderById = async (
  orderId: string,
  token: string
): Promise<{ success: boolean; data: Order }> => {
  try {
    const response = await api.get(`/api/orders/${orderId}`, {
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

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  token: string
): Promise<{ success: boolean; data: Order }> => {
  try {
    const response = await api.patch(
      `/api/orders/${orderId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};
