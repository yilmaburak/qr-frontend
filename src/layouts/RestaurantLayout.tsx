import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

import { BranchProvider } from '../contexts/BranchContext';
import BranchSwitcher from '../components/restaurant/BranchSwitcher';
import { Bell, Search } from 'lucide-react';

const RestaurantLayout = () => {
    return (
        <BranchProvider>
            <div className="flex min-h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 ml-64 flex flex-col">
                    {/* Top Header */}
                    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
                        <div className="flex items-center gap-4">
                            <BranchSwitcher />
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
                                <Search size={20} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors relative">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1 overflow-y-auto">
                        <Outlet />
                    </div>
                </div>
            </div>
        </BranchProvider>
    );
};

export default RestaurantLayout;
