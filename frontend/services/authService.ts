// services/authService.ts
import api from '@/lib/axios';

type LoginPayload = {
  email: string;
  password: string;
  role: 'student' | 'admin' | 'campus'; // ✅ match with login page
};

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'canteen' | 'admin';
  campus: string; // campus ID
};

export const login = async (payload: LoginPayload) => {
  const response = await api.post('/api/users/login', payload);
  return response.data;
};

export const register = async (payload: RegisterPayload) => {
  const response = await api.post('/api/users/register', payload);
  return response.data;
};
