import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/(public)/Login';
import Register from './pages/(public)/Register';
import Dashboard from './pages/Dashboard';
import CreateQR from './pages/CreateQR';
import CreateVCard from './pages/CreateVCard';
import PublicQR from './pages/PublicQR';
import EditQR from './pages/EditQR';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicLayout from './pages/(public)/PublicLayout';
import Home from './pages/(public)/Home';
import DashboardLayout from './pages/(dashboard)/DashboardLayout';
import RequireAuth from './components/RequireAuth';
import { Role } from './Models/Auth';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>
        <Route element={<RequireAuth allowedRoles={[Role.Admin, Role.User, Role.Vcard]} />}>
          <Route path="/dashboard" element={<DashboardLayout />} >
            <Route index element={<Dashboard />} />
            <Route path="create-vcard" element={<CreateVCard />} />
            <Route path="create" element={<CreateQR />} />
            <Route path="edit/:id" element={<EditQR />} />
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>
        <Route path="/public/qr/:publicId" element={<PublicQR />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </>
  );
}

export default App;
