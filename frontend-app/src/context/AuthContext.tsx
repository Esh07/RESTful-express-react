// src/context/AuthContext.tsx
import React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { AuthContextProps } from '../types';


const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Replace this with your actual authentication logic
        const checkAuth = async () => {
            // Example: Check HttpOnly cookie or state data
            const token = localStorage.getItem('authToken');
            setIsAuthenticated(!!token);
        };

        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};