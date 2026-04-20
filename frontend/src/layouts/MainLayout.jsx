import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MainLayout.css';

// ─── Role-based nav config ────────────────────────────────────────────────────
const NAV_LINKS = {
  ADMIN: [
    { label: 'Dashboard',    to: '/dashboard' },
    { label: 'Campaigns',    to: '/campaigns' },   // Escrow is accessed per-campaign from CampaignDetail
    { label: 'Transactions', to: '/transactions' },
  ],
  CAMPAIGNER: [
    { label: 'Dashboard',        to: '/dashboard' },
    { label: 'My Campaigns',     to: '/campaigns' },
    { label: 'Create Campaign',  to: '/create-campaign' },
    { label: 'Milestones',       to: '/milestones' },
  ],
  BACKER: [
    { label: 'Dashboard',   to: '/dashboard' },
    { label: 'Campaigns',   to: '/campaigns' },
    { label: 'My Pledges',  to: '/pledges' },
  ],
  VERIFIER: [
    { label: 'Dashboard',  to: '/dashboard' },
    { label: 'Milestones', to: '/milestones' },
  ],
};

// ─── Role badge colours ───────────────────────────────────────────────────────
const ROLE_COLORS = {
  ADMIN:      '#ef4444',
  CAMPAIGNER: '#f59e0b',
  BACKER:     '#3b82f6',
  VERIFIER:   '#10b981',
};

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const icons = {
  Dashboard:       '⊞',
  Campaigns:       '🚀',
  'My Campaigns':  '🚀',
  'Create Campaign': '✦',
  Milestones:      '🏁',
  'My Pledges':    '💳',
  Escrow:          '🔐',
  Transactions:    '📊',
  Menu:            '☰',
  Close:           '✕',
  Logout:          '⎋',
};

// ─── Component ────────────────────────────────────────────────────────────────
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role  = user?.role ?? 'BACKER';
  const links = NAV_LINKS[role] ?? [];
  const badgeColor = ROLE_COLORS[role] ?? '#6b7280';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="ml-wrapper">
      {/* ── Overlay (mobile) ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="ml-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className={`ml-sidebar${sidebarOpen ? ' ml-sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="ml-brand">
          <span className="ml-brand-icon">◈</span>
          <span className="ml-brand-name">FundFlow</span>
          <button
            className="ml-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            {icons.Close}
          </button>
        </div>

        {/* Nav */}
        <nav className="ml-nav" aria-label="Main navigation">
          <ul className="ml-nav-list">
            {links.map(({ label, to }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `ml-nav-link${isActive ? ' ml-nav-link--active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="ml-nav-icon" aria-hidden="true">
                    {icons[label] ?? '•'}
                  </span>
                  <span className="ml-nav-label">{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar footer */}
        <div className="ml-sidebar-footer">
          <button
            id="logout-btn"
            className="ml-logout-btn"
            onClick={handleLogout}
            aria-label="Logout"
          >
            <span aria-hidden="true">{icons.Logout}</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────────── */}
      <div className="ml-main">
        {/* Topbar */}
        <header className="ml-topbar">
          <button
            className="ml-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            {icons.Menu}
          </button>

          <div className="ml-topbar-right">
            <div className="ml-user-info">
              <div className="ml-avatar" aria-hidden="true">
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </div>
              <div className="ml-user-meta">
                <span className="ml-user-name">
                  {user?.name ?? user?.email ?? 'User'}
                </span>
                <span
                  className="ml-role-badge"
                  style={{ '--badge-color': badgeColor }}
                >
                  {role}
                </span>
              </div>
            </div>

            <button
              id="topbar-logout-btn"
              className="ml-topbar-logout"
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
            >
              {icons.Logout} Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="ml-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
