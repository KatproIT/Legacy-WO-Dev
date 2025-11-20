import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FormPage } from './pages/FormPage';
import { AdminDashboard } from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import UserManagementPage from './pages/UserManagementPage';

function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}

function getUserRole(): string | null {
  return localStorage.getItem('userRole');
}

/* -------------------------
   PRIVATE ROUTE COMPONENT
-------------------------- */
function PrivateRoute({
  children,
  superadminOnly = false
}: {
  children: JSX.Element;
  superadminOnly?: boolean;
}) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  if (superadminOnly) {
    const role = getUserRole();
    if (role !== 'superadmin') return <Navigate to="/admin" replace />;
  }

  return children;
}

/* -------------------------
          APP ROUTES
-------------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ROLE-BASED ROOT REDIRECT */}
        <Route
          path="/"
          element={
            isAuthenticated()
              ? (
                  getUserRole() === "superadmin" ||
                  getUserRole() === "admin" ||
                  getUserRole() === "pm"
                )
                ? <Navigate to="/admin" replace />
                : <Navigate to="/form/new" replace />
              : <Navigate to="/login" replace />
          }
        />

        {/* Admin Dashboard (admin + pm + superadmin) */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* New Form */}
        <Route
          path="/form/new"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        {/* Existing Form */}
        <Route
          path="/form/:jobNumber"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        {/* Superadmin Only */}
        <Route
          path="/admin/users"
          element={
            <PrivateRoute superadminOnly={true}>
              <UserManagementPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
