// src/App.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import RequireAuth from './features/auth/RequireAuth';
import Dashboard from './features/auth/Dashboard';
import Register from './pages/Register';
import RedirectIfAuthenticated from './features/auth/RedirectIfAuthenticated';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout children />}>
        {/* Public routes */}
        <Route element={<RedirectIfAuthenticated />}>
          <Route index element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Private routes */}
        <Route element={<RequireAuth />}>
          <Route path="/home" element={<Dashboard />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
