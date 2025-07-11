// services/storeService.ts
import api from '@/lib/axios';

export interface FoodVendor {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  location: string;
  operatingHours: string;
  rating: number;
  image: string;
  phone: string;
  email: string;
  isOpen: boolean;
  specialties: string[];
  priceRange: 'Budget' | 'Moderate' | 'Premium';
}

export interface StoreItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  vendorId?: number;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  isAvailable: boolean;
  vendorId: number;
}

export interface VendorDetails {
  id: number;
  name: string;
  description: string;
  location: string;
  operatingHours: string;
  cuisine: string;
  rating: number;
  phone: string;
  email: string;
  isOpen: boolean;
  specialties: string[];
  priceRange: string;
}

// Get all food vendors (canteens)
export const getFoodVendors = async (): Promise<FoodVendor[]> => {
  const response = await api.get('/canteens');
  return response.data;
};

// Get vendor by ID (canteen by ID)
export const getVendorById = async (id: number): Promise<FoodVendor> => {
  const response = await api.get(`/canteens/${id}`);
  return response.data;
};

// Get vendors by cuisine
export const getVendorsByCuisine = async (
  cuisine: string
): Promise<FoodVendor[]> => {
  const response = await api.get(`/canteens?cuisine=${cuisine}`);
  return response.data;
};

// Search vendors
export const searchVendors = async (query: string): Promise<FoodVendor[]> => {
  const response = await api.get(`/canteens/search?q=${query}`);
  return response.data;
};

// Filter vendors by price range
export const getVendorsByPriceRange = async (
  priceRange: string
): Promise<FoodVendor[]> => {
  const response = await api.get(`/canteens?priceRange=${priceRange}`);
  return response.data;
};

// Update vendor details
export const updateVendor = async (
  id: number,
  vendorData: Partial<FoodVendor>
): Promise<FoodVendor> => {
  const response = await api.put(`/canteens/${id}`, vendorData);
  return response.data;
};

// Add new vendor (admin only)
export const addVendor = async (
  vendorData: Omit<FoodVendor, 'id' | 'rating'>
): Promise<FoodVendor> => {
  const response = await api.post('/canteens/create', vendorData);
  return response.data;
};

// Update vendor (admin only)
export const updateVendorAdmin = async (
  id: number,
  vendorData: Partial<FoodVendor>
): Promise<FoodVendor> => {
  const response = await api.put(`/canteens/${id}`, vendorData);
  return response.data;
};

// Delete vendor (admin only)
export const deleteVendor = async (id: number): Promise<void> => {
  await api.delete(`/canteens/${id}`);
};

// Toggle vendor open/closed status
export const toggleVendorStatus = async (
  id: number,
  isOpen: boolean
): Promise<FoodVendor> => {
  const response = await api.patch(`/canteens/${id}/status`, { isOpen });
  return response.data;
};

// Get vendor menu items (for when user clicks on a vendor)
export const getVendorMenu = async (vendorId: number): Promise<MenuItem[]> => {
  const response = await api.get(`/menu/${vendorId}`);
  return response.data;
};

// Add menu item to vendor (admin only)
export const addMenuItem = async (
  vendorId: number,
  menuItem: Omit<MenuItem, 'id' | 'vendorId'>
): Promise<MenuItem> => {
  const response = await api.post(`/menu`, { ...menuItem, canteenId: vendorId });
  return response.data;
};

// Update menu item (admin only)
export const updateMenuItem = async (
  vendorId: number,
  itemId: number,
  menuItem: Partial<MenuItem>
): Promise<MenuItem> => {
  const response = await api.put(`/menu/${itemId}`, menuItem);
  return response.data;
};

// Delete menu item (admin only)
export const deleteMenuItem = async (
  vendorId: number,
  itemId: number
): Promise<void> => {
  await api.delete(`/menu/${itemId}`);
};

// Get all menu items (for store page) - using items endpoint
export const getAllMenuItems = async (): Promise<StoreItem[]> => {
  const response = await api.get('/items');
  return response.data;
};

// Search menu items
export const searchMenuItems = async (query: string): Promise<StoreItem[]> => {
  const response = await api.get(`/items/search?q=${query}`);
  return response.data;
};

// Filter menu items by category
export const getMenuItemsByCategory = async (
  category: string
): Promise<StoreItem[]> => {
  const response = await api.get(`/items?category=${category}`);
  return response.data;
};
