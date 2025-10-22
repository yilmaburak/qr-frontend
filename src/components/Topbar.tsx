import { useNavigate } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import { logout } from '../services/auth';
import Button from '../ui/Button';
import useAuth from '../hooks/useAuth';
import { useDispatch, useSelector } from 'react-redux';
import Breadcrumbs from '../ui/Breadcrumbs';
import { GoSidebarCollapse, GoSidebarExpand } from 'react-icons/go';
import { useEffect, useState } from 'react';

function TopBar() {
  const navigate = useNavigate();
  const { auth, setAuth }: any = useAuth();
  const {
    isSidebarOpen,
    title,
    subTitle
  } = useSelector((state: any) => state.general)
  const dispatch = useDispatch();

  const [breadcrumbsData, setBreadcrumbsData] = useState<Array<{ label: string; path: string }>>([]);

  const toggleSidebar = () => {
    dispatch({ type: 'general/toggleSidebar' });
  }

  const handleLogout = async () => {
    try {
      await logout();
      setAuth({});
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleChangeWidth = () => {
    const data = [{ label: title || 'Dashboard', path: '' }];
    if (subTitle && subTitle !== '' &&  window.innerWidth >= 768) {
      data.push({ label: subTitle, path: '' });
    }
    setBreadcrumbsData(data);
  }

  useEffect(() => {
    handleChangeWidth();
    window.addEventListener('resize', handleChangeWidth);
    return () => window.removeEventListener('resize', handleChangeWidth);
  }, [title, subTitle]);

  return (
    <div
      className={`${isSidebarOpen ? 'md:ml-64' : 'ml-16'
        } py-2 px-4 shadow flex justify-between items-center transition-all duration-300 border-b border-neutral-900`}
    >
      <div className="flex items-center divide-x-2 divide-gray-600 gap-2">
        <button
          onClick={toggleSidebar}
          className="text-[#EDEDED] focus:outline-none text-xl hover:text-gray-300 hover:bg-neutral-800 p-1 rounded-md transition cursor-default"
        >
          {isSidebarOpen ? (
            <GoSidebarExpand />
          ) : (
            <GoSidebarCollapse />
          )}
        </button>
        <div className=''>
          <Breadcrumbs
            data={breadcrumbsData}
            labelClassName="font-medium"
          />
        </div>
      </div>

      <Button
        variant="outlinedDark"
        onClick={handleLogout}
        size='small'
      >
        Logout
      </Button>
    </div>
  );
}

export default TopBar;
