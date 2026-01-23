import api from './api';
import { AnalyticsSummary, RevenueData, PopularItemData, FinancialReport } from '../types/restaurant';


const analyticsService = {
    getSummary: async (): Promise<AnalyticsSummary> => {
        const response = await api.get('/restaurant/analytics/summary');
        return response.data;
    },

    getRevenueChart: async (): Promise<RevenueData[]> => {
        const response = await api.get('/restaurant/analytics/charts/revenue');
        return response.data;
    },

    getPopularItemsChart: async (): Promise<PopularItemData[]> => {
        const response = await api.get('/restaurant/analytics/charts/popular-items');
        return response.data;
    },

    getFinancialReport: async (startDate: string, endDate: string): Promise<FinancialReport> => {
        const response = await api.get('/restaurant/analytics/financial', {
            params: { startDate, endDate }
        });
        return response.data;
    }
};

export default analyticsService;
