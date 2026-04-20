import { Compass, LayoutDashboard, Sparkles, UserCog, Shield, Rocket, Wallet, BadgeCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCurrentUser, useStore } from "../lib/store";
import { ROLES } from "../lib/types";

const roleIcon = {
  ADMIN: Shield,
  CAMPAIGNER: Rocket,
  BACKER: Wallet,
  VERIFIER: BadgeCheck,
};

const dashboardByRole = {
  ADMIN: "/admin",
  CAMPAIGNER: "/campaigner",
  BACKER: "/backer",
  VERIFIER: "/verifier",
};

export default function TopNav() {
  const user = useCurrentUser();
  const users = useStore((s) => s.users);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const location = useLocation();
  const roleUsers = Object.values(ROLES).map((r) => users.find((u) => u.role === r)).filter(Boolean);
  const DashboardIcon = roleIcon[user?.role] || UserCog;

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="inline-flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary-gradient shadow-glow"><Sparkles size={18} /></span>
          <span className="font-display text-xl font-extrabold">FundFlow</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/explore" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><Compass size={16} /> Explore</Link>
          <Link to={dashboardByRole[user?.role] || "/backer"} className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary"><LayoutDashboard size={16} /> Dashboard</Link>
        </nav>
        <details className="relative">
          <summary className="list-none cursor-pointer rounded-full border border-border bg-card px-3 py-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <DashboardIcon size={14} />
              {user?.name?.split(" ").map((n) => n[0]).join("") || "U"}
            </span>
          </summary>
          <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-border bg-card p-3 shadow-elegant">
            <div className="mb-2">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <div className="mb-2 border-t border-border pt-2 text-xs font-semibold text-muted-foreground">Switch role (demo)</div>
            <div className="space-y-1">
              {roleUsers.map((u) => {
                const Icon = roleIcon[u.role];
                return (
                  <button key={u.id} onClick={() => setCurrentUser(u.id)} className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm ${u.id === user?.id ? "bg-muted" : "hover:bg-muted"}`}>
                    <span className="inline-flex items-center gap-2"><Icon size={14} /> {u.role}</span>
                    {u.id === user?.id ? <span>●</span> : null}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">Route: {location.pathname}</div>
          </div>
        </details>
      </div>
    </header>
  );
}
