import api from './api';
import { QRCodeItem, Folder } from '../types/dashboard_types';

interface PaginatedResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

export const qrService = {
    getQRCodes: async (params: { page?: number; size?: number; filter?: string; projectId?: string | number }) => {
        const response = await api.get<PaginatedResponse<QRCodeItem>>('/qrcodes', { params });
        return response.data;
    },

    deleteQRCode: async (id: string | number) => {
        await api.delete(`/qrcodes/${id}`);
    },

    moveQRCodeToProject: async (id: string | number, projectId: string | number | null) => {
        const response = await api.put(`/qrcodes/${id}/project`, { projectId });
        return response.data;
    },

    getProjects: async () => {
        const response = await api.get<Folder[]>('/projects');
        return response.data;
    },

    createProject: async (name: string) => {
        const response = await api.post('/projects', { name });
        return response.data;
    },

    deleteProject: async (id: string | number) => {
        await api.delete(`/projects/${id}`);
    }
};
