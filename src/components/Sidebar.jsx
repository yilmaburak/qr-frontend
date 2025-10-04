import { Link } from 'react-router-dom';
import { FaHome, FaQrcode, FaAddressCard } from 'react-icons/fa';

function Sidebar({ isOpen, setIsOpen }) {
  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 z-30 ${isOpen ? 'w-64' : 'w-16'
        }`}
    >
      <div className="flex items-center justify-center space-x-2 h-[72px]">
        <FaQrcode />
        {isOpen && <span className="font-bold">QR GEN</span>}
      </div>

      <nav className="flex flex-col space-y-2 mt-4">
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded mx-2"
        >
          <FaHome />
          {isOpen && <span>Dashboard</span>}
        </Link>
        <Link
          to="/dashboard/create"
          className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded mx-2"
        >
          <FaQrcode />
          {isOpen && <span>Create QR</span>}
        </Link>
        <Link
          to="/dashboard/create-vcard"
          className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded mx-2"
        >
          <FaAddressCard />
          {isOpen && <span>Create vCard</span>}
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
