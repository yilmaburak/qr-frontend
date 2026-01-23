import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ModuleProvider } from './contexts/ModuleContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import QRLogin from './pages/QRLogin';
import RestaurantLogin from './pages/RestaurantLogin';
import AccessLogin from './pages/AccessLogin';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import ModulesDashboard from './pages/ModulesDashboard';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

// Layouts
import QRGeneratorLayout from './layouts/QRGeneratorLayout';
import RestaurantLayout from './layouts/RestaurantLayout';
import AccessControlLayout from './layouts/AccessControlLayout';

// QR Generator Pages
import Dashboard from './pages/Dashboard';
import CreateQR from './pages/CreateQR';

import History from './pages/History';
import EditQR from './pages/EditQR';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import GlobalAnalytics from './pages/qr/GlobalAnalytics';
import BulkCreateQR from './pages/BulkCreateQR';
import BulkTranslation from './pages/BulkTranslation';
import CreateVCard from './pages/CreateVCard';
import OrganizationDashboard from './pages/OrganizationDashboard';
import BillingSettings from './pages/BillingSettings';

// Restaurant Pages
import MenuManagement from './pages/restaurant/MenuManagement';
import RestaurantAnalytics from './pages/RestaurantAnalytics';
import RestaurantSetupWizard from './pages/RestaurantSetupWizard';
import KitchenDisplay from './pages/KitchenDisplay';
import FeedbackList from './pages/FeedbackList';
import InventoryDashboard from './pages/InventoryDashboard';
import RecipeBuilder from './pages/RecipeBuilder';
import ReservationDashboard from './pages/ReservationDashboard';
import PublicReservationForm from './pages/PublicReservationForm';
import RestaurantOrders from './pages/RestaurantOrders';
import StaffManagement from './pages/StaffManagement';
import PublicMenu from './pages/PublicMenu';
import BranchManagement from './pages/BranchManagement';
import RestaurantTables from './pages/RestaurantTables';
import WaiterOrder from './pages/WaiterOrder';
import PaymentSettings from './pages/restaurant/PaymentSettings';
import RestaurantSettings from './pages/restaurant/RestaurantSettings';


// Public Pages
import LandingPage from './pages/LandingPage';
import PublicQR from './pages/PublicQR';
import UnlockQR from './pages/UnlockQR';
import Pricing from './pages/Pricing';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import Settings from './pages/Settings';

