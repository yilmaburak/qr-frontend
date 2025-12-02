import React from 'react';
import { FaSearch, FaBell, FaCog } from 'react-icons/fa';

const TopBar = ({ title = "Menu" }) => {
  return (
    <div className="h-20 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <span className="text-gray-400 text-sm">Dashboard / List Menu</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search anything"
            className="bg-gray-100 pl-10 pr-4 py-2 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
            <FaBell />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
            <FaCog />
          </button>

          <div className="flex items-center gap-3 pl-4 border-l">
            <div className="text-right hidden md:block">
              <p className="text-sm font-bold text-gray-800">Orlando Laurentius</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
