import api from './api';
import type { Category, MenuItem } from '../types/menu';


const menuService = {
    getMenus: async (userId: string | number): Promise<Menu[]> => {
        try {
            const response = await api.get(`/menu?userId=${userId}`);
            return response.data;
        } catch (error) {
            console.warn("Returing mock menus");
            return [{ id: 1, name: "Default Menu", isActive: true, userId: Number(userId) }];
        }
    },

    createMenu: async (menuData: Partial<Menu>): Promise<Menu> => {
        const response = await api.post('/menu', menuData);
        return response.data;
    },

    deleteMenu: async (menuId: string | number): Promise<void> => {
        await api.delete(`/menu/${menuId}`);
    },

    getCategories: async (userId?: string | number, menuId?: string | number): Promise<Category[]> => {
        try {
            // Note: If userId is optional in backend, keep it optional here.
            let url = '/menu/categories';
            if (menuId) url += `?menuId=${menuId}`;
            else if (userId) url += `?userId=${userId}`;

            const response = await api.get(url);
            return response.data;
        } catch (error) {
            console.warn("Failed to fetch categories, using mock data");
            return MOCK_ADMIN_CATEGORIES;
        }
    },

    createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
        try {
            const response = await api.post('/menu/categories', categoryData);
            return response.data;
        } catch (error) {
            console.warn("Failed to create category, returning mock");
            return { id: Date.now(), ...categoryData } as Category;
        }
    },

    deleteCategory: async (categoryId: string | number): Promise<void> => {
        try {
            await api.delete(`/menu/categories/${categoryId}`);
        } catch (error) {
            console.warn("Failed to delete category (mock mode)");
        }
    },

    getMenuItems: async (categoryId: string | number, page = 0, size = 100): Promise<MenuItem[]> => {
        try {
            const response = await api.get(`/menu/items?categoryId=${categoryId}&page=${page}&size=${size}`);
            // Backend now returns Page<MenuItem>, so we need to extract content
            if (response.data && Array.isArray(response.data.content)) {
                return response.data.content;
            }
            // Fallback for mock or old format
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.warn("Failed to fetch items, using mock data");
            // Filter items by categoryId if matching, or just return all for demo if ID doesn't match
            const items = MOCK_ADMIN_ITEMS.filter(i => i.categoryId === Number(categoryId));
            return items.length > 0 ? items : MOCK_ADMIN_ITEMS;
        }
    },

    getMenuItem: async (id: string | number): Promise<MenuItem> => {
        const response = await api.get(`/menu/items/${id}`);
        return response.data;
    },

    createMenuItem: async (itemData: Partial<MenuItem>): Promise<MenuItem> => {
        const response = await api.post('/menu/items', itemData);
        return response.data;
    },

    deleteMenuItem: async (itemId: string | number): Promise<void> => {
        await api.delete(`/menu/items/${itemId}`);
    }
};

export default menuService;
