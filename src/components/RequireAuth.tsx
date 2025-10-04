import { useLocation, Navigate, Outlet } from "react-router-dom";
import { Role } from "../Models/Auth";
import { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedRoles, fallbackUrl }: { allowedRoles: Role[], fallbackUrl?: string }) => {
    const { auth }: any = useAuth()
    const location = useLocation();

    const hasRole = auth?.roles?.some((role: Role) => allowedRoles.includes(role));

    if (hasRole) {
        console.log('hasRole: ', hasRole);
        return <Outlet />;
    }

    if (auth?.user) {
        console.log('auth?.user: ', auth?.user);
        return <Navigate to={fallbackUrl ?? '/'} state={{ from: location }} replace />;
    }

    return <Navigate to="/login" state={{ from: location }} replace />;
};


export default RequireAuth;