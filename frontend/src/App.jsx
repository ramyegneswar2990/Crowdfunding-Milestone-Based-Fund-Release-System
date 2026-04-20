import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/ProtectedRoute';
import RoleRoute        from './components/RoleRoute';
import MainLayout       from './layouts/MainLayout';

// ── Lazy page stubs (replace with real pages as you build them) ──────────────
// Auth
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Shared / role-gated
import DashboardPage      from './pages/DashboardPage';
import CampaignsPage      from './pages/CampaignsPage';
import CreateCampaignPage from './pages/CreateCampaignPage';
import MilestonesPage     from './pages/MilestonesPage';
import Pledges            from './pages/Pledges';
import Escrow             from './pages/Escrow';
import Transactions       from './pages/Transactions';

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            fontSize: '0.875rem',
          },
        }}
      />

      <Routes>
        {/* ── Public ──────────────────────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Protected (any authenticated user) ──────────────────── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout><DashboardPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/campaigns"
          element={
            <ProtectedRoute>
              <MainLayout><CampaignsPage /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ── CAMPAIGNER only ──────────────────────────────────────── */}
        <Route
          path="/create-campaign"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['CAMPAIGNER']}>
                <MainLayout><CreateCampaignPage /></MainLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/milestones"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['CAMPAIGNER', 'VERIFIER']}>
                <MainLayout><MilestonesPage /></MainLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ── BACKER only ──────────────────────────────────────────── */}
        <Route
          path="/pledges"
          element={
            <ProtectedRoute>
              <MainLayout><Pledges /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ── ADMIN only ───────────────────────────────────────────── */}
        <Route
          path="/escrow/:campaignId"
          element={
            <ProtectedRoute>
              <MainLayout><Escrow /></MainLayout>
            </ProtectedRoute>
          }
        />
        {/* Redirect bare /escrow to dashboard */}
        <Route path="/escrow" element={<Navigate to="/dashboard" replace />} />

        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <MainLayout><Transactions /></MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ── Fallbacks ────────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
