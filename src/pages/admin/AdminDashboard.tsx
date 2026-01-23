import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { FaUsers, FaQrcode, FaUtensils, FaChartLine } from 'react-icons/fa';
import type { AdminStats } from '../../types/admin';
import { useTranslation } from 'react-i18next';

const SubscriptionToggle: React.FC = () => {
    const [enabled, setEnabled] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        api.get<{ enabled: boolean }>('/admin/settings/subscription-enabled')
            .then(res => {
                setEnabled(res.data.enabled);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch subscription setting", err);
                setLoading(false);
            });
    }, []);

    const toggle = () => {
        const newState = !enabled;
        setEnabled(newState); // Optimistic update
        api.post('/admin/settings/subscription-enabled', { enabled: newState })
            .catch(err => {
                console.error("Failed to update setting", err);
                setEnabled(!newState); // Revert on error
            });
    };

    if (loading) return <span className="text-xs text-gray-400">Loading...</span>;

    return (
        <button
            onClick={toggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${enabled ? 'bg-green-500' : 'bg-gray-200'}`}
        >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );
};

const AdminDashboard: React.FC = () => {
    const { t } = useTranslation('admin');
    const navigate = useNavigate();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get<AdminStats>('/admin/dashboard/stats');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('dashboard.title')}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Users Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{t('dashboard.total_users')}</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">
                                {stats?.totalUsers || 0}
                            </h3>
                        </div>
                        <div className="bg-blue-100 p-4 rounded-full">
                            <FaUsers className="text-blue-500 text-2xl" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        <span className="text-green-600 font-semibold">{t('dashboard.active_users_count', { count: stats?.activeUsers || 0 })}</span>
                    </div>
                </div>

                {/* Restaurant Owners Card */}
                <div
                    onClick={() => navigate('/admin/restaurants')}
                    className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{t('dashboard.restaurants')}</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">
                                {stats?.totalRestaurants || 0}
                            </h3>
                        </div>
                        <div className="bg-green-100 p-4 rounded-full">
                            <FaUtensils className="text-green-500 text-2xl" />
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-gray-600">
                        {t('dashboard.manage_restaurants')}
                    </div>
                </div>

                {/* Regular Users Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{t('dashboard.regular_users')}</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">
                                {stats?.regularUsers || 0}
                            </h3>
                        </div>
                        <div className="bg-purple-100 p-4 rounded-full">
                            <FaQrcode className="text-purple-500 text-2xl" />
                        </div>
                    </div>
                </div>

                {/* Super Admins Card */}
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">{t('dashboard.super_admins')}</p>
                            <h3 className="text-3xl font-bold text-gray-800 mt-2">
                                {stats?.superAdmins || 0}
                            </h3>
                        </div>
                        <div className="bg-red-100 p-4 rounded-full">
                            <FaChartLine className="text-red-500 text-2xl" />
                        </div>
                    </div>
                </div>
            </div>

            {/* User Status Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('dashboard.user_status')}</h2>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</p>
                        <p className="text-sm text-gray-600">{t('dashboard.active')}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-600">{stats?.inactiveUsers || 0}</p>
                        <p className="text-sm text-gray-600">{t('dashboard.inactive')}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">0</p>
                        <p className="text-sm text-gray-600">{t('dashboard.suspended')}</p>
                    </div>
                </div>
            </div>

            {/* System Settings Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-gray-500 text-sm font-medium">{t('dashboard.system_settings')}</p>
                        <h3 className="text-lg font-bold text-gray-800 mt-1">{t('dashboard.global_config')}</h3>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-full">
                        <FaChartLine className="text-gray-600 text-2xl" />
                    </div>
                </div>
                <div className="flex items-center justify-between mt-4 bg-gray-50 p-3 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{t('dashboard.subscriptions_enabled')}</span>
                    <SubscriptionToggle />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
