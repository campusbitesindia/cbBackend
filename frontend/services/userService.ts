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

// User registration interface
export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'canteen' | 'admin';
  campus: string; // Can be campus ID or campus name
  phone: string;
}

// User login interface
export interface LoginUserPayload {
  email: string;
  password: string;
}

// Email verification interface
export interface VerifyEmailPayload {
  email: string;
  otp: string;
}

// Password reset interface
export interface ResetPasswordPayload {
  password: string;
  confirmPass: string;
}

// Forgot password interface
export interface ForgotPasswordPayload {
  email: string;
}

// Profile update interface
export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
}

// User response interface
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  campus: {
    _id: string;
    name: string;
    code: string;
    city: string;
  };
  canteenId?: {
    _id: string;
    name: string;
  };
  phone: string;
  bio?: string;
  address?: string;
  dateOfBirth?: string;
  profileImage?: string;
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Registration response interface
export interface RegisterResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    _id: string;
    name: string;
    email: string;
    role: string;
    campus: {
      id: string;
      name: string;
      code: string;
    };
    canteenId: string | null;
    isVerified: boolean;
    approvalStatus: string;
  };
  token: string;
  nextSteps: string[];
}

// Login response interface
export interface LoginResponse {
  success: boolean;
  user1: {
    _id: string;
    name: string;
    email: string;
    role: string;
    campus: any;
    profileImage?: string;
  };
  token: string;
  security: {
    score: number;
    deviceRegistered: boolean;
    isNewDevice: boolean;
    requiresVerification: boolean;
    prompt?: any;
  };
}

// Profile image upload result
export interface ProfileImageUploadResult {
  success: boolean;
  message: string;
  user: User;
  imageUrl: string;
}

// Register new user
export const registerUser = async (
  userData: RegisterUserPayload
): Promise<RegisterResponse> => {
  try {
    const response = await api.post('/api/v1/users/register', userData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 409) {
      // Handle existing user case
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Login user
export const loginUser = async (
  loginData: LoginUserPayload
): Promise<LoginResponse> => {
  try {
    const response = await api.post('/api/v1/users/login', loginData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 403) {
      throw new Error('Please verify your email address before logging in.');
    }
    if (error.response?.status === 400) {
      throw new Error('Invalid email or password');
    }
    throw error;
  }
};

// Logout user
export const logoutUser = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.post('/api/v1/users/logout');
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Verify email with OTP
export const verifyEmail = async (
  verificationData: VerifyEmailPayload
): Promise<{ success: boolean; message: string; user1: any }> => {
  try {
    const response = await api.post(
      '/api/v1/users/verify-email',
      verificationData
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Forgot password
export const forgotPassword = async (
  emailData: ForgotPasswordPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post('/api/v1/users/forgotPass', emailData);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      throw new Error('User not found');
    }
    throw error;
  }
};

// Reset password with token
export const resetPassword = async (
  token: string,
  passwordData: ResetPasswordPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await api.post(
      `/api/v1/users/resetPassword/${token}`,
      passwordData
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

// Get current user profile
export const getProfile = async (
  token: string
): Promise<{ success: boolean; user: User }> => {
  try {
    const response = await api.get('/api/v1/users/profile', {
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

// Get current user (load user)
export const loadUser = async (
  token: string
): Promise<{ success: boolean; user1: any }> => {
  try {
    const response = await api.get('/api/v1/users/me', {
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

// Update user profile
export const updateProfile = async (
  profileData: UpdateProfilePayload,
  token: string
): Promise<{ success: boolean; message: string; user: User }> => {
  try {
    const response = await api.put('/api/v1/users/profile', profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    handleAuthError(error);
    return Promise.reject(error);
  }
};

// Upload profile image
export const uploadProfileImage = async (
  file: File,
  token: string
): Promise<ProfileImageUploadResult> => {
  try {
    // Validate the image
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid image format. Please use JPEG, PNG, or WebP.');
    }

    if (file.size > maxSize) {
      throw new Error(
        'Image size too large. Please use an image smaller than 5MB.'
      );
    }

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('profileImage', file);

    const response = await api.post('/api/v1/users/profile/image', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // 30 second timeout
    });

    return response.data;
  } catch (error: any) {
    handleAuthError(error);

    if (error instanceof Error) {
      throw error; // Re-throw validation errors as-is
    }

    // Handle axios errors
    if (error.response?.status === 413) {
      throw new Error(
        'Image file is too large. Please choose a smaller image.'
      );
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout. Please try again with a smaller image.');
    } else if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else {
      throw new Error('Failed to upload profile image. Please try again.');
    }
  }
};
