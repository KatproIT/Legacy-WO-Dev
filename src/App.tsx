import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { FormPage } from './pages/FormPage';
import { AdminDashboard } from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import UserManagementPage from './pages/UserManagementPage';

function isAuthenticated(): boolean {
  const token = localStorage.getItem('token');
  return !!token;
}

/* -------------------------
   PRIVATE ROUTE (keeps original URL)
-------------------------- */
function PrivateRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
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

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Default root → redirect to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin dashboard */}
        <Route 
          path="/admin"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* New form */}
        <Route 
          path="/form/new"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        {/* Existing form */}
        <Route 
          path="/form/:jobNumber"
          element={
            <PrivateRoute>
              <FormPage />
            </PrivateRoute>
          }
        />

        {/* Superadmin-only page */}
        <Route 
          path="/admin/users"
          element={
            <PrivateRoute>
              <UserManagementPage />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
