import api from '@/lib/axios';

export interface PayoutBalance {
  canteen: {
    id: string;
    name: string;
  };
  balance: {
    totalEarnings: number;
    totalPayouts: number;
    platformFee: number;
    availableBalance: number;
    pendingPayouts: number;
  };
  statistics: {
    totalOrders: number;
    completedPayouts: number;
    pendingPayoutRequests: number;
  };
  pendingRequests: Array<{
    id: string;
    amount: number;
    status: string;
    requestedAt: string;
  }>;
}

export interface PayoutRequest {
  _id: string;
  canteen: string;
  vendor: string;
  requestedAmount: number;
  availableBalance: number;
  requestNotes?: string;
  bankDetails: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
    branchName?: string;
    upiId?: string;
  };
  status:
    | 'pending'
    | 'approved'
    | 'rejected'
    | 'processing'
    | 'completed'
    | 'failed';
  reviewedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  reviewedAt?: string;
  adminNotes?: string;
  rejectionReason?: string;
  processedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  processedAt?: string;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayoutHistoryResponse {
  success: boolean;
  message: string;
  data: PayoutRequest[];
  summary: {
    total: number;
    completed: number;
    pending: number;
    rejected: number;
    totalAmount: number;
    completedAmount: number;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface PayoutRequestResponse {
  success: boolean;
  message: string;
  data: {
    requestId: string;
    requestedAmount: number;
    status: string;
    requestedAt: string;
    estimatedProcessingTime: string;
  };
}

class PayoutService {
  // Get vendor's current balance and earnings
  async getBalance(): Promise<{
    success: boolean;
    message: string;
    data: PayoutBalance;
  }> {
    try {
      const response = await api.get('/api/v1/payouts/balance');
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch balance'
      );
    }
  }

  // Request a new payout
  async requestPayout(
    requestedAmount: number,
    notes?: string
  ): Promise<PayoutRequestResponse> {
    try {
      const response = await api.post('/api/v1/payouts/request', {
        requestedAmount,
        notes,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to request payout'
      );
    }
  }

  // Get payout history
  async getPayoutHistory(
    page = 1,
    limit = 20,
    status?: string
  ): Promise<PayoutHistoryResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) {
        params.append('status', status);
      }

      const response = await api.get(
        `/api/v1/payouts/history?${params.toString()}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch payout history'
      );
    }
  }

  // Get specific payout request status
  async getPayoutStatus(
    requestId: string
  ): Promise<{ success: boolean; message: string; data: PayoutRequest }> {
    try {
      const response = await api.get(`/api/v1/payouts/status/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch payout status'
      );
    }
  }
}

export const payoutService = new PayoutService();
