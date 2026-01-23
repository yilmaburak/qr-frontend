import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { FaExclamationTriangle, FaRocket } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface UsageData {
    unlimited: boolean;
    percentageUsed: number;
    qrCodesLimit: number;
    qrCodesUsed: number;
}

const UsageLimitBanner: React.FC = () => {
    const { t } = useTranslation('common');
    const [usage, setUsage] = useState<UsageData | null>(null);
    const [show, setShow] = useState<boolean>(false);

    useEffect(() => {
        fetchUsage();
    }, []);

    const fetchUsage = async () => {
        try {
            // Note: Token is handled by api interceptor usually, but if not, logic remains
            // The original code retrieved token but didn't use it explicitly in api.get call headers here
            // assuming api.ts handles it or it's cookie based.
            // Original line: const token = localStorage.getItem('token');
            // But api.get('/subscription/usage') was called without config using that token var.
            // So I'll omit the unused var.

            const response = await api.get('/subscription/usage');

            setUsage(response.data);

            // Show banner if usage > 50% or unlimited is false
            if (!response.data.unlimited && response.data.percentageUsed >= 50) {
                setShow(true);
            }
        } catch (error) {
            console.error('Failed to fetch usage:', error);
        }
    };

    if (!show || !usage) return null;

    const percentageUsed = usage.percentageUsed;
    const isNearLimit = percentageUsed >= 80;
    const atLimit = percentageUsed >= 100;

    return (
        <div className={`rounded-lg p-4 mb-6 ${atLimit
            ? 'bg-red-50 border-2 border-red-500'
            : isNearLimit
                ? 'bg-yellow-50 border-2 border-yellow-500'
                : 'bg-blue-50 border-2 border-blue-400'
            }`}>
            <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${atLimit
                    ? 'bg-red-100'
                    : isNearLimit
                        ? 'bg-yellow-100'
                        : 'bg-blue-100'
                    }`}>
                    {atLimit || isNearLimit ? (
                        <FaExclamationTriangle className={atLimit ? 'text-red-600' : 'text-yellow-600'} />
                    ) : (
                        <FaRocket className="text-blue-600" />
                    )}
                </div>

                <div className="flex-1">
                    <h3 className={`font-semibold text-lg mb-1 ${atLimit
                        ? 'text-red-900'
                        : isNearLimit
                            ? 'text-yellow-900'
                            : 'text-blue-900'
                        }`}>
                        }`}>
                        {atLimit
                            ? t('limit.reached_title')
                            : isNearLimit
                                ? t('limit.low_title')
                                : t('limit.enjoying_title')}
                    </h3>

                    <p className={`text-sm mb-3 ${atLimit
                        ? 'text-red-800'
                        : isNearLimit
                            ? 'text-yellow-800'
                            : 'text-blue-800'
                        }`}>
                        {atLimit
                            ? t('limit.reached_desc', { limit: usage.qrCodesLimit })
                            : isNearLimit
                                ? t('limit.low_desc', { used: usage.qrCodesUsed, limit: usage.qrCodesLimit, percent: percentageUsed })
                                : t('limit.enjoying_desc', { used: usage.qrCodesUsed, limit: usage.qrCodesLimit })}
                    </p>

                    <div className="flex gap-3">
                        <Link
                            to="/pricing"
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${atLimit
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : isNearLimit
                                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            <FaRocket />
                            {t('upgrade.upgrade_to_pro')}
                        </Link>

                        {!atLimit && (
                            <button
                                onClick={() => setShow(false)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                {t('common.dismiss')}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsageLimitBanner;
