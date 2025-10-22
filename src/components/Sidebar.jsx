import { Link } from 'react-router-dom';
import { FaHome, FaQrcode, FaAddressCard } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { GoSidebarExpand } from 'react-icons/go';

function Sidebar() {
  const isSidebarOpen = useSelector((state) => state.general.isSidebarOpen)
   const dispatch = useDispatch();
  
    const toggleSidebar = () => {
      dispatch({ type: 'general/toggleSidebar' });
    }

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-[#171717] text-white transition-all duration-300 z-30 border-r border-neutral-800 ${isSidebarOpen ? 'w-full md:w-64' : 'w-16'}`}
    >
      <div className="relative flex items-center justify-center space-x-2 h-[72px]">
        <FaQrcode />
        {isSidebarOpen && (<span className="font-bold">QR GEN</span>)}
        {isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="text-[#EDEDED] focus:outline-none text-xl hover:text-gray-300 hover:bg-neutral-800 p-1 rounded-md transition cursor-default absolute right-2 md:hidden"
          >
            <GoSidebarExpand />
          </button>
        )}
      </div>

      <nav className="flex flex-col space-y-2 mt-4 md:items-start items-center">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 p-2 hover:bg-[#262626] rounded mx-2"
        >
          <FaHome />
          {isSidebarOpen && <span>Dashboard</span>}
        </Link>
        <Link
          to="/dashboard/create"
          className="flex items-center space-x-2 p-2 hover:bg-[#262626] rounded mx-2"
        >
          <FaQrcode />
          {isSidebarOpen && <span>Create QR</span>}
        </Link>
        <Link
          to="/dashboard/create-vcard"
          className="flex items-center space-x-2 p-2 hover:bg-[#262626] rounded mx-2"
        >
          <FaAddressCard />
          {isSidebarOpen && <span>Create vCard</span>}
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
