// Image service for handling image uploads
import axios from 'axios';

export interface ImageUploadResult {
  url: string;
  filename: string;
}

export const uploadImage = async (file: File): Promise<ImageUploadResult> => {
  try {
    // Validate the image first
    validateImage(file);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append('ItemThumbnail', file); // Changed from 'image' to 'ItemThumbnail' to match backend

    // Get token for authentication
    const token = localStorage.getItem('token') || '';

    // Upload to the existing items endpoint
    const response = await axios.post(
      'http://localhost:8080/api/v1/items/upload-image', // Using a more specific endpoint
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000, // 30 second timeout
      }
    );

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
    console.error('Image upload error:', error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      } else if (error.response?.status === 404) {
        throw new Error(
          'Upload endpoint not found. Please contact support to enable image uploads.'
        );
      } else if (error.response?.status === 413) {
        throw new Error(
          'Image file is too large. Please choose a smaller image.'
        );
      } else if (error.code === 'ECONNABORTED') {
        throw new Error(
          'Upload timeout. Please try again with a smaller image.'
        );
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(`Upload failed: ${error.message}`);
      }
    } else {
      throw new Error('Failed to upload image. Please try again.');
    }
  }
};

// Alternative method using profile image upload endpoint
export const uploadImageViaProfile = async (
  file: File
): Promise<ImageUploadResult> => {
  try {
    validateImage(file);

    const formData = new FormData();
    formData.append('profileImage', file);

    const token = localStorage.getItem('token') || '';

    const response = await axios.post(
      'http://localhost:8080/api/v1/users/profile/image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      }
    );

    if (response.data && response.data.imageUrl) {
      return {
        url: response.data.imageUrl,
        filename: file.name,
      };
    } else {
      throw new Error('Invalid response from profile upload API');
    }
  } catch (error: any) {
    console.error('Profile image upload error:', error);
    throw error;
  }
};

export const validateImage = (file: File): boolean => {
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

  return true;
};

// Fallback function to create a data URL for preview when upload fails
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};