// Admin Pages
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import AdminEditUser from './pages/admin/AdminEditUser';
import Restaurants from './pages/admin/Restaurants';
import AdminEditRestaurant from './pages/admin/AdminEditRestaurant';
import ActivityLogs from './pages/admin/ActivityLogs';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSystemHealth from './pages/admin/AdminSystemHealth';
import SystemSettings from './pages/admin/SystemSettings';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  useEffect(() => {
    const handlePopState = () => {
      window.location.reload();
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ModuleProvider>
          <GoogleReCaptchaProvider reCaptchaKey="6LdVnBQqAAAAAF91f_Gq5X0W0P0_L0_000000000">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Navigate to="/qr/login" replace />} />
              <Route path="/qr/login" element={<QRLogin />} />
              <Route path="/restaurant/login" element={<RestaurantLogin />} />
              <Route path="/access/login" element={<AccessLogin />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/subscription/success" element={<SubscriptionSuccess />} />

              {/* Public Access Endpoints */}
              <Route path="/qr/:id" element={<PublicQR />} />
              <Route path="/reservations/book" element={<PublicReservationForm />} />
              <Route path="/unlock/:publicId" element={<UnlockQR />} />
              <Route path="/menu/:restaurantId/table/:tableNumber" element={<PublicMenu />} />
              <Route path="/menu/branch/:branchId/table/:tableNumber" element={<PublicMenu />} />
              <Route path="/menu/view/:menuUid" element={<PublicMenu />} />
              <Route path="/restaurant/:tableId/menu" element={<PublicMenu />} />

              {/* Protected Routes */}
              <Route element={<PrivateRoute />}>
                {/* Module Selection Dashboard */}
                <Route path="/modules" element={<ModulesDashboard />} />

                {/* QR Generator Module */}
                <Route path="/qr" element={<QRGeneratorLayout />}>
                  <Route index element={<Navigate to="/qr/dashboard" replace />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="create" element={<CreateQR enableMenuModule={false} />} />

                  <Route path="history" element={<History />} />
                  <Route path="edit/:id" element={<EditQR />} />
                  <Route path="bulk-translate" element={<BulkTranslation />} />
                  <Route path="analytics/:id" element={<AnalyticsDashboard />} />
                  <Route path="analytics" element={<GlobalAnalytics />} />
                  <Route path="bulk" element={<BulkCreateQR />} />
                  <Route path="create-vcard" element={<CreateVCard />} />
                  <Route path="organization" element={<OrganizationDashboard />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="billing" element={<BillingSettings />} />
                  <Route path="pricing" element={<Pricing />} />
                </Route>

                {/* Restaurant Module - Protected */}
                <Route path="/restaurant/setup" element={
                  <PrivateRoute>
                    <RestaurantSetupWizard />
                  </PrivateRoute>
                } />

                {/* Restaurant Module */}
                <Route path="/restaurant" element={<RestaurantLayout />}>
                  <Route index element={<Navigate to="/restaurant/orders" replace />} />
                  <Route path="qr/create" element={<CreateQR enableMenuModule={true} />} />
                  <Route path="menu" element={<MenuManagement />} />
                  <Route path="tables" element={<RestaurantTables />} />
                  <Route path="branches" element={<BranchManagement />} />
                  <Route path="analytics" element={<RestaurantAnalytics />} />
                  <Route path="kitchen" element={<KitchenDisplay />} />
                  <Route path="inventory" element={<InventoryDashboard />} />
                  <Route path="recipes" element={<RecipeBuilder />} />
                  <Route path="feedback" element={<FeedbackList />} />
                  <Route path="reservations" element={<ReservationDashboard />} />
                  <Route path="orders" element={<RestaurantOrders />} />
                  <Route path="waiter" element={<WaiterOrder />} />
                  <Route path="staff" element={<StaffManagement />} />
                  <Route path="payments" element={<PaymentSettings />} />
                  <Route path="settings" element={<RestaurantSettings />} />
                </Route>

                {/* Access Control Module */}
                <Route path="/access" element={<AccessControlLayout />}>
                  <Route index element={<Navigate to="/access/dashboard" replace />} />
                  <Route path="dashboard" element={<div className="text-white p-8">Access Dashboard (Coming Soon)</div>} />
                  <Route path="passes" element={<div className="text-white p-8">Manage Passes (Coming Soon)</div>} />
                  <Route path="logs" element={<div className="text-white p-8">Access Logs (Coming Soon)</div>} />
                </Route>

                {/* Legacy Redirects - For backward compatibility */}
                <Route path="/dashboard/*" element={<Navigate to="/qr/dashboard" replace />} />
                <Route path="/create" element={<Navigate to="/qr/create" replace />} />

                <Route path="/history" element={<Navigate to="/qr/history" replace />} />
                <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

                {/* Admin Routes (Keep as is just in case, but usually accessible via direct link) */}
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                  <Route path="/admin/users/:id" element={<AdminEditUser />} />
                  <Route path="/admin/restaurants" element={<Restaurants />} />
                  <Route path="/admin/restaurants/:id" element={<AdminEditRestaurant />} />
                  <Route path="/admin/activity" element={<ActivityLogs />} />
                  <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
                  <Route path="/admin/system-health" element={<AdminSystemHealth />} />
                  <Route path="/admin/settings" element={<SystemSettings />} />
                </Route>

              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
          </GoogleReCaptchaProvider>
        </ModuleProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
