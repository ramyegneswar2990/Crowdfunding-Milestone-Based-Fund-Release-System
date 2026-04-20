import { useAuth } from '../context/AuthContext';
import './Pages.css';

const ROLE_DESCRIPTIONS = {
  ADMIN:      'Monitor all campaigns, escrow balances, and transactions across the platform.',
  CAMPAIGNER: 'Create and manage your fundraising campaigns, track milestone progress.',
  BACKER:     'Discover active campaigns and track your pledges and contributions.',
  VERIFIER:   'Review submitted milestones and verify their completion.',
};

const DashboardPage = () => {
  const { user } = useAuth();
  const role = user?.role ?? 'BACKER';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">{ROLE_DESCRIPTIONS[role]}</p>
        </div>
        <span className="page-role-chip" data-role={role}>{role}</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-icon">🚀</span>
          <div className="stat-body">
            <span className="stat-value">—</span>
            <span className="stat-label">Active Campaigns</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🏁</span>
          <div className="stat-body">
            <span className="stat-value">—</span>
            <span className="stat-label">Milestones Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">💳</span>
          <div className="stat-body">
            <span className="stat-value">—</span>
            <span className="stat-label">Total Pledged</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🔐</span>
          <div className="stat-body">
            <span className="stat-value">—</span>
            <span className="stat-label">Escrow Balance</span>
          </div>
        </div>
      </div>

      <div className="page-placeholder">
        <span className="placeholder-icon">⊞</span>
        <p>Dashboard widgets coming soon</p>
      </div>
    </div>
  );
};

export default DashboardPage;
