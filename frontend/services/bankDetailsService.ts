import api from '@/lib/axios';

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

export interface BankDetailsPayload {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
}

export interface BankDetailsResponse {
  _id: string;
  accountHolderName: string;
  accountNumber: string; // Masked in response
  ifscCode: string;
  bankName: string;
  branchName: string;
  upiId?: string;
  isVerified: boolean;
  verifiedAt?: string;
  verifiedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  verificationNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Get bank details for the current vendor
export const getBankDetails = async (): Promise<{
  success: boolean;
  data: BankDetailsResponse;
  canteen: { id: string; name: string };
}> => {
  try {
    const response = await api.get('/api/v1/bank-details');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Update bank details (create or update)
export const updateBankDetails = async (
  bankData: BankDetailsPayload
): Promise<{
  success: boolean;
  data: BankDetailsResponse;
  note?: string;
}> => {
  try {
    const response = await api.post('/api/v1/bank-details', bankData);
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Delete bank details
export const deleteBankDetails = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.delete('/api/v1/bank-details');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};
