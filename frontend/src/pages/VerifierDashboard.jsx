import { Banknote, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import StatusBadge from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useStore } from "../lib/store";
import { formatINR } from "../lib/format";

export default function VerifierDashboard() {
  const milestones = useStore((s) => s.milestones);
  const campaigns = useStore((s) => s.campaigns);
  const verifyMilestone = useStore((s) => s.verifyMilestone);
  const rejectMilestone = useStore((s) => s.rejectMilestone);
  const releaseMilestone = useStore((s) => s.releaseMilestone);
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");

  const pending = milestones.filter((m) => m.status === "SUBMITTED");
  const ready = milestones.filter((m) => m.status === "VERIFIED");
  const released = milestones.filter((m) => m.status === "RELEASED").slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <p className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"><ShieldCheck size={14} /> Verification center</p>
        <h1 className="text-4xl font-extrabold">Verifier dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Pending verification</p><p className="text-2xl font-extrabold">{pending.length}</p></div>
        <div className="card-elevated bg-primary-gradient p-4"><p className="text-xs">Verified · ready to release</p><p className="text-2xl font-extrabold">{ready.length}</p></div>
        <div className="card-elevated p-4"><p className="text-xs text-muted-foreground">Released this period</p><p className="text-2xl font-extrabold">{released.length}</p></div>
      </div>

      <div className="card-elevated p-5">
        <h2 className="mb-4 text-2xl font-extrabold">Pending verification</h2>
        <div className="space-y-3">
          {pending.map((m) => {
            const c = campaigns.find((x) => x.id === m.campaignId);
            return (
              <div key={m.id} className="rounded-xl border border-border p-3">
                <p className="font-semibold">{m.title}</p>
                <p className="text-xs text-muted-foreground">{c?.title}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => { verifyMilestone(m.id); toast.success("Milestone verified — funds ready to release"); }}>Verify</Button>
                  <Button size="sm" variant="destructive" onClick={() => setRejecting(m.id)}>Reject</Button>
                  <Button size="sm" variant="outline">View</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-elevated p-5">
        <h2 className="mb-4 text-2xl font-extrabold">Ready to release</h2>
        <div className="space-y-2">
          {ready.map((m) => {
            const c = campaigns.find((x) => x.id === m.campaignId);
            return (
              <div key={m.id} className="rounded-xl border border-success/50 bg-success/60 p-3">
                <div className="flex items-center justify-between">
                  <div><p className="font-semibold">{m.title}</p><p className="text-xs">{c?.title}</p></div>
                  <Button size="sm" onClick={() => { releaseMilestone(m.id); toast.success(`Released ${formatINR(m.fundAmount)}`); }}><Banknote size={14} /> Release funds</Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-elevated p-5">
        <h2 className="mb-4 text-xl font-extrabold">Recently released</h2>
        <div className="space-y-2">
          {released.map((m) => <div key={m.id} className="flex items-center justify-between rounded-xl border border-border p-2"><p className="text-sm">{m.title}</p><StatusBadge status={m.status} /></div>)}
        </div>
      </div>

      {rejecting ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
          <div className="card-elevated w-full max-w-lg p-5">
            <h3 className="text-xl font-extrabold">Reject milestone</h3>
            <p className="mb-3 text-sm text-muted-foreground">Reason is required for campaigner feedback.</p>
            <Textarea value={reason} onChange={(e) => setReason(e.target.value)} />
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setRejecting(null); setReason(""); }}>Cancel</Button>
              <Button variant="destructive" onClick={() => { if (!reason.trim()) return toast.error("Reason required"); rejectMilestone(rejecting, reason.trim()); toast.error("Milestone rejected"); setRejecting(null); setReason(""); }}>Reject milestone</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
