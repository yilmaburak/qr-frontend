import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './Topbar';

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <TopBar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <main
        className={`${
          isSidebarOpen ? 'ml-64' : 'ml-16'
        } p-4 transition-all duration-300`}
      >
        {children}
      </main>
    </>
  );
}

export default DashboardLayout;
