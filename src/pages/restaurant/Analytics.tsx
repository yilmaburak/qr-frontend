```typescript
import React, { useState, useEffect } from 'react';
import axios from '../../services/api';
import { FaDollarSign, FaShoppingBag, FaUsers, FaArrowUp } from 'react-icons/fa';
import type { AnalyticsSummary } from '../../types/restaurant';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
    const { t } = useTranslation('restaurant');
    const [summary, setSummary] = useState<AnalyticsSummary>({ totalRevenue: 0, totalOrders: 0 });
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        try {
            const res = await axios.get<AnalyticsSummary>('/restaurant/analytics/summary');
            setSummary(res.data);
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        {
            label: t('analytics_dashboard.total_revenue'),
            value: `$${ summary.totalRevenue?.toFixed(2) || '0.00' } `,
            icon: FaDollarSign,
            color: 'bg-green-100 text-green-600',
            trend: `+ 12 % ${ t('analytics_dashboard.from_last_week') } `
        },
        {
            label: t('analytics_dashboard.total_orders'),
            value: summary.totalOrders || 0,
            icon: FaShoppingBag,
            color: 'bg-orange-100 text-orange-600',
            trend: `+ 5 % ${ t('analytics_dashboard.from_yesterday') } `
        },
        {
            label: t('analytics_dashboard.active_tables'),
            value: '12/20',
            icon: FaUsers,
            color: 'bg-blue-100 text-blue-600',
            trend: `85 % ${ t('analytics_dashboard.occupancy') } `
        }
    ];

    if (loading) return <div>{t('analytics_dashboard.loading')}</div>;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('analytics_dashboard.title')}</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p - 3 rounded - lg ${ stat.color } text - xl`}>
                                <stat.icon />
                            </div>
                            <span className="flex items-center text-xs font-semibold text-green-500 bg-green-50 px-2 py-1 rounded-full">
                                <FaArrowUp className="mr-1" /> {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
                        <p className="text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-bold text-lg">{t('analytics_dashboard.recent_activity')}</h2>
                    <button className="text-orange-500 text-sm font-semibold hover:underline">{t('analytics_dashboard.view_all')}</button>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold">
                            #1
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">New Order form Table 5</p>
                            <p className="text-xs text-gray-500">2 mins ago</p>
                        </div>
                        <span className="ml-auto text-sm font-bold text-orange-500">$45.00</span>
                    </div>
                    {/* Mock items */}
                    <div className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold">
                            $
                        </div>
                        <div>
                            <p className="font-semibold text-gray-800">Payment Received</p>
                            <p className="text-xs text-gray-500">15 mins ago</p>
                        </div>
                        <span className="ml-auto text-sm font-bold text-green-500">+$120.50</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
