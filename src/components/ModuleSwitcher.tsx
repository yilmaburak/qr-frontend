import React from 'react';
import { useModule, type ModuleType } from '../contexts/ModuleContext';
import { QrCode, Utensils, ShieldCheck, ChevronRight, LayoutGrid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ModuleSwitcher: React.FC<{ condensed?: boolean }> = ({ condensed = false }) => {
    const { t } = useTranslation('common');
    const { switchModule, currentModule, availableModules } = useModule();

    const modules = [
        {
            id: 'QR_GENERATOR' as ModuleType,
            name: 'QR Generator',
            icon: <QrCode size={20} />,
            color: 'bg-blue-500',
        },
        {
            id: 'RESTAURANT' as ModuleType,
            name: 'Restaurant',
            icon: <Utensils size={20} />,
            color: 'bg-orange-500',
        },
        {
            id: 'ACCESS_CONTROL' as ModuleType,
            name: 'Access Control',
            icon: <ShieldCheck size={20} />,
            color: 'bg-purple-500',
        },
    ];

    if (condensed) {
        // Dropdown or simplified view for sidebar
        return (
            <div className="mb-6 px-2">
                <button
                    onClick={() => switchModule('DASHBOARD')}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                >
                    <LayoutGrid size={16} />
                    <span>Switch Module</span>
                </button>
            </div>
        );
    }

    // Dashboard View
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modules.map((module) => {
                const hasAccess = availableModules.some(m => m.module === module.id && m.active);
                const isActive = currentModule === module.id;

                return (
                    <div
                        key={module.id}
                        className={`relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 transition-all hover:bg-white/10 cursor-pointer group
                ${isActive ? 'ring-2 ring-blue-500/50' : ''}
            `}
                        onClick={() => switchModule(module.id)}
                    >
                        <div className={`absolute top-0 right-0 p-4 opacity-50`}>
                            <div className={`w-24 h-24 rounded-full blur-2xl ${module.color.replace('bg-', 'bg-')}/20 -mr-10 -mt-10`} />
                        </div>

                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-lg ${module.color} flex items-center justify-center mb-4 shadow-lg`}>
                                {React.cloneElement(module.icon as React.ReactElement, { className: 'text-white' })}
                            </div>

                            <h3 className="text-xl font-bold text-white mb-2">{module.name}</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                {module.id === 'QR_GENERATOR' && "Create, track and manage dynamic QR codes."}
                                {module.id === 'RESTAURANT' && "Manage menu, orders, staff and tables."}
                                {module.id === 'ACCESS_CONTROL' && "Secure access passes and validation."}
                            </p>

                            <div className="flex items-center justify-between">
                                {hasAccess ? (
                                    <span className={`text-sm font-medium flex items-center gap-1 
                            ${isActive ? 'text-blue-400' : 'text-green-400'}`}>
                                        {isActive ? 'Current Module' : 'Open Module'}
                                        <ChevronRight size={16} />
                                    </span>
                                ) : (
                                    <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                                        Not Purchased
                                        <ChevronRight size={16} />
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ModuleSwitcher;
