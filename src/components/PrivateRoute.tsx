import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }: { children?: React.ReactNode }) => {
    const { isAuthenticated, isLoading } = useAuth();
    const [checkingProfile, setCheckingProfile] = useState(false);

    // Simple check to ensure profile exists for Owners
    useEffect(() => {
        const checkProfile = async () => {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const isOwner = user.role && user.role.includes('RESTAURANT_OWNER');

                // Only enforce for owners, and avoid loop if already on setup page
                if (isOwner && !window.location.pathname.includes('/setup')) {
                    try {
                        const token = localStorage.getItem('token');
                        const res = await fetch('http://localhost:8080/api/restaurant/profile/me', {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });

                        // If 404, it means no profile -> Redirect to setup
                        if (res.status === 404) {
                            window.location.href = '/restaurant/setup';
                        }
                    } catch (e) {
                        // Ignore error
                    }
                }
            }
        };
        checkProfile();
    }, [isAuthenticated]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen bg-black text-white">Loading...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoute;
