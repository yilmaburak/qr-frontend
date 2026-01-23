import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LogOut,
    User,
    Utensils,
    Receipt,
    LayoutGrid,
    BarChart3,
    Monitor,
    MessageSquare,
    Calendar,
    Store,
    Package // Added Package icon from lucide-react
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useModule } from '../contexts/ModuleContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import ModuleSwitcher from './ModuleSwitcher';
import LanguageSwitcher from './LanguageSwitcher';

const RestaurantSidebar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation('dashboard'); // Use dashboard namespace

    const hasRole = (role: string) => user?.role?.includes(role) || user?.role?.includes('SUPER_ADMIN');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Utensils className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Gourmet OS
                        </h1>
                        <p className="text-xs text-orange-400 font-medium">Restaurant Mgr</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
                <ModuleSwitcher condensed />

                {/* Restaurant Module */}
                <div className="space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('management')}
                    </div>

                    <NavLink
                        to="/restaurant/kitchen"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Monitor size={20} />
                        <span className="font-medium">{t('kitchen_view')}</span>
                    </NavLink>

                    <NavLink
                        to="/restaurant/reservations"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Calendar size={20} />
                        <span className="font-medium">{t('bookings')}</span>
                    </NavLink>

                    <NavLink
                        to="/restaurant/feedback"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <MessageSquare size={20} />
                        <span className="font-medium">{t('customer_feedback')}</span>
                    </NavLink>

                    <NavLink
                        to="/restaurant/analytics"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <BarChart3 size={20} />
                        <span className="font-medium">{t('analytics')}</span>
                    </NavLink>

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/inventory"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <Package size={20} />
                            <span className="font-medium">{t('inventory')}</span>
                        </NavLink>
                    )}

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/recipes"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <Utensils size={20} />
                            <span className="font-medium">{t('recipes')}</span>
                        </NavLink>
                    )}

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/branches"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <Store size={20} />
                            <span className="font-medium">{t('branches')}</span>
                        </NavLink>
                    )}

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/tables"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <LayoutGrid size={20} />
                            <span className="font-medium">{t('tables_qr')}</span>
                        </NavLink>
                    )}

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/menu"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <Utensils size={20} />
                            <span className="font-medium">{t('menu_manager')}</span>
                        </NavLink>
                    )}

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/qr/create"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <LayoutGrid size={20} />
                            <span className="font-medium">{t('menu_qr')}</span>
                        </NavLink>
                    )}

                    <NavLink
                        to="/restaurant/orders"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Receipt size={20} />
                        <span className="font-medium">{t('kitchen_orders')}</span>
                    </NavLink>

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/staff"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <User size={20} />
                            <span className="font-medium">{t('staff')}</span>
                        </NavLink>
                    )}

                    {(hasRole('RESTAURANT_OWNER') || hasRole('RESTAURANT_MODERATOR')) && (
                        <NavLink
                            to="/restaurant/settings"
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-orange-600/10 text-orange-400 border border-orange-600/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                            }
                        >
                            <Store size={20} />
                            <span className="font-medium">{t('settings')}</span>
                        </NavLink>
                    )}
                </div>
            </div>

            {/* User Footer */}
            <div className="p-4 border-t border-white/10 bg-white/5">
                <div className="flex items-center gap-3 px-2 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center border border-white/10">
                        <User size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.username || 'User'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {user?.email || 'user@example.com'}
                        </p>
                    </div>
                </div>
                <div className="mb-3">
                    <LanguageSwitcher />
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                >
                    <LogOut size={16} />
                    {t('sign_out')}
                </button>
            </div>
        </div>
    );
};

export default RestaurantSidebar;
