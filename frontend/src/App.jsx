import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import Landing from "./pages/Landing";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import CreateCampaign from "./pages/CreateCampaign";
import Milestones from "./pages/Milestones";
import Pledges from "./pages/Pledges";
import Escrow from "./pages/Escrow";
import Transactions from "./pages/Transactions";

const Protected = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>{children}</MainLayout>
  </ProtectedRoute>
);

const RoleProtected = ({ roles, children }) => (
  <ProtectedRoute>
    <RoleRoute roles={roles}>
      <MainLayout>{children}</MainLayout>
    </RoleRoute>
  </ProtectedRoute>
);

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
          <Route path="/campaigns" element={<Protected><Campaigns /></Protected>} />
          <Route path="/campaigns/:id" element={<Protected><CampaignDetail /></Protected>} />

          <Route path="/create-campaign" element={<RoleProtected roles={["CAMPAIGNER"]}><CreateCampaign /></RoleProtected>} />
          <Route path="/milestones" element={<RoleProtected roles={["CAMPAIGNER", "VERIFIER"]}><Milestones /></RoleProtected>} />
          <Route path="/milestones/:campaignId" element={<RoleProtected roles={["CAMPAIGNER", "VERIFIER"]}><Milestones /></RoleProtected>} />
          <Route path="/pledges" element={<RoleProtected roles={["BACKER"]}><Pledges /></RoleProtected>} />
          <Route path="/escrow/:campaignId" element={<RoleProtected roles={["ADMIN"]}><Escrow /></RoleProtected>} />
          <Route path="/escrow" element={<Navigate to="/campaigns" replace />} />
          <Route path="/transactions" element={<RoleProtected roles={["ADMIN"]}><Transactions /></RoleProtected>} />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
