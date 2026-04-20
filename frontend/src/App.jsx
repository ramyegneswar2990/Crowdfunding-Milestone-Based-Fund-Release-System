import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider }  from './context/AuthContext';
import ProtectedRoute    from './components/ProtectedRoute';
import RoleRoute         from './components/RoleRoute';
import MainLayout        from './layouts/MainLayout';

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// ── Shared (any authenticated role) ──────────────────────────────────────────
import DashboardPage from './pages/DashboardPage';
import Campaigns     from './pages/Campaigns';
import CampaignDetail from './pages/CampaignDetail';

// ── CAMPAIGNER ────────────────────────────────────────────────────────────────
import CreateCampaign from './pages/CreateCampaign';
import Milestones     from './pages/Milestones';

// ── BACKER ────────────────────────────────────────────────────────────────────
import Pledges from './pages/Pledges';

// ── ADMIN ─────────────────────────────────────────────────────────────────────
import Escrow       from './pages/Escrow';
import Transactions from './pages/Transactions';

// ─────────────────────────────────────────────────────────────────────────────
// Helper: wraps a page in ProtectedRoute + MainLayout
const Protected = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

// Helper: wraps a page in ProtectedRoute + RoleRoute + MainLayout
const RoleProtected = ({ roles, children }) => (
  <ProtectedRoute>
    <RoleRoute roles={roles}>
      <MainLayout>{children}</MainLayout>
    </RoleRoute>
  </ProtectedRoute>
);
// ─────────────────────────────────────────────────────────────────────────────

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
        {/* ── Public ──────────────────────────────────────────────────── */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Any authenticated user ───────────────────────────────────── */}
        <Route path="/dashboard"
          element={<Protected><DashboardPage /></Protected>}
        />
        <Route path="/campaigns"
          element={<Protected><Campaigns /></Protected>}
        />
        <Route path="/campaigns/:id"
          element={<Protected><CampaignDetail /></Protected>}
        />

        {/* ── CAMPAIGNER only ──────────────────────────────────────────── */}
        <Route path="/create-campaign"
          element={
            <RoleProtected roles={['CAMPAIGNER']}>
              <CreateCampaign />
            </RoleProtected>
          }
        />
        <Route path="/milestones"
          element={
            <RoleProtected roles={['CAMPAIGNER', 'VERIFIER']}>
              <Milestones />
            </RoleProtected>
          }
        />

        {/* ── BACKER only ──────────────────────────────────────────────── */}
        <Route path="/pledges"
          element={
            <RoleProtected roles={['BACKER']}>
              <Pledges />
            </RoleProtected>
          }
        />

        {/* ── ADMIN only ───────────────────────────────────────────────── */}
        <Route path="/escrow/:campaignId"
          element={
            <RoleProtected roles={['ADMIN']}>
              <Escrow />
            </RoleProtected>
          }
        />
        {/* Bare /escrow → redirect ADMIN to pick a campaign first */}
        <Route path="/escrow" element={<Navigate to="/campaigns" replace />} />

        <Route path="/transactions"
          element={
            <RoleProtected roles={['ADMIN']}>
              <Transactions />
            </RoleProtected>
          }
        />

        {/* ── Fallbacks ─────────────────────────────────────────────────── */}
        <Route path="/"  element={<Navigate to="/dashboard" replace />} />
        <Route path="*"  element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
