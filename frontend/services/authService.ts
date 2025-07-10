// services/authService.ts
import api from '@/lib/axios';

type LoginPayload = {
  email: string;
  password: string;
  role: 'student' | 'admin' | 'campus'; // ✅ match with login page
};

export const login = async (payload: LoginPayload) => {
  const response = await api.post('/api/v1/users/login', payload);
  return response.data;
};
