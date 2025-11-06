import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { FormPage } from './pages/FormPage';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/form/new" element={<FormPage />} />
        <Route path="/form/:jobNumber" element={<FormPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
