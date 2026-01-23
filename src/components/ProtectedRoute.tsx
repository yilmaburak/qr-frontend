import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from '../services/auth';
import { toast } from 'react-toastify';

const ProtectedRoute: React.FC = () => {
    const user = getCurrentUser();
    const navigate = useNavigate();
    const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

    const performLogout = () => {
        logout();
        toast.info("Session expired due to inactivity.");
        navigate('/login');
    };

    const resetTimer = () => {
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
        logoutTimerRef.current = setTimeout(performLogout, TIMEOUT_MS);
    };

    const handleActivity = () => {
        // Throttle: Only update if 1 second has passed since last update
        // to prevent massive churn on mousemove.
        const now = Date.now();
        if (now - lastActivityRef.current > 1000) {
            lastActivityRef.current = now;
            resetTimer();
        }
    };

    useEffect(() => {
        if (!user) return; // Don't setup listeners if not logged in

        // Events to listen for activity
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        // Initialize timer
        resetTimer();

        // Attach listeners
        events.forEach(event => window.addEventListener(event, handleActivity));

        return () => {
            if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
            events.forEach(event => window.removeEventListener(event, handleActivity));
        };
    }, [user]);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
