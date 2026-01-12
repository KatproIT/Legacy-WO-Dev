// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FormPage } from './pages/FormPage';
import { AdminDashboard } from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import UserManagementPage from './pages/UserManagementPage';

function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem('token'));
}

function getUserRole(): string | null {
  return localStorage.getItem('userRole');
}

function PrivateRoute({
  children,
  superadminOnly = false
}: {
  children: JSX.Element;
  superadminOnly?: boolean;
}) {
  const isAuth = isAuthenticated();
  const location = window.location;

  if (!isAuth) {
    // Save the current path so we can redirect back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (superadminOnly) {
    const role = getUserRole();
    if (role !== 'superadmin') return <Navigate to="/admin" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Root redirect */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? <Navigate to="/admin" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Create new form */}
        <Route
          path="/form/new"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        {/* View existing form - NEW FINAL ROUTE */}
        <Route
          path="/form/:uniqueId/:jobNumber"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        {/* Superadmin-only user management page */}
        <Route
          path="/admin/users"
          element={
            <PrivateRoute superadminOnly={true}>
              <UserManagementPage />
            </PrivateRoute>
          }
        />

        {/* Fallback for any unknown route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
