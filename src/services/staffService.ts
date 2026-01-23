import api from './api';

export interface StaffCreateRequest {
    username: string;
    password: string;
    email?: string;
    role?: string;
}

export interface StaffUser {
    id: number;
    username: string;
    email: string;
    status: string;
    role: string;
}

const staffService = {
    async getStaff(): Promise<StaffUser[]> {
        try {
            const response = await api.get('/restaurant/admin/staff');
            return response.data;
        } catch (error) {
            console.warn("Failed to fetch staff, using mock");
            const { MOCK_STAFF } = require('../data/mockData');
            return MOCK_STAFF;
        }
    },

    async createStaff(data: StaffCreateRequest): Promise<string> {
        const response = await api.post('/restaurant/admin/staff', data);
        return response.data;
    }
};

export default staffService;
