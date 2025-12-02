import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaQrcode, FaPlus, FaIdCard, FaUtensils, FaSignOutAlt
} from 'react-icons/fa';

const Sidebar = () => {
  const location = useLocation();

  const menuGroups = [
    {
      title: 'QR Modülü',
      items: [
        { path: '/dashboard', icon: <FaQrcode />, label: 'QR Kodlarım', exact: true },
        { path: '/dashboard/create', icon: <FaPlus />, label: 'QR Oluştur' },
        { path: '/dashboard/create-vcard', icon: <FaIdCard />, label: 'vCard Oluştur' },
      ]
    },
    {
      title: 'Restoran Modülü',
      items: [
        { path: '/dashboard/menu', icon: <FaUtensils />, label: 'Menülerim' },
        // 'Men' from user request is ambiguous, assuming it might be related to orders or just a typo. 
        // Leaving it out for now to strictly follow the clear parts of the request.
      ]
    }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="w-64 bg-white h-screen fixed left-0 top-0 border-r flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
          R
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Reztro</h1>
      </div>

      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive(item.path, item.exact)
                      ? 'bg-orange-50 text-orange-500 font-semibold'
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
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
