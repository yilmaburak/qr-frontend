import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaQrcode, FaUser, FaSignOutAlt, FaChartLine, FaUsers, FaHistory, FaDollarSign, FaUserShield, FaUtensils, FaIdCard, FaFolder, FaCreditCard } from 'react-icons/fa';
import LanguageSwitcher from './LanguageSwitcher';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    installApp?: () => void;
    showInstallButton?: boolean;
}

interface NavLinkProps {
    to: string;
    icon: React.ElementType;
    label: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, installApp, showInstallButton }) => {
    const location = useLocation();
    const { t } = useTranslation('dashboard');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Helper function to check if user has a specific role
    const hasRole = (roleName: string) => {
        if (!user?.role) return false;
        return user.role.includes(roleName);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const isActive = (path: string) => location.pathname === path;

    const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, label }) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive(to)
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
        >
            <Icon className="text-xl" />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className={`fixed left-0 top-0 h-screen w-64 bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            {/* Header */}
            <div className="p-6 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    QR
                </div>
                <span className="text-xl font-bold text-gray-800 tracking-tight">Generator</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">

                {/* Admin Panel Button (Conditional) */}
                {user?.role === 'SUPER_ADMIN' && (
                    <Link to="/admin" className="block mb-4 p-3 rounded-xl bg-gradient-to-r from-purple-500 to-orange-400 text-white shadow-md hover:shadow-lg transition-all transform hover:scale-[1.02]">
                        <div className="flex items-center gap-3">
                            <FaUserShield className="text-xl" />
                            <span className="font-bold">{t('admin_panel')}</span>
                        </div>
                    </Link>
                )}

                {/* Standard User Links */}
                {!hasRole('RESTAURANT_USER') && (
                    <>
                        <div className="pt-2 pb-2">
                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('core')}</p>
                        </div>
                        <NavLink to="/qr/dashboard" icon={FaQrcode} label={t('title')} />
                        <NavLink to="/qr/create" icon={FaChartLine} label={t('create_qr')} />
                        <NavLink to="/qr/analytics" icon={FaChartLine} label={t('analytics')} />
                        <NavLink to="/qr/history" icon={FaHistory} label={t('scan_history')} />

                        <div className="pt-4 pb-2">
                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('tools')}</p>
                        </div>
                        <NavLink to="/qr/bulk" icon={FaQrcode} label={t('bulk_create')} />

                        <div className="pt-4 pb-2">
                            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">{t('management')}</p>
                        </div>
                        <NavLink to="/qr/organization" icon={FaUsers} label={t('organization')} />
                    </>
                )}

                <NavLink to="/qr/billing" icon={FaCreditCard} label={t('billing')} />
                <NavLink to="/qr/pricing" icon={FaDollarSign} label={t('pricing')} />

                {/* Restaurant Module Link (Conditional) */}
                {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR') || hasRole('RESTAURANT_USER')) && (
                    <Link to="/restaurant" className="flex items-center gap-3 px-4 py-3 rounded-xl gap-3 px-4 py-3 rounded-xl text-green-600 hover:bg-green-50 transition-all duration-200 mt-2 border border-dashed border-green-200">
                        <FaUtensils className="text-xl" />
                        <span className="font-medium">{t('restaurant_module')}</span>
                    </Link>
                )}



            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
                <div className="mb-3">
                    <LanguageSwitcher />
                </div>
                {showInstallButton && installApp && (
                    <button
                        onClick={installApp}
                        className="w-full mb-3 flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                    >
                        {t('install_app')}
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                >
                    <FaSignOutAlt className="text-xl" />
                    <span className="font-medium">{t('sign_out')}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
