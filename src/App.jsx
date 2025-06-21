import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateQR from './pages/CreateQR';
import CreateVCard from './pages/CreateVCard';
import PublicQR from './pages/PublicQR';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/dashboard/create" element={token ? <CreateQR /> : <Navigate to="/login" />} />
        <Route path="/dashboard/create-vcard" element={token ? <CreateVCard /> : <Navigate to="/login" />} />
        <Route path="/public/qr/:publicId" element={<PublicQR />} />
        <Route path="*" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
