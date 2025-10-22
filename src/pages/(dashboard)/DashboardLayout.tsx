import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../../components/Sidebar'
import TopBar from '../../components/Topbar'
import { useDispatch, useSelector } from 'react-redux'

const DashboardLayout = () => {
    const isSidebarOpen = useSelector((state: any) => state.general.isSidebarOpen)
    const dispatch = useDispatch()

    useEffect(() => {
        if (window.innerWidth > 768) {
            dispatch({ type: 'general/toggleSidebar' })
        }
    }, [dispatch])

    return (
        <div className="min-h-dvh flex flex-col bg-[#0A0A0A] text-white">
            <Sidebar />
            <TopBar />
            <main
                className={`
                    p-4 transition-all duration-300 flex-grow ml-16
                    ${isSidebarOpen ? 'md:ml-64' : ''}
                `}
            >
                <Outlet />
            </main>
        </div>
    )
}


export default DashboardLayout