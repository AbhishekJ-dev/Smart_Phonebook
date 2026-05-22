import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Contexts / Providers
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ContactsProvider } from './context/ContactsContext.jsx';

// Layout Components
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import { Loader } from './components/Loader.jsx';

// Pages
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Favorites from './pages/Favorites.jsx';
import Profile from './pages/Profile.jsx';
import Settings from './pages/Settings.jsx';
import NotFound from './pages/NotFound.jsx';

/* ─── Protected Route Wrapper ─────────────────────────────────────────────── */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

/* ─── Public Route (redirect authenticated users away) ────────────────────── */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

/* ─── App Shell (layout with Navbar + Sidebar) ────────────────────────────── */
const AppShell = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        {isAuthenticated && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

/* ─── Root App with all providers ─────────────────────────────────────────── */
function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <ContactsProvider>

            {/* Global Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  borderRadius: '12px',
                  fontFamily: 'Outfit, Inter, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: '600',
                  padding: '12px 16px',
                  maxWidth: '380px',
                },
                success: {
                  style: {
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  },
                  iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
                },
                error: {
                  style: {
                    background: '#fef2f2',
                    color: '#dc2626',
                    border: '1px solid #fecaca',
                  },
                  iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
                },
              }}
            />

            <Routes>
              {/* Public Landing */}
              <Route
                path="/"
                element={
                  <AppShell>
                    <Landing />
                  </AppShell>
                }
              />

              {/* Auth Routes (redirect if already logged in) */}
              <Route
                path="/login"
                element={
                  <AppShell>
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  </AppShell>
                }
              />
              <Route
                path="/register"
                element={
                  <AppShell>
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  </AppShell>
                }
              />

              {/* Protected App Routes */}
              <Route
                path="/dashboard"
                element={
                  <AppShell>
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  </AppShell>
                }
              />
              <Route
                path="/favorites"
                element={
                  <AppShell>
                    <ProtectedRoute>
                      <Favorites />
                    </ProtectedRoute>
                  </AppShell>
                }
              />
              <Route
                path="/profile"
                element={
                  <AppShell>
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  </AppShell>
                }
              />
              <Route
                path="/settings"
                element={
                  <AppShell>
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  </AppShell>
                }
              />

              {/* 404 Catch-all */}
              <Route
                path="*"
                element={
                  <AppShell>
                    <NotFound />
                  </AppShell>
                }
              />
            </Routes>

          </ContactsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
