import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FormPage } from './pages/FormPage';
import { AdminDashboard } from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import UserManagementPage from './pages/UserManagementPage';

// Check if user has a JWT token
function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}

function getUserRole(): string | null {
  return localStorage.getItem('userRole');
}

// Wrapper for protected routes; supports optional superadminOnly flag
function PrivateRoute({ children, superadminOnly = false }: { children: JSX.Element; superadminOnly?: boolean }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  if (superadminOnly) {
    const role = getUserRole();
    if (role !== 'superadmin') return <Navigate to="/admin" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/admin" replace />} />

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/form/new"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/form/:jobNumber"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        {/* Superadmin-only user management */}
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

export default App;
