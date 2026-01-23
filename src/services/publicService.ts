import axios from 'axios';
import type { Category, MenuItem } from '../types/menu';

const API_URL = '/api/restaurant/public';

const getCategories = async (params: { restaurantId?: string | number; branchId?: string | number; menuUid?: string }): Promise<Category[]> => {
    const query = new URLSearchParams();
    if (params.restaurantId) query.append('restaurantId', params.restaurantId.toString());
    if (params.branchId) query.append('branchId', params.branchId.toString());
    if (params.menuUid) query.append('menuUid', params.menuUid);

    // If neither is provided, this call will fail on backend (400 Bad Request)
    const response = await axios.get(`${API_URL}/categories?${query.toString()}`);
    return response.data;
};

const getMenuItems = async (categoryId: string | number, page = 0, size = 50): Promise<MenuItem[]> => {
    const response = await axios.get(`${API_URL}/items?categoryId=${categoryId}&page=${page}&size=${size}`);
    // Handle Page<MenuItem> response
    if (response.data && Array.isArray(response.data.content)) {
        return response.data.content;
    }
    return Array.isArray(response.data) ? response.data : [];
};

const createOrder = async (restaurantId: string | number, orderData: any): Promise<any> => {
    const response = await axios.post(`${API_URL}/orders?restaurantId=${restaurantId}`, orderData);
    return response.data;
};

const publicService = {
    getCategories,
    getMenuItems,
    createOrder
};

export default publicService;
