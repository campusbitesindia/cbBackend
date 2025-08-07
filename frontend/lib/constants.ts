export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://campusbites-mxpe.onrender.com';

export const API_ENDPOINTS = {
  CANTEENS: `${API_BASE_URL}/api/v1/canteens`,
  MENU: `${API_BASE_URL}/api/v1/items/getItems`,
  ORDERS: `${API_BASE_URL}/api/v1/order`,
  USERS: `${API_BASE_URL}/api/v1/users`,
  USER_PROFILE: `${API_BASE_URL}/api/v1/users/profile`,
  USER_PROFILE_IMAGE: `${API_BASE_URL}/api/v1/users/profile/image`,
  LOGIN: `${API_BASE_URL}/api/v1/users/login`,
  REGISTER: `${API_BASE_URL}/api/v1/users/register`,
  LOGOUT: `${API_BASE_URL}/api/v1/users/logout`,
};
