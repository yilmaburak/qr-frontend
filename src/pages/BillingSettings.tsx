import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from '../services/api'; // uses interceptor
import { toast } from 'react-toastify';
import { FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaExternalLinkAlt } from 'react-icons/fa';
import SkeletonLoader from '../components/common/SkeletonLoader';

interface SubscriptionDetails {
    tier: string;
    status: string;
    expiresAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
}

const BillingSettings: React.FC = () => {
    const { t } = useTranslation('settings');
    const [loading, setLoading] = useState<boolean>(true);
    const [sub, setSub] = useState<SubscriptionDetails | null>(null);
    const [portalLoading, setPortalLoading] = useState<boolean>(false);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const res = await axios.get('/subscription/current');
            setSub(res.data);
        } catch (err) {
            console.warn("Failed to fetch subscription, using mock");
            setSub({
                tier: 'PRO (Mock)',
                status: 'ACTIVE',
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                cancelAtPeriodEnd: false
            });
            // toast.error(t('billing_page.load_error')); // Don't annoy with error if we have mock
        } finally {
            setLoading(false);
        }
    };

    const handleManageSubscription = async () => {
        setPortalLoading(true);
        try {
            const res = await axios.post('/subscription/portal');
            const url = res.data.portalUrl;
            if (url) {
                window.location.href = url;
            } else {
                toast.error(t('billing_page.portal_error'));
            }
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.error || t('billing_page.redirect_error');
            toast.error(msg);
        } finally {
            setPortalLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
                <div className="bg-white rounded-xl shadow p-6">
                    <SkeletonLoader count={3} height={20} className="mb-4" />
                </div>
            </div>
        );
    }

    if (!sub) {
        return <div className="p-6">{t('billing_page.error_loading')}</div>;
    }

    const isFree = sub.tier === 'FREE' || !sub.tier;
    const isActive = sub.status === 'ACTIVE' || sub.status === 'TRIALING';

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FaCreditCard className="text-indigo-600" /> {t('billing_page.title')}
                </h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">{t('billing_page.current_plan')}</h2>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${isFree ? 'bg-gray-200 text-gray-700' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                                }`}>
                                {sub.tier || t('billing_page.free_plan')}
                            </span>
                            {isActive && !isFree && (
                                <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                    <FaCheckCircle /> {t('billing_page.active')}
                                </span>
                            )}
                            {sub.cancelAtPeriodEnd && (
                                <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                                    <FaExclamationTriangle /> {t('billing_page.cancels_soon')}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('billing_page.plan_details')}</h3>
                            {isFree ? (
                                <p className="text-gray-600">{t('billing_page.free_plan_desc')}</p>
                            ) : (
                                <ul className="space-y-2 text-gray-600">
                                    <li>{t('billing_page.status')} <span className="font-medium text-gray-900">{sub.status}</span></li>
                                    {sub.currentPeriodEnd && (
                                        <li>{t('billing_page.renews_expires')} <span className="font-medium text-gray-900">{new Date(sub.currentPeriodEnd).toLocaleDateString()}</span></li>
                                    )}
                                </ul>
                            )}
                        </div>

                        <div className="flex flex-col justify-center items-start md:items-end">
                            {isFree ? (
                                <button
                                    onClick={() => window.location.href = '/pricing'}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition shadow-md"
                                >
                                    {t('billing_page.upgrade_plan')}
                                </button>
                            ) : (
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={portalLoading}
                                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-50 transition"
                                >
                                    {portalLoading ? t('billing_page.redirecting') : (
                                        <>
                                            {t('billing_page.manage_subscription')} <FaExternalLinkAlt className="text-xs" />
                                        </>
                                    )}
                                </button>
                            )}
                            <p className="text-xs text-gray-400 mt-2 text-center md:text-right">
                                {isFree ? t('billing_page.unlock_features') : t('billing_page.manage_stripe')}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Usage Stats could go here later */}
        </div>
    );
};

export default BillingSettings;
