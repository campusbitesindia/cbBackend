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
  if (error.response?.status === 401) {
    const errorData = error.response.data;
    if (errorData.code === 'TOKEN_EXPIRED') {
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

export interface CanteenOrdersResponse {
  success: boolean;
  count: number;
  data: Order[];
}

export interface CanteenOrderResponse {
  success: boolean;
  data: Order;
}

export interface CanteenStats {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageOrderValue: number;
}

export interface CanteenStatsResponse {
  success: boolean;
  data: CanteenStats;
}

// Get all orders (for canteen view - we'll filter by canteen on frontend)
export const getCanteenOrders = async (
  canteenId: string,
  token: string
): Promise<CanteenOrdersResponse> => {
  try {
    // Since backend doesn't have canteen-specific endpoints, we'll get all orders
    // and filter them on the frontend based on the canteen ID
    const response = await api.get('/api/v1/order/getCanteenAllOrders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Filter orders for this specific canteen
    const allOrders = response.data.data || [];
    const canteenOrders = allOrders.filter(
      (order: Order) => order.canteen._id === canteenId
    );

    return {
      success: true,
      count: canteenOrders.length,
      data: canteenOrders,
    };
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Calculate canteen statistics from orders data
export const getCanteenStats = async (
  canteenId: string,
  token: string
): Promise<CanteenStatsResponse> => {
  try {
    // Get all orders and filter for this canteen
    const response = await api.get('/api/v1/order/getCanteenAllOrders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(response)
    const allOrders = response.data.data || [];
    const canteenOrders = allOrders.filter(
      (order: Order) => order.canteen._id === canteenId
    );

    // Calculate statistics
    const totalOrders = canteenOrders.length;
    const totalRevenue = canteenOrders.reduce(
      (sum: number, order: Order) => sum + order.total,
      0
    );
    const pendingOrders = canteenOrders.filter(
      (order: Order) =>
        order.status === 'placed' || order.status === 'preparing'
    ).length;
    const completedOrders = canteenOrders.filter(
      (order: Order) => order.status === 'completed'
    ).length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const stats = {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };

    return { success: true, data: stats };
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Update order status (using existing endpoint)
export const updateCanteenOrderStatus = async (
  orderId: string,
  status: Order['status'],
  token: string
): Promise<CanteenOrderResponse> => {
  try {
    const response = await api.post(
      `/api/v1/order/ChangeStatus/${orderId}`,
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

// Get order details for canteen
export const getCanteenOrderById = async (
  orderId: string,
  token: string
): Promise<CanteenOrderResponse> => {
  try {
    const response = await api.get(`/api/v1/order/getOrderDetails/${orderId}`, {
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

// Get orders by status for canteen (filtered on frontend)
export const getCanteenOrdersByStatus = async (
  canteenId: string,
  status: Order['status'] | 'all',
  token: string
): Promise<CanteenOrdersResponse> => {
  try {
    // Note: A dedicated backend endpoint for filtering by status would be more efficient
    // for larger datasets. For now, we fetch all orders and filter on the frontend.
    const response = await api.get('/api/v1/order/getCanteenAllOrders', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const allOrders = response.data.data || [];
    let canteenOrders = allOrders.filter(
      (order: Order) => order.canteen._id === canteenId
    );

    // Filter by status if not 'all'
    if (status !== 'all') {
      canteenOrders = canteenOrders.filter(
        (order: Order) => order.status === status
      );
    }

    return {
      success: true,
      count: canteenOrders.length,
      data: canteenOrders,
    };
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

export const getCanteenByOwner = async (ownerId: string) => {
  const res = await api.get(`/api/v1/canteens?owner=${ownerId}`);
  return res.data.canteens?.[0] || null;
};
