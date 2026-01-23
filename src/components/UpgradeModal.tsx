import React from 'react';
import { FaRocket, FaChartLine, FaMagic, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, featureName = "Dynamic QR Codes" }) => {
    const { t } = useTranslation('common');
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative transform transition-all scale-100 animate-scaleIn">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <FaTimes />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-md shadow-inner text-2xl">
                            🚀
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{t('upgrade.unlock')} {featureName}</h2>
                        <p className="text-blue-100 text-sm">{t('upgrade.call_to_action')}</p>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <FaCheckCircle className="text-green-500 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('upgrade.features.edit_content.title')}</h3>
                                <p className="text-sm text-gray-500">{t('upgrade.features.edit_content.desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaChartLine className="text-blue-500 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('upgrade.features.analytics.title')}</h3>
                                <p className="text-sm text-gray-500">{t('upgrade.features.analytics.desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <FaMagic className="text-purple-500 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-gray-900">{t('upgrade.features.templates.title')}</h3>
                                <p className="text-sm text-gray-500">{t('upgrade.features.templates.desc')}</p>
                            </div>
                        </div>
                    </div>

                    <Link
                        to="/pricing"
                        className="block w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-center rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        {t('upgrade.upgrade_to_pro')}
                    </Link>

                    <button
                        onClick={onClose}
                        className="block w-full text-center text-gray-400 text-sm mt-4 hover:text-gray-600 font-medium"
                    >
                        {t('upgrade.maybe_later')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
