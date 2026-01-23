import React, { useState } from 'react';
import { FaSearch, FaBell, FaCog, FaUser, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { getCurrentUser, logout } from '../services/auth';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface TopBarProps {
    title?: string;
    isSidebarOpen?: boolean;
    setIsSidebarOpen?: (isOpen: boolean) => void;
}

const TopBar: React.FC<TopBarProps> = ({ title: propTitle }) => {
    const { t } = useTranslation('common');
    const user = getCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

    const getTitle = () => {
        if (propTitle) return propTitle;

        const path = location.pathname;
        if (path.startsWith('/qr/dashboard')) return 'QR Dashboard';
        if (path.startsWith('/qr/create')) return 'Create QR';
        if (path.startsWith('/qr/my-codes')) return 'My QR Codes';
        if (path.startsWith('/qr/history')) return 'Scan History';
        if (path.startsWith('/qr/analytics')) return path.split('/').length > 3 ? 'QR Analytics' : 'Global Analytics';
        if (path.startsWith('/qr/bulk')) return 'Bulk Create';
        if (path.startsWith('/qr/organization')) return 'Organization';
        if (path.startsWith('/qr/settings')) return 'Settings';
        if (path.startsWith('/qr/billing')) return 'Billing';

        if (path.startsWith('/admin')) return 'Admin Panel';
        if (path.startsWith('/restaurant')) return 'Restaurant Management';

        return 'Dashboard';
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="h-20 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10 transition-all">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
            </div>

            <div className="flex items-center gap-6">
                {/*
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-100 pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        */}

                <div className="flex items-center gap-4">
                    {/*
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
            <FaBell />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          */}

                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 pl-4 border-l hover:bg-gray-50 p-2 rounded-lg transition-colors"
                        >
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-gray-800">{user?.username || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.role || 'Member'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <FaChevronDown className="text-gray-400 text-xs" />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                <Link to="/qr/settings" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-purple-600">
                                    <FaUser className="text-sm" /> Profile & Settings
                                </Link>
                                <div className="border-t my-1"></div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                                >
                                    <FaSignOutAlt className="text-sm" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TopBar;
