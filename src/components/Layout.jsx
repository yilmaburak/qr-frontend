import React from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const Layout = ({ children, title }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1 ml-64">
                <TopBar title={title} />
                <main className="p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
