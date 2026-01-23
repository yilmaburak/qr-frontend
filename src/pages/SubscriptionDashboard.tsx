import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../services/api';
import { FaCreditCard, FaCalendar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import DashboardLayout from '../components/DashboardLayout';
import type { Subscription, SubscriptionUsage } from '../types/dashboard_types';

const SubscriptionDashboard: React.FC = () => {
    const { t } = useTranslation('settings');
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [usage, setUsage] = useState<SubscriptionUsage | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        fetchSubscriptionData();
    }, []);

    const fetchSubscriptionData = async () => {
        try {
            // const token = localStorage.getItem('token'); // Axios interceptor handles token

            const [subRes, usageRes] = await Promise.all([
                axios.get<Subscription>('/subscription/current'),
                axios.get<SubscriptionUsage>('/subscription/usage')
            ]);

            setSubscription(subRes.data);
            setUsage(usageRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
            setLoading(false);
        }
    };

    const handleManageBilling = async () => {
        try {
            // const token = localStorage.getItem('token');
            const response = await axios.post<{ portalUrl: string }>('/subscription/portal', {});

            window.location.href = response.data.portalUrl;
        } catch (error) {
            alert('Failed to open billing portal');
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-screen">
                    <div className="text-xl">Loading...</div>
                </div>
            </DashboardLayout>
        );
    }

    const isFree = subscription?.tier === 'FREE';
    const percentageUsed = usage?.percentageUsed || 0;

    return (
        <DashboardLayout>
            <div className="p-8 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">{t('subscription_dashboard.title')}</h1>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Current Plan Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">{t('subscription_dashboard.current_plan')}</h2>
                            <span className={`px-4 py-1 rounded-full text-sm font-semibold ${isFree
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                }`}>
                                {subscription?.tier?.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <FaCheckCircle className={`text-xl ${subscription?.status === 'ACTIVE' ? 'text-green-500' : 'text-gray-400'
                                    }`} />
                                <div>
                                    <p className="text-sm text-gray-500">{t('subscription_dashboard.status')}</p>
                                    <p className="font-medium">{subscription?.status}</p>
                                </div>
                            </div>

                            {!isFree && subscription?.currentPeriodEnd && (
                                <div className="flex items-center gap-3">
                                    <FaCalendar className="text-xl text-blue-500" />
                                    <div>
                                    <div>
                                    <p className="text-sm text-gray-500">{t('subscription_dashboard.renews_on')}</p>
                                    <p className="font-medium">
                                        <p className="font-medium">
                                            {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {subscription?.cancelAtPeriodEnd && subscription.currentPeriodEnd && (
                                <div className="flex items-center gap-3">
                                    <FaTimesCircle className="text-xl text-red-500" />
                                    <div>
                                        <p className="text-sm text-red-600 font-medium">
                                            {t('subscription_dashboard.cancel_on', { date: new Date(subscription.currentPeriodEnd).toLocaleDateString() })}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6 space-y-3">
                            {isFree ? (
                                <a
                                    href="/pricing"
                                    className="block w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold text-center hover:from-blue-700 hover:to-purple-700 transition-all"
                                >
                                    {t('subscription_dashboard.upgrade_pro')}
                                </a>
                            ) : (
                                <button
                                    onClick={handleManageBilling}
                                    className="w-full py-3 px-4 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaCreditCard />
                                    {t('subscription_dashboard.manage_billing')}
                                </button>
                            )}
                        </div>
                    </div>

                        {/* Usage Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('subscription_dashboard.monthly_usage')}</h2>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-600">{t('subscription_dashboard.qr_codes_created')}</span>
                                        <span className="font-semibold">
                                            {usage?.qrCodesUsed || 0}
                                            {!usage?.unlimited && ` / ${usage?.qrCodesLimit}`}
                                        </span>
                                    </div>

                                    {!usage?.unlimited ? (
                                        <>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${percentageUsed >= 80
                                                        ? 'bg-red-500'
                                                        : percentageUsed >= 50
                                                            ? 'bg-yellow-500'
                                                            : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                                                />
                                            </div>

                                            {percentageUsed >= 80 && (
                                                <p className="text-sm text-red-600 mt-2">
                                                    {t('subscription_dashboard.warning_low')}
                                                </p>
                                            )}

                                            <p className="text-xs text-gray-500 mt-2">
                                                {usage?.resetDate ? t('subscription_dashboard.resets_on', { date: new Date(usage.resetDate).toLocaleDateString() }) : 'N/A'}
                                            </p>
                                        </>
                                    ) : (
                                        <div className="flex items-center gap-2 text-green-600">
                                            <FaCheckCircle />
                                            <span className="font-medium">{t('subscription_dashboard.unlimited')}</span>
                                        </div>
                                    )}
                                </div>

                                {isFree && percentageUsed >= 50 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <p className="text-sm text-blue-800 font-medium mb-2">
                                            {t('subscription_dashboard.upgrade_hint')}
                                        </p>
                                        <a
                                            href="/pricing"
                                            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                                        >
                                            {t('subscription_dashboard.view_plans')}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Features Overview */}
                    <div className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            {isFree ? t('subscription_dashboard.unlock_features') : t('subscription_dashboard.your_features')}
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFree ? 'bg-gray-200' : 'bg-green-100'
                                    }`}>
                                    <FaCheckCircle className={isFree ? 'text-gray-400' : 'text-green-600'} />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{t('subscription_dashboard.feat_unlimited_qr')}</h3>
                                    <p className="text-sm text-gray-600">{t('subscription_dashboard.feat_unlimited_qr_desc')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFree ? 'bg-gray-200' : 'bg-green-100'
                                    }`}>
                                    <FaCheckCircle className={isFree ? 'text-gray-400' : 'text-green-600'} />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{t('subscription_dashboard.feat_analytics')}</h3>
                                    <p className="text-sm text-gray-600">{t('subscription_dashboard.feat_analytics_desc')}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isFree ? 'bg-gray-200' : 'bg-green-100'
                                    }`}>
                                    <FaCheckCircle className={isFree ? 'text-gray-400' : 'text-green-600'} />
                                </div>
                                <div>
                                    <h3 className="font-semibold">{t('subscription_dashboard.feat_restaurant')}</h3>
                                    <p className="text-sm text-gray-600">{t('subscription_dashboard.feat_restaurant_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
        </DashboardLayout>
    );
};

export default SubscriptionDashboard;
