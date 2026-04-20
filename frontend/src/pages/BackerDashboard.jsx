import { Trophy, Wallet } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import StatusBadge from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { useCurrentUser, useStore } from "../lib/store";
import { formatDate, formatINR } from "../lib/format";

export default function BackerDashboard() {
  const user = useCurrentUser();
  const pledges = useStore((s) => s.pledges);
  const campaigns = useStore((s) => s.campaigns);
  const cancelPledge = useStore((s) => s.cancelPledge);
  const mine = pledges.filter((p) => p.backerId === user?.id);
  const total = mine.filter((p) => p.status === "COMPLETED").reduce((a, p) => a + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><Wallet size={14} /> Backer wallet</p>
          <h1 className="text-4xl font-extrabold">Hi, {user?.name?.split(" ")[0]}</h1>
        </div>
        <Button asChild><Link to="/explore">Discover campaigns</Link></Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Total pledged</p><p className="text-2xl font-extrabold">{formatINR(total)}</p></div>
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Campaigns backed</p><p className="text-2xl font-extrabold">{new Set(mine.map((p) => p.campaignId)).size}</p></div>
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Active pledges</p><p className="text-2xl font-extrabold">{mine.filter((p) => p.status === "COMPLETED").length}</p></div>
      </div>
      <div className="space-y-3">
        {mine.map((p) => {
          const c = campaigns.find((x) => x.id === p.campaignId);
          const canCancel = p.status === "COMPLETED" && c?.status === "ACTIVE";
          return (
            <div key={p.id} className="card-elevated flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex items-center gap-3">
                <img src={c?.imageUrl} alt={c?.title} className="h-14 w-20 rounded-xl object-cover" />
                <div>
                  <p className="font-semibold">{c?.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(p.pledgedAt)}</p>
                  {p.rewardSelection ? <p className="inline-flex items-center gap-1 text-xs"><Trophy size={12} /> {p.rewardSelection}</p> : null}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{formatINR(p.amount)}</p>
                <StatusBadge status={p.status} />
                <Button size="sm" variant="outline" asChild><Link to={`/campaign/${p.campaignId}`}>View</Link></Button>
                {canCancel ? <Button size="sm" variant="destructive" onClick={() => { cancelPledge(p.id); toast.success("Pledge cancelled — refund initiated"); }}>Cancel</Button> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
