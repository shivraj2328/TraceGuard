import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const activeUser = localStorage.getItem('traceguard_active_user');
    if (activeUser) {
      setUser(JSON.parse(activeUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('traceguard_active_user');
    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Auth onLoginSuccess={(userData) => setUser(userData)} />
          }
        />

        <Route element={<ProtectedRoute user={user} />}>
          <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}