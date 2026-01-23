import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminLayout: React.FC = () => {
    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            <AdminSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 px-8 flex justify-between items-center h-16">
                    <h2 className="text-xl font-bold text-gray-800">Administration</h2>
                    <div className="text-sm text-gray-500">
                        Welcome, Super Admin
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-8">
                    <div className="container mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
