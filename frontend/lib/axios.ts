import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/', // adjust as needed
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // optional: use if you handle cookies/sessions
});

export default api;
