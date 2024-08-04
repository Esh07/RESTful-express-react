// src/components/Layout.tsx
import React from 'react';
import type { ReactNode } from 'react';
import NavBar from './navbar/NavBar';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
    children: ReactNode;
  }


const Layout: React.FC<LayoutProps> = () => {
    return (
        <div>
            <NavBar />
            <main><Outlet /></main>
        </div>
    );
};

export default Layout;