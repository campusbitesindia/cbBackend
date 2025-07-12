// Image service for handling image uploads
// This can be replaced with Firebase Storage or other cloud storage later

export interface ImageUploadResult {
  url: string;
  filename: string;
}

export const uploadImage = async (file: File): Promise<ImageUploadResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      const filename = `image_${Date.now()}_${file.name}`;
      
      // For now, we'll use base64 as the URL
      // In production, this should be uploaded to Firebase Storage or similar
      resolve({
        url: base64String,
        filename: filename
      });
    };
    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };
    reader.readAsDataURL(file);
  });
};

export const validateImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid image format. Please use JPEG, PNG, or WebP.');
  }
  
  if (file.size > maxSize) {
    throw new Error('Image size too large. Please use an image smaller than 5MB.');
  }
  
  return true;
}; 