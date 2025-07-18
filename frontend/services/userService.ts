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

export interface PersonalDetailsPayload {
  vendorName: string;
  contactPerson: string;
  mobileNumber: string;
  email: string;
  address: string;
}

// Removed BankDetailsPayload interface since endpoint doesn't exist

export interface ProfileImageUploadResult {
  url: string;
  filename: string;
}

// Update personal profile details
export const updateProfile = async (
  profileData: PersonalDetailsPayload,
  token: string
): Promise<{ success: boolean; data: any }> => {
  try {
    const response = await api.patch('/api/v1/users/profile', profileData, {
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

// Removed updateBankDetails function since endpoint doesn't exist in backend

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

    // Handle the response based on the API structure
    if (response.data && response.data.url) {
      return {
        url: response.data.url,
        filename: response.data.filename || file.name,
      };
    } else if (response.data && response.data.data && response.data.data.url) {
      return {
        url: response.data.data.url,
        filename: response.data.data.filename || file.name,
      };
    } else {
      throw new Error('Invalid response from upload API');
    }
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
