import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // çünkü proxy var!
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;