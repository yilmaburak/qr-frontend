import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCheck, FaStore, FaIdCard, FaQrcode } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { getCurrentUser } from '../services/auth';
import { motion } from 'framer-motion';

interface PricingTier {
    name: string;
    price: number;
    billingCycle: string;
    features: string[];
    discount?: string;
}

interface ModulePricing {
    [key: string]: PricingTier;
}

interface AllPricing {
    QR_GENERATOR: ModulePricing;
    RESTAURANT: ModulePricing;
    ACCESS_CONTROL: ModulePricing;
}

// Map module keys to display names and icons
// Map module keys to display names and icons
import { useTranslation } from 'react-i18next';

const MODULE_CONFIG: Record<string, { labelKey: string; icon: React.ElementType; color: string }> = {
    QR_GENERATOR: { labelKey: 'modules.QR_GENERATOR', icon: FaQrcode, color: 'blue' },
    RESTAURANT: { labelKey: 'modules.RESTAURANT', icon: FaStore, color: 'orange' },
    ACCESS_CONTROL: { labelKey: 'modules.ACCESS_CONTROL', icon: FaIdCard, color: 'purple' }
};

const Pricing: React.FC = () => {
    const { t } = useTranslation('pricing');
    const [loading, setLoading] = useState<boolean>(true);
    const [pricingData, setPricingData] = useState<AllPricing | null>(null);
    const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');

    // Modal State
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedTierKey, setSelectedTierKey] = useState<string | null>(null);
    const [selectedModule, setSelectedModule] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);

    const user: any = getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        fetchPricing();
    }, []);

    const fetchPricing = async () => {
        try {
            const { data } = await api.get('/subscription/tiers');
            setPricingData(data);
        } catch (error) {
            console.error('Failed to fetch pricing:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = (module: string, tierKey: string) => {
        if (!user) {
            navigate('/register');
            return;
        }
        setSelectedModule(module);
        setSelectedTierKey(tierKey);
        setShowModal(true);
    };

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessingPayment(true);
        try {
            await api.post('/subscriptions/modules/grant', {
                userId: user.id,
                module: selectedModule,
                tier: selectedTierKey?.includes('PRO') ? 'PRO' : 'FREE',
                billingCycle: billingInterval
            });
            alert(t('messages.success', { module: t(MODULE_CONFIG[selectedModule!].labelKey) }));
            setShowModal(false);
            window.location.reload();
        } catch (error: any) {
            console.error('Subscription failed:', error);
            alert(t('messages.fail', { error: error.response?.data?.message || 'Unknown error' }));
        } finally {
            setProcessingPayment(false);
        }
    };

    const renderContent = () => {
        if (loading || !pricingData) {
            return (
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            );
        }

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-16">
                    <div className="bg-white border border-gray-200 p-1 rounded-full shadow-sm inline-flex items-center relative">
                        <button
                            onClick={() => setBillingInterval('MONTHLY')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all z-10 ${billingInterval === 'MONTHLY' ? 'bg-gray-900 text-white' : 'text-gray-600'
                                }`}
                        >
                            {t('monthly')}
                        </button>
                        <button
                            onClick={() => setBillingInterval('YEARLY')}
                            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all z-10 flex items-center ${billingInterval === 'YEARLY' ? 'bg-gray-900 text-white' : 'text-gray-600'
                                }`}
                        >
                            {t('yearly')}
                            <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                {t('yearly_discount')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* All Modules Side-by-Side Grid */}
                <div className="grid md:grid-cols-3 gap-8 items-start">
                    {Object.keys(MODULE_CONFIG).map((moduleKey) => {
                        const config = MODULE_CONFIG[moduleKey];
                        const Icon = config.icon;
                        const currentModuleData = pricingData[moduleKey as keyof AllPricing];
                        const themeColor = config.color;

                        if (!currentModuleData) return null;

                        // Filter and Sort Tiers
                        const relevantTiers = Object.entries(currentModuleData).filter(([key, tier]) => {
                            if (key === 'FREE') return true;
                            return tier.billingCycle === billingInterval;
                        });

                        relevantTiers.sort(([keyA], [keyB]) => {
                            if (keyA === 'FREE') return -1;
                            if (keyB === 'FREE') return 1;
                            return 0;
                        });

                        return (
                            <div key={moduleKey} className="relative flex flex-col h-full">
                                {/* Section Header */}
                                <div className={`flex flex-col items-center mb-6 p-6 rounded-2xl bg-${themeColor}-50 border border-${themeColor}-100 text-center`}>
                                    <div className={`p-3 rounded-full bg-white shadow-sm mb-3`}>
                                        <Icon className={`text-3xl text-${themeColor}-600`} />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{t(config.labelKey)}</h2>
                                    <p className="text-gray-500 text-sm mt-1">{t('features_for', { module: t(config.labelKey) })}</p>
                                </div>

                                {/* Pricing Cards Stack - Vertically inside the column */}
                                <div className="space-y-6 flex-grow">
                                    {relevantTiers.map(([key, tier]) => {
                                        const isFree = key === 'FREE';
                                        const isPro = key.includes('PRO');

                                        return (
                                            <motion.div
                                                key={key}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 0.3 }}
                                                className={`
                                                    relative rounded-2xl p-6 transition-all duration-300 flex flex-col
                                                    ${isPro
                                                        ? `bg-white border-2 border-${themeColor}-500 shadow-xl z-10`
                                                        : 'bg-white border border-gray-200 shadow-md'}
                                                `}
                                            >
                                                {isPro && (
                                                    <div className={`absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-${themeColor}-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-sm`}>
                                                        {t('popular')}
                                                    </div>
                                                )}

                                                <div className="mb-4 text-center">
                                                    <h3 className="text-lg font-bold text-gray-900 mb-1">{tier.name}</h3>
                                                    <div className="flex justify-center items-baseline mb-2">
                                                        <span className="text-3xl font-extrabold text-gray-900">
                                                            ${tier.price}
                                                        </span>
                                                        <span className="text-gray-500 ml-1 text-sm">
                                                            /{tier.billingCycle === 'FREE' ? t('forever') : t('mo')}
                                                        </span>
                                                    </div>
                                                    {tier.discount && (
                                                        <p className="text-green-600 font-semibold text-xs bg-green-50 inline-block px-2 py-0.5 rounded-full">
                                                            {tier.discount}
                                                        </p>
                                                    )}
                                                </div>

                                                <ul className="space-y-3 mb-6 flex-grow">
                                                    {tier.features.slice(0, 5).map((feature, idx) => ( // Show first 5 features to save space
                                                        <li key={idx} className="flex items-start">
                                                            <FaCheck className={`mt-1 mr-2 flex-shrink-0 text-xs ${isPro ? `text-${themeColor}-500` : 'text-green-500'}`} />
                                                            <span className="text-gray-600 text-xs leading-relaxed">{feature}</span>
                                                        </li>
                                                    ))}
                                                    {tier.features.length > 5 && (
                                                        <li className="text-center text-xs text-gray-400 italic">
                                                            {t('more_features', { count: tier.features.length - 5 })}
                                                        </li>
                                                    )}
                                                </ul>

                                                <button
                                                    onClick={() => handleSubscribe(moduleKey, key)}
                                                    className={`
                                                        w-full py-3 px-4 rounded-xl font-bold text-sm transition-all shadow-sm mt-auto
                                                        ${isPro
                                                            ? `bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 hover:shadow-md`
                                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}
                                                    `}
                                                >
                                                    {isFree ? t('start_free') : t('choose_plan', { plan: tier.name })}
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ or Info */}
                <div className="mt-20 text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
                    <p>{t('footer_note')}</p>
                </div>
            </div>
        );
    };

    return user ? (
        <DashboardLayout>
            {renderContent()}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-bold mb-4">{t('modal.title')}</h3>
                        <p className="text-gray-600 mb-6">
                            {t('modal.desc', { module: t(MODULE_CONFIG[selectedModule!].labelKey), tier: selectedTierKey })}
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-semibold hover:bg-gray-50"
                            >
                                {t('modal.cancel')}
                            </button>
                            <button
                                onClick={handlePaymentSubmit}
                                disabled={processingPayment}
                                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-70"
                            >
                                {processingPayment ? t('modal.processing') : t('modal.confirm')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    ) : (
        <>
            {renderContent()}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center">
                        <h3 className="text-xl font-bold mb-4">{t('login_modal.title')}</h3>
                        <p className="text-gray-600 mb-6">{t('login_modal.desc')}</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700"
                        >
                            {t('login_modal.login_btn')}
                        </button>
                        <button
                            onClick={() => setShowModal(false)}
                            className="mt-3 text-gray-500 text-sm hover:underline"
                        >
                            {t('login_modal.cancel')}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Pricing;
