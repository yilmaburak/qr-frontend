import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SubscriptionSuccess: React.FC = () => {
    const { t } = useTranslation('settings');
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-2xl text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FaCheckCircle className="text-5xl text-green-600" />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {t('subscription_success.title')}
                </h1>

                <p className="text-xl text-gray-600 mb-8">
                    {t('subscription_success.subtitle')}
                </p>

                <div className="bg-blue-50 rounded-lg p-6 mb-8">
                    <h2 className="font-semibold text-lg mb-4">{t('subscription_success.whats_next')}</h2>
                    <ul className="text-left space-y-2 text-gray-700">
                        <li>✅ {t('subscription_success.benefit_1')}</li>
                        <li>✅ {t('subscription_success.benefit_2')}</li>
                        <li>✅ {t('subscription_success.benefit_3')}</li>
                        <li>✅ {t('subscription_success.benefit_4')}</li>
                        <li>✅ {t('subscription_success.benefit_5')}</li>
                    </ul>
                </div>

                <div className="flex gap-4 justify-center">
                    <Link
                        to="/dashboard"
                        className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        {t('subscription_success.action_dashboard')}
                    </Link>

                    <Link
                        to="/subscription"
                        className="px-8 py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                        {t('subscription_success.action_subscription')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionSuccess;
