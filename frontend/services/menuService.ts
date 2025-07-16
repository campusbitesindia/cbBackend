import axios from '@/lib/axios';

export interface MenuItem {
  _id: string;
  name: string;
  price: number;
  description?: string;
  category: string;
  canteen: string;
  isVeg: boolean;
  image?: string;
  available?: boolean;
}

export interface CreateMenuItemRequest {
  name: string;
  price: number;
  description?: string;
  category: string;
  canteen: string;
  isVeg?: boolean;
}

export interface UpdateMenuItemRequest {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  isVeg?: boolean;
  available?: boolean;
}

export async function getMenuByCanteenId(
  canteenId: string
): Promise<MenuItem[]> {
  const res = await axios.get(`/api/v1/menu/${canteenId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
  return res.data.data;
}

export async function createMenuItem(
  data: CreateMenuItemRequest
): Promise<MenuItem> {
  const res = await axios.post(
    '/api/v1/menu',
    {
      name: data.name,
      price: data.price,
      description: data.description || '',
      category: data.category,
      canteen: data.canteen,
      isVeg: data.isVeg || false,
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data.data;
}

export async function updateMenuItem(
  id: string,
  data: UpdateMenuItemRequest
): Promise<MenuItem> {
  const payload: any = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.price !== undefined) payload.price = data.price;
  if (data.description !== undefined) payload.description = data.description;
  if (data.category !== undefined) payload.category = data.category;
  if (data.isVeg !== undefined) payload.isVeg = data.isVeg;
  if (data.available !== undefined) payload.available = data.available;

  const res = await axios.put(`/api/v1/menu/${id}`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await axios.delete(`/api/v1/menu/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });
}
