import api from './api';

const menuService = {
  getCategories: async (userId) => {
    const response = await api.get(`/menu/categories?userId=${userId}`);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post('/menu/categories', categoryData);
    return response.data;
  },

  deleteCategory: async (categoryId) => {
    await api.delete(`/menu/categories/${categoryId}`);
  },

  getMenuItems: async (categoryId) => {
    const response = await api.get(`/menu/items?categoryId=${categoryId}`);
    return response.data;
  },

  getMenuItem: async (id) => {
    const response = await api.get(`/menu/items/${id}`);
    return response.data;
  },

  createMenuItem: async (itemData) => {
    const response = await api.post('/menu/items', itemData);
    return response.data;
  },

  deleteMenuItem: async (itemId) => {
    await api.delete(`/menu/items/${itemId}`);
  }
};

export default menuService;
