import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://campusbites-mxpe.onrender.com/', // adjust as needed
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true, // optional: use if you handle cookies/sessions
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
