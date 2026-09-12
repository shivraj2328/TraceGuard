import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Welcome from "./pages/Welcome";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function WelcomePage({ user, onDemoLogin }) {
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Welcome
      onGetStarted={() => navigate("/login")}
      onGetDemo={() => {
        onDemoLogin();
        navigate("/");
      }}
    />
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      const activeUser = localStorage.getItem("traceguard_active_user");

      if (!activeUser) {
        setLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(activeUser);

        if (!parsedUser?.token || parsedUser.token.startsWith("mock-")) {
          setUser(parsedUser);
          setLoading(false);
          return;
        }

        // Validate backend JWT session
        const res = await fetch("http://localhost:5000/api/v1/auth/me", {
          headers: {
            Authorization: `Bearer ${parsedUser.token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser({ ...parsedUser, email: data.user.email });
        } else {
          // Token expired or invalid
          localStorage.removeItem("traceguard_active_user");
          setUser(null);
        }
      } catch (err) {
        console.error("Session validation failed:", err);
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("traceguard_active_user");
    setUser(null);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: "Alex Mercer",
      email: "developer@traceguard.com",
      role: "DevOps Engineer",
      token: "mock-demo-token",
    };
    localStorage.setItem("traceguard_active_user", JSON.stringify(demoUser));
    setUser(demoUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-xs font-mono text-slate-400">
        Authenticating TraceGuard session...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/welcome"
          element={<WelcomePage user={user} onDemoLogin={handleDemoLogin} />}
        />

        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Auth onLoginSuccess={(userData) => setUser(userData)} />
            )
          }
        />

        <Route element={<ProtectedRoute user={user} />}>
          <Route element={<MainLayout user={user} onLogout={handleLogout} />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Route>

        <Route
          path="*"
          element={<Navigate to={user ? "/" : "/welcome"} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}
