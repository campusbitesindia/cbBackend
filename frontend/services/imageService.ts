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
    formData.append('image', file);

    // Get token for authentication
    const token = localStorage.getItem('token') || '';

    // Upload to the API endpoint
    const response = await axios.post(
      'http://localhost:8080/api/v1/upload',
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
  } catch (error) {
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
