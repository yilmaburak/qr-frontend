import { useNavigate } from 'react-router-dom';

function TopBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="ml-64 bg-gray-100 p-4 shadow flex justify-end">
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
