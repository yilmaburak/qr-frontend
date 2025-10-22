import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/(public)/Login';
import Register from './pages/(public)/Register';
import Dashboard from './pages/(dashboard)/Dashboard';
import CreateQR from './pages/CreateQR';
import CreateVCard from './pages/CreateVCard';
import PublicQR from './pages/PublicQR';
import EditQR from './pages/EditQR';
import ForgotPasswordPage from './pages/(public)/ForgotPasswordPage';
import ResetPasswordPage from './pages/(public)/ResetPasswordPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PublicLayout from './pages/(public)/PublicLayout';
import Home from './pages/(public)/Home';
import DashboardLayout from './pages/(dashboard)/DashboardLayout';
import RequireAuth from './components/RequireAuth';
import { Role } from './Models/Auth';
import QrForm from './pages/(dashboard)/QrForm';

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
        <Route >
          <Route path="/dashboard" element={<DashboardLayout />} >
            <Route index element={<Dashboard />} />
            <Route path="create-vcard" element={<CreateVCard />} />
            <Route path="create" element={<QrForm />} />
            <Route path="edit/:id" element={<QrForm />} />
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
