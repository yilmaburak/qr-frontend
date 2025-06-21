import { Link } from 'react-router-dom';
import { useState } from 'react';

function Sidebar() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
    >
      <div className="flex items-center justify-between p-2">
        <span className="ml-2 font-bold">{isOpen ? 'QR GEN' : 'QR'}</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-gray-700 rounded"
        >
          {isOpen ? '<' : '>'}
        </button>
      </div>
      <nav className="flex flex-col space-y-2 mt-4">
        <Link to="/dashboard" className="p-2 hover:bg-gray-700 rounded mx-2">
          Dashboard
        </Link>
        <Link to="/dashboard/create" className="p-2 hover:bg-gray-700 rounded mx-2">
          Create QR
        </Link>
        <Link to="/dashboard/create-vcard" className="p-2 hover:bg-gray-700 rounded mx-2">
          Create vCard
        </Link>
      </nav>
    </div>
  );
}

export default Sidebar;
