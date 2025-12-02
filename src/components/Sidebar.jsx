import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaThLarge, FaClipboardList, FaCommentAlt, FaCalendarAlt,
  FaBookOpen, FaBox, FaStar, FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', icon: <FaThLarge />, label: 'Dashboard' },
    { path: '/dashboard/orders', icon: <FaClipboardList />, label: 'Orders' },
    { path: '/dashboard/messages', icon: <FaCommentAlt />, label: 'Messages', badge: 3 },
    { path: '/dashboard/calendar', icon: <FaCalendarAlt />, label: 'Calendar' },
    { path: '/dashboard/menu', icon: <FaBookOpen />, label: 'Menu' },
    { path: '/dashboard/inventory', icon: <FaBox />, label: 'Inventory' },
    { path: '/dashboard/reviews', icon: <FaStar />, label: 'Reviews' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
          R
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Reztro</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${isActive(item.path)
                ? 'bg-orange-50 text-orange-500 font-semibold'
                : 'text-gray-500 hover:bg-gray-50'
              }`}
          >
            <div className="flex items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>
            {item.badge && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="bg-orange-50 p-4 rounded-xl mb-4">
          <p className="text-sm text-gray-600 mb-2">Streamline restaurant management with real-time insights.</p>
          <button className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-orange-600">
            Upgrade Now
          </button>
        </div>
        <p className="text-xs text-center text-gray-400">Copyright © 2025 Peterdraw</p>
      </div>
    </div>
  );
};

export default Sidebar;
