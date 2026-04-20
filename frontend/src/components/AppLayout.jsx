import { Outlet } from "react-router-dom";
import { Toaster } from "sonner";
import TopNav from "./TopNav";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} FundFlow. Milestone-based crowdfunding demo.
      </footer>
      <Toaster position="top-right" richColors />
    </div>
  );
}
