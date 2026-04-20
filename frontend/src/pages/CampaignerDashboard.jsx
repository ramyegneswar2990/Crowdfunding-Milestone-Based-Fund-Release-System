import { Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import StatusBadge from "../components/StatusBadge";
import { useCurrentUser, useStore } from "../lib/store";
import { formatINR, percent } from "../lib/format";

export default function CampaignerDashboard() {
  const user = useCurrentUser();
  const campaigns = useStore((s) => s.campaigns);
  const milestones = useStore((s) => s.milestones);
  const submitCampaign = useStore((s) => s.submitCampaign);
  const submitMilestone = useStore((s) => s.submitMilestone);
  const mine = campaigns.filter((c) => c.campaignerId === user?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Sparkles size={14} /> Campaign studio</p>
          <h1 className="text-4xl font-extrabold">Welcome back, {user?.name?.split(" ")[0]}</h1>
        </div>
        <Button onClick={() => toast("Use create campaign form flow")}><Plus size={16} /> New campaign</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Total raised</p><p className="text-2xl font-extrabold">{formatINR(mine.reduce((a, c) => a + c.currentFunded, 0))}</p></div>
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Active campaigns</p><p className="text-2xl font-extrabold">{mine.filter((c) => c.status === "ACTIVE").length}</p></div>
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Drafts</p><p className="text-2xl font-extrabold">{mine.filter((c) => c.status === "DRAFT").length}</p></div>
      </div>
      <div className="space-y-4">
        {mine.map((c) => {
          const m = milestones.filter((x) => x.campaignId === c.id);
          return (
            <div key={c.id} className="card-elevated p-5">
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold">{c.title}</p>
                  <p className="text-sm text-muted-foreground">{c.tagline}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="h-2 rounded-full bg-muted"><div className="h-full rounded-full bg-primary-gradient" style={{ width: `${percent(c.currentFunded, c.fundingGoal)}%` }} /></div>
              <p className="mt-2 text-sm">{formatINR(c.currentFunded)} / {formatINR(c.fundingGoal)}</p>
              {c.status === "DRAFT" ? <Button size="sm" className="mt-3" onClick={() => { submitCampaign(c.id); toast.success("Submitted for approval"); }}>Submit campaign</Button> : null}
              <div className="mt-4 space-y-2">
                {m.map((x) => (
                  <div key={x.id} className="flex items-center justify-between rounded-xl border border-border p-2">
                    <div><p className="text-sm font-semibold">{x.title}</p><p className="text-xs text-muted-foreground">{x.status}</p></div>
                    {x.status === "ACTIVE" ? <Button size="sm" variant="outline" onClick={() => { submitMilestone(x.id); toast.success("Milestone submitted"); }}>Submit completion</Button> : null}
                  </div>
                ))}
                {m.some((x) => x.status === "SUBMITTED") ? <p className="text-xs text-warning-foreground">Some milestones await verifier review.</p> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
