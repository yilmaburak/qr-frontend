import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // çünkü proxy var!
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
     console.log('Token eklendi:', config.headers.Authorization);
  }
  return config;
});

export default api;