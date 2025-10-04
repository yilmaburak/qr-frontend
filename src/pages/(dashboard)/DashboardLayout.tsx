import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/Topbar'

const DashboardLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className='min-h-dvh'>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <main
                className={`${isSidebarOpen ? 'ml-64' : 'ml-16'
                    } p-4 transition-all duration-300`}
            >
                <Outlet />
            </main>
        </div>
    )
}

export default DashboardLayout