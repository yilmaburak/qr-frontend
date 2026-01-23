import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LogOut,
    User,
    ShieldCheck,
    Key,
    Lock,
    History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ModuleSwitcher from './ModuleSwitcher';
import { useTranslation } from 'react-i18next';

const AccessControlSidebar = () => {
    const { t } = useTranslation('common');
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-screen w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col fixed left-0 top-0 z-50">
            {/* Header */}
            <div className="p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ShieldCheck className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            Access Pass
                        </h1>
                        <p className="text-xs text-purple-400 font-medium">Security Module</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-6">
                <ModuleSwitcher condensed />

                {/* Access Control Module */}
                <div className="space-y-1">
                    <div className="px-3 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Access Control
                    </div>

                    <NavLink
                        to="/access/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <ShieldCheck size={20} />
                        <span className="font-medium">Overview</span>
                    </NavLink>

                    <NavLink
                        to="/access/passes"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <Key size={20} />
                        <span className="font-medium">Manage Passes</span>
                    </NavLink>

                    <NavLink
                        to="/access/logs"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`
                        }
                    >
                        <History size={20} />
                        <span className="font-medium">Access Logs</span>
                    </NavLink>
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
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </div>
    );
};

export default AccessControlSidebar;
