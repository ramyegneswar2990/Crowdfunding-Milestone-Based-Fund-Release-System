import { Shield, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { useStore } from "../lib/store";
import { formatINR } from "../lib/format";

export default function AdminDashboard() {
  const campaigns = useStore((s) => s.campaigns);
  const users = useStore((s) => s.users);
  const transactions = useStore((s) => s.transactions);
  const activity = useStore((s) => s.activity);
  const approveCampaign = useStore((s) => s.approveCampaign);
  const rejectCampaign = useStore((s) => s.rejectCampaign);
  const cancelCampaign = useStore((s) => s.cancelCampaign);
  const pending = campaigns.filter((c) => c.status === "PENDING_APPROVAL");

  const totalEscrow = campaigns.reduce((a, c) => a + c.currentFunded, 0);
  const released = transactions.filter((t) => t.transactionType === "MILESTONE_RELEASE").reduce((a, b) => a + b.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Shield size={14} /> Platform oversight</p>
        <h1 className="text-4xl font-extrabold">Admin dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Total raised in escrow</p><p className="text-2xl font-extrabold">{formatINR(totalEscrow)}</p></div>
        <div className="card-elevated bg-primary-gradient p-4"><p className="text-xs">Funds released</p><p className="text-2xl font-extrabold">{formatINR(released)}</p></div>
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Active campaigns</p><p className="text-2xl font-extrabold">{campaigns.filter((c) => c.status === "ACTIVE").length}</p></div>
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Total users</p><p className="text-2xl font-extrabold">{users.length}</p></div>
      </div>

      <div className="card-elevated p-5">
        <h2 className="mb-4 text-2xl font-extrabold">Pending approvals</h2>
        <div className="space-y-3">
          {pending.map((c) => (
            <div key={c.id} className="rounded-2xl border border-border p-3">
              <p className="font-semibold">{c.title}</p>
              <p className="text-sm text-muted-foreground">{c.tagline}</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline">Review</Button>
                <Button size="sm" variant="destructive" onClick={() => { rejectCampaign(c.id); toast.error("Campaign rejected"); }}><XCircle size={14} /> Reject</Button>
                <Button size="sm" onClick={() => { approveCampaign(c.id); toast.success("Campaign approved"); }}><CheckCircle2 size={14} /> Approve</Button>
              </div>
            </div>
          ))}
          {!pending.length ? <p className="text-sm text-muted-foreground">No campaigns awaiting review.</p> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-elevated p-5">
          <h2 className="mb-4 text-xl font-extrabold">All campaigns</h2>
          <div className="space-y-2">
            {campaigns.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-border p-2">
                <div>
                  <p className="font-semibold">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{formatINR(c.currentFunded)} / {formatINR(c.fundingGoal)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={c.status} />
                  <Button size="sm" variant="outline" onClick={() => { cancelCampaign(c.id); toast("Campaign cancelled"); }}>Cancel</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card-elevated p-5">
          <h2 className="mb-4 text-xl font-extrabold">Activity feed</h2>
          <div className="space-y-2">
            {activity.slice(0, 12).map((a) => <div key={a.id} className="rounded-xl border border-border p-2 text-sm"><p className="font-semibold">{a.action}</p><p className="text-xs text-muted-foreground">{a.remarks || ""}</p></div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
