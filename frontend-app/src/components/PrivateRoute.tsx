// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
    children: React.ReactNode;
}

const isAuthenticated = () => {
    // Replace this with your actual authentication logic
    return !!localStorage.getItem('authToken');
};

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    return isAuthenticated() ? <>{children}</> : <Navigate to="/login" />;
};

export default PrivateRoute;