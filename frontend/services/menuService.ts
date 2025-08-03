import axios from '@/lib/axios';

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  canteen: string | { _id: string; name: string; [key: string]: any };
  available?: boolean;
  image?: string;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
  category?: string;
  isVeg?: boolean;
  portion?: string;
  quantity?: string;
  isReady?: boolean;
}

export interface CreateMenuItemRequest {
  name: string;
  price: number;
  canteen: string;
  canteenId: string;
  image?: File | string;
  description?: string;
  category?: string;
  isVeg?: boolean;
  available?: boolean;
  portion?: string;
  quantity?: string;
}

export interface UpdateMenuItemRequest {
  name?: string;
  price?: number;
  available?: boolean;
  image?: File | string;
  description?: string;
  category?: string;
  isVeg?: boolean;
  portion?: string;
  quantity?: string;
}

export async function getMenuByCanteenId(
  canteenId: string
): Promise<MenuItem[]> {
  const res = await axios.get(`/api/v1/items/getItems/${canteenId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  console.log(res);
  return res.data.data;
}

export async function createMenuItem(
  data: CreateMenuItemRequest
): Promise<MenuItem> {
  // Always use FormData to match backend expectations
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('price', data.price.toString());
  if (data.description) formData.append('description', data.description);
  if (data.canteenId) formData.append('canteenId', data.canteenId);
  if (data.category) formData.append('category', data.category);
  if (data.isVeg !== undefined) formData.append('isVeg', data.isVeg.toString());
  if (data.available !== undefined)
    formData.append('available', data.available.toString());
  if (data.portion) formData.append('portion', data.portion);
  if (data.quantity) formData.append('quantity', data.quantity);

  if (data.image) {
    // If image is a base64 data URL, convert it to a File object
    if (typeof data.image === 'string' && data.image.startsWith('data:')) {
      const response = await fetch(data.image);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      formData.append('ItemThumbnail', file);
    } else if (data.image instanceof File) {
      // If image is already a File object, append it directly
      formData.append('ItemThumbnail', data.image);
    } else if (
      typeof data.image === 'string' &&
      data.image.startsWith('blob:')
    ) {
      // If image is a blob URL, convert it to a File object
      const response = await fetch(data.image);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      formData.append('ItemThumbnail', file);
    }
  }

  const res = await axios.post('/api/v1/items/CreateItem', formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
}

export async function updateMenuItem(
  id: string,
  data: UpdateMenuItemRequest
): Promise<MenuItem> {
  // Always use FormData to match backend expectations
  const formData = new FormData();
  if (data.name !== undefined) formData.append('name', data.name);
  if (data.price !== undefined) formData.append('price', data.price.toString());
  if (data.available !== undefined)
    formData.append('available', data.available.toString());
  if (data.description !== undefined)
    formData.append('description', data.description);
  if (data.category !== undefined) formData.append('category', data.category);
  if (data.isVeg !== undefined) formData.append('isVeg', data.isVeg.toString());
  if (data.portion !== undefined) formData.append('portion', data.portion);
  if (data.quantity !== undefined) formData.append('quantity', data.quantity);

  if (data.image) {
    // If image is a base64 data URL, convert it to a File object
    if (typeof data.image === 'string' && data.image.startsWith('data:')) {
      const response = await fetch(data.image);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      formData.append('ItemThumbnail', file);
    } else if (data.image instanceof File) {
      // If image is already a File object, append it directly
      formData.append('ItemThumbnail', data.image);
    } else if (
      typeof data.image === 'string' &&
      data.image.startsWith('blob:')
    ) {
      // If image is a blob URL, convert it to a File object
      const response = await fetch(data.image);
      const blob = await response.blob();
      const file = new File([blob], 'image.jpg', { type: blob.type });
      formData.append('ItemThumbnail', file);
    }
  }

  const res = await axios.put(`/api/v1/items/updateItem/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await axios.delete(`/api/v1/items/deleteItem/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
}

export async function toggleMenuItemReadyStatus(id: string): Promise<MenuItem> {
  const res = await axios.put(
    `/api/v1/items/toggle-ready/${id}`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data.data;
}

export async function getItemsUnder99(canteenId: string): Promise<MenuItem[]> {
  const res = await axios.get(`/api/v1/items/under99/${canteenId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.data;
}

export async function getItemsByPriceRange(
  canteenId: string,
  minPrice: number,
  maxPrice: number
): Promise<MenuItem[]> {
  const res = await axios.post(
    `/api/v1/items/range/${canteenId}`,
    { minPrice, maxPrice },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }
  );
  return res.data.data;
}

export async function getReadyItems(canteenId: string): Promise<MenuItem[]> {
  const res = await axios.get(`/api/v1/items/ready/${canteenId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.data;
}

export async function getReadyItemsOfAllCanteens(
  campus: string
): Promise<MenuItem[]> {
  const res = await axios.get(`/api/v1/items/allReadyItems?campus=${campus}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.data;
}
