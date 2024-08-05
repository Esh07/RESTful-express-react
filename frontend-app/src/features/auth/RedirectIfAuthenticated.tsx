// src/features/auth/RedirectIfAuthenticated.tsx
import React from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./authSlice";

const RedirectIfAuthenticated: React.FC = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const location = useLocation();

    const content = isAuthenticated ? <Navigate to="/home" state={{ from: location.pathname }} replace /> : <Outlet />;

    return (
        <div>
            {content}
        </div>
    );
}

export default RedirectIfAuthenticated;
