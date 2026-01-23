import axios from 'axios';
import { toast } from 'react-toastify';
import { SITE_CONFIG } from '../config';

const api = axios.create({
  baseURL: SITE_CONFIG.API_URL || '/api',
});

api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    // 1. Unauthorized (401)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 2. Forbidden (403)
    if (error.response && error.response.status === 403) {
      toast.error('Access Denied: You do not have permission to perform this action.');
    }

    // 3. Not Found (404)
    if (error.response && error.response.status === 404) {
      // Don't show toast for 404 if it's just checking existence (optional, but safer to show for now)
      toast.error(error.response.data?.message || 'Requested resource not found.');
    }

    // 4. Bad Request (400) - Business Logic Errors
    if (error.response && error.response.status === 400) {
      const msg = error.response.data?.message || 'Invalid Request';
      // If validation errors exist, show them?
      // For now, simple toast
      toast.error(msg);
    }

    // 5. Server Error (500)
    if (error.response && error.response.status === 500) {
      toast.error('Server Error: Something went wrong. Please try again later.');
    }

    // 6. Network Error
    if (error.message === 'Network Error') {
      toast.error('Network Error: Unable to connect to backend.');
    }

    return Promise.reject(error);
  }
);

export default api;