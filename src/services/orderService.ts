import api from './api';
import { RestaurantOrder } from '../types/restaurant';

const orderService = {
    // Get all orders for the current restaurant
    getOrders: async (): Promise<RestaurantOrder[]> => {
        const response = await api.get('/restaurant/orders');
        return response.data;
    },

    // Create a new order
    createOrder: async (order: RestaurantOrder): Promise<RestaurantOrder> => {
        const response = await api.post('/restaurant/orders', order);
        return response.data;
    },

    // Quick Actions for One-Tap Status Changes
    markPreparing: async (orderId: number): Promise<RestaurantOrder> => {
        const response = await api.post(`/restaurant/orders/${orderId}/quick-actions/preparing`);
        return response.data;
    },

    markReady: async (orderId: number): Promise<RestaurantOrder> => {
        const response = await api.post(`/restaurant/orders/${orderId}/quick-actions/ready`);
        return response.data;
    },

    markServed: async (orderId: number): Promise<RestaurantOrder> => {
        const response = await api.post(`/restaurant/orders/${orderId}/quick-actions/served`);
        return response.data;
    },

    // Legacy status update (if needed)
    updateStatus: async (orderId: number, status: string): Promise<RestaurantOrder> => {
        const response = await api.put(`/restaurant/orders/${orderId}/status?status=${status}`);
        return response.data;
    },

    // Payment status update
    updatePaymentStatus: async (orderId: number, status: string): Promise<void> => {
        await api.put(`/restaurant/orders/${orderId}/payment?status=${status}`);
    }
};

export default orderService;
