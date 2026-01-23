import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaListAlt, FaSignOutAlt, FaCog, FaHome, FaUtensils, FaHeartbeat } from 'react-icons/fa';
import { logout } from '../services/auth';
import { useTranslation } from 'react-i18next';

const AdminSidebar: React.FC = () => {
    const { t } = useTranslation('admin');
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-indigo-700 text-white' : 'text-indigo-100 hover:bg-indigo-700 hover:text-white';
    };

    const navItems = [
        { path: '/admin/dashboard', icon: FaTachometerAlt, label: t('sidebar.dashboard') },
        { path: '/admin/users', icon: FaUsers, label: t('sidebar.users') },
        { path: '/admin/restaurants', icon: FaUtensils, label: t('sidebar.restaurants') },
        { path: '/admin/audit-logs', icon: FaListAlt, label: t('sidebar.audit_logs') },
        { path: '/admin/system-health', icon: FaHeartbeat, label: t('sidebar.system_health') },
        { path: '/admin/settings', icon: FaCog, label: t('sidebar.settings') },
    ];

    return (
        <div className="w-64 bg-indigo-900 min-h-screen flex flex-col text-white shadow-xl">
            <div className="p-6 border-b border-indigo-800">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <FaCog className="animate-spin-slow" /> Admin Panel
                </h1>
                <p className="text-xs text-indigo-300 mt-1 uppercase tracking-wider">God Mode</p>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive(item.path)}`}
                    >
                        <item.icon className="text-xl" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-indigo-800 space-y-2">
                <a
                    href="http://localhost:5173/dashboard"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
                >
                    <FaHome /> Ana Sayfa (QR UI)
                </a>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-800 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition-colors duration-200 font-medium"
                >
                    <FaSignOutAlt /> Logout
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;
