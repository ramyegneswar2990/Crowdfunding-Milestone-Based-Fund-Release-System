import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─── Component ────────────────────────────────────────────────────────────────
const MainLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? 'BACKER';
  const roleLinks = {
    ADMIN: [{ label: 'Campaigns', to: '/campaigns' }, { label: 'Transactions', to: '/transactions' }],
    CAMPAIGNER: [{ label: 'My Campaigns', to: '/campaigns' }, { label: 'Create', to: '/create-campaign' }, { label: 'Milestones', to: '/milestones' }],
    BACKER: [{ label: 'Campaigns', to: '/campaigns' }, { label: 'Pledges', to: '/pledges' }],
    VERIFIER: [{ label: 'Milestones', to: '/milestones' }],
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-auth-theme min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-4 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-primary-gradient text-xs font-bold">✦</span>
              <span className="text-lg font-extrabold">FundFlow</span>
            </div>
            <nav className="flex items-center gap-2">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-sm ${isActive ? 'bg-foreground text-background font-semibold' : 'text-muted-foreground'}`
                }
              >
                Dashboard
              </NavLink>
              {(roleLinks[role] ?? []).map(({ label, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `rounded-full px-3 py-1.5 text-sm ${isActive ? 'bg-muted font-semibold' : 'text-muted-foreground'}`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-semibold">{role}</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold">
              {(user?.name ?? user?.email ?? 'U').charAt(0).toUpperCase()}
            </span>
            <button onClick={handleLogout} className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-4 py-6">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
