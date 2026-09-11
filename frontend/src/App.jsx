import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Helper component to handle navigation callbacks inside the Welcome page
function WelcomePage({ user, onDemoLogin }) {
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Welcome
      onGetStarted={() => navigate('/login')}
      onGetDemo={() => {
        onDemoLogin();
        navigate('/');
      }}
    />
  );
}

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

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Alex Mercer',
      email: 'developer@traceguard.com',
      role: 'DevOps Engineer',
      token: 'mock-demo-token'
    };
    localStorage.setItem('traceguard_active_user', JSON.stringify(demoUser));
    setUser(demoUser);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Welcome Page (Default initial landing view) */}
        <Route
          path="/welcome"
          element={<WelcomePage user={user} onDemoLogin={handleDemoLogin} />}
        />

        {/* Authentication Route */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Auth onLoginSuccess={(userData) => setUser(userData)} />
          }
        />

        {/* Protected Dashboard Routes */}
        <Route element={<ProtectedRoute user={user} />}>
          <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to={user ? "/" : "/welcome"} replace />} />
      </Routes>
    </BrowserRouter>
  );
}