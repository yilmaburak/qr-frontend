import Sidebar from './Sidebar';
import TopBar from './TopBar';

function DashboardLayout({ children }) {
  return (
    <>
      <Sidebar />
      <TopBar />
      <main className="ml-64 p-4">
        {children}
      </main>
    </>
  );
}

export default DashboardLayout;
