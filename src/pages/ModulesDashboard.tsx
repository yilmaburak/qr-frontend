import React from 'react';
import { useTranslation } from 'react-i18next';
import ModuleSwitcher from '../components/ModuleSwitcher';
import { useModule } from '../contexts/ModuleContext';
import { useNavigate } from 'react-router-dom';

const ModulesDashboard: React.FC = () => {
    const { t } = useTranslation('dashboard');
    const { currentModule, switchModule } = useModule();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-8 flex items-center justify-center relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2"></div>
            </div>

            <div className="max-w-5xl w-full relative z-10">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">{t('modules_dashboard.welcome')}</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        {t('modules_dashboard.subtitle')}
                    </p>
                </div>

                <ModuleSwitcher />

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500">
                        {t('modules_dashboard.need_help')} <a href="#" className="text-blue-400 hover:text-blue-300">{t('modules_dashboard.contact_support')}</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModulesDashboard;
