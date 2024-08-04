// src/App.tsx
import type React from 'react';
import {  Route, Routes, Navigate } from 'react-router-dom';
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useSelector } from 'react-redux';
import type { RootState } from './app/store';
import Layout from './components/Layout';
import About from './pages/About';
import Profile from './pages/Profile';
import Login from './pages/Login';
import RequireAuth from './features/auth/RequireAuth';
import Dashboard from './features/auth/Dashboard';

const PrivateRoute: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
        <Routes>
          <Route path="/" element={<Layout children />}>
            {/* Public routes */}
            <Route index element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
          </Route>

            {/* Private routes */}
            <Route element={<RequireAuth />} >
              <Route path="/home" element={<Dashboard />} />
            </Route>
        </Routes>
  );
};

export default App;