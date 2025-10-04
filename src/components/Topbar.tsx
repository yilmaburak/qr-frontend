import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { logout } from '../services/auth';
import Button from '../ui/Button';
import useAuth from '../hooks/useAuth';

function TopBar({ isSidebarOpen, setIsSidebarOpen }: { isSidebarOpen: boolean; setIsSidebarOpen: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { auth, setAuth }: any = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      setAuth({});
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div
      className={`${isSidebarOpen ? 'ml-64' : 'ml-16'
        } bg-gray-100 p-4 shadow flex justify-between items-center transition-all duration-300`}
    >
      <div className="flex items-center space-x-2">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gray-200 rounded"
        >
          <FaBars />
        </button>
        <div className="text-lg font-bold">Dashboard</div>
      </div>

      <Button
        variant="danger"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
}

export default TopBar;
