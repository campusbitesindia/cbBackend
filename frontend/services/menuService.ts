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
  image?: string;
}

export interface UpdateMenuItemRequest {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  isVeg?: boolean;
  image?: string;
  available?: boolean;
}

export async function getMenuByCanteenId(canteenId: string): Promise<MenuItem[]> {
  const res = await axios.get(`/api/menu/${canteenId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data.data;
}

export async function createMenuItem(data: CreateMenuItemRequest): Promise<MenuItem> {
  const res = await axios.post('/api/menu', data, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data.data;
}

export async function updateMenuItem(id: string, data: UpdateMenuItemRequest): Promise<MenuItem> {
  const res = await axios.put(`/api/menu/${id}`, data, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return res.data.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await axios.delete(`/api/menu/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
} 