import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Cards } from './pages/Cards';
import { Budgets } from './pages/Budgets';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { JoinWorkspace } from './pages/JoinWorkspace';
import { Receivables } from './pages/Receivables';
import { Categories } from './pages/Categories';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { InstallPrompt } from './components/InstallPrompt';

// Protected Route Component
const ProtectedRoute = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

function App() {
  return (
    <AuthProvider>
      <InstallPrompt />
      {/* AQUI ESTÁ A CORREÇÃO: basename="/Finapp" */}
      <BrowserRouter basename="/Finapp">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/join/:workspaceId" element={<JoinWorkspace />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="receivables" element={<Receivables />} />
              <Route path="cards" element={<Cards />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="categories" element={<Categories />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
