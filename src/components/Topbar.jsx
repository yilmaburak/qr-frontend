import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';

function TopBar({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div
      className={`${
        isSidebarOpen ? 'ml-64' : 'ml-16'
      } bg-gray-100 p-4 shadow flex justify-between items-center transition-all duration-300`}
    >
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gray-200 rounded md:hidden"
        >
          <FaBars />
        </button>
        <div className="text-lg font-bold">Dashboard</div>
      </div>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}

export default TopBar;
