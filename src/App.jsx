import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQR from './pages/CreateQR';
import CreateVCard from './pages/CreateVCard';
import PublicQR from './pages/PublicQR';
import EditQR from './pages/EditQR';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';

function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h2>QR App</h2>
      <p>Hoş geldin!</p>
      <p>
        <a href="/forgot-password">Şifremi Unuttum</a> · <a href="/reset-password">Reset Password</a>
      </p>
    </div>
  );
}


function App() {
  const token = localStorage.getItem('token');
  useEffect(() => {
    toast.info('Toast test mesajı (uygulama ilk açıldığında)');
  }, [])

  return (
     <>    
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard/create" element={token ? <CreateQR /> : <Navigate to="/login" />} />
        <Route path="/dashboard/create-vcard" element={token ? <CreateVCard /> : <Navigate to="/login" />} />
        <Route path="/public/qr/:publicId" element={<PublicQR />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        <Route path="/dashboard/edit/:id" element={<EditQR />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
    </Router>   
     </>
  );
}

export default App;
