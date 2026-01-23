import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/Topbar';

const QRGeneratorLayout = () => {
    return (
        <div className="flex min-h-screen !bg-gray-50 text-slate-900"> {/* Force light background */}
            <Sidebar />
            <div className="flex-1 ml-64">
                <TopBar />
                <div className="p-8">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default QRGeneratorLayout;
