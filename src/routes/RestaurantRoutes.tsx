import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RestaurantDashboard from './pages/restaurant/RestaurantDashboard';
import MenuManagement from './pages/restaurant/MenuManagement';
import OrderManagement from './pages/restaurant/OrderManagement';
import TableManagement from './pages/restaurant/TableManagement';
import POSSettings from './pages/restaurant/POSSettings';
import RestaurantSettings from './pages/restaurant/RestaurantSettings';

const RestaurantRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<RestaurantDashboard />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/orders" element={<OrderManagement />} />
            <Route path="/tables" element={<TableManagement />} />
            <Route path="/pos-settings" element={<POSSettings />} />
            <Route path="/settings" element={<RestaurantSettings />} />
            <Route path="*" element={<Navigate to="/restaurant" replace />} />
        </Routes>
    );
};

export default RestaurantRoutes;
