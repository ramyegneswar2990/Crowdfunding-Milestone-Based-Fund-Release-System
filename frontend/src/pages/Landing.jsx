import { ArrowRight, Compass, Shield, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import CampaignCard from "../components/CampaignCard";
import { Button } from "../components/ui/button";
import { useStore } from "../lib/store";
import { formatCompactINR } from "../lib/format";

export default function Landing() {
  const campaigns = useStore((s) => s.campaigns);
  const pledges = useStore((s) => s.pledges);
  const users = useStore((s) => s.users);
  const featured = campaigns.filter((c) => ["ACTIVE", "FUNDED", "IN_PROGRESS"].includes(c.status)).slice(0, 3);
  const escrowTotal = campaigns.reduce((a, c) => a + c.currentFunded, 0);
  const verifiers = users.filter((u) => u.role === "VERIFIER").length;
  const backers = users.filter((u) => u.role === "BACKER").length;

  return (
    <div className="space-y-14">
      <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-card p-8 md:p-12">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="relative z-10 max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-secondary/70 px-4 py-2 text-xs font-semibold">
            <Sparkles size={14} /> Milestone-based fund release · Backer protection by design
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Funding that
            <br />
            <span className="text-gradient">moves with proof.</span>
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
            FundFlow keeps pledges safe in escrow and releases funds only when milestones are verified.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild><Link to="/explore">Explore campaigns <Compass size={16} /></Link></Button>
            <Button variant="outline" asChild><Link to="/campaigner">Start a campaign</Link></Button>
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            <div className="glass rounded-2xl p-4"><p className="text-xs text-muted-foreground">Raised in escrow</p><p className="text-2xl font-bold">{formatCompactINR(escrowTotal)}</p></div>
            <div className="glass rounded-2xl p-4"><p className="text-xs text-muted-foreground">Active backers</p><p className="text-2xl font-bold">{backers}</p></div>
            <div className="glass rounded-2xl p-4"><p className="text-xs text-muted-foreground">Verifiers on board</p><p className="text-2xl font-bold">{verifiers}</p></div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-3xl font-extrabold">How it works</h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            "Campaigner pitches",
            "Backers pledge",
            "Verifier signs off",
            "Funds released",
          ].map((t, i) => (
            <div key={t} className="card-elevated p-5">
              <p className="text-xs font-semibold text-muted-foreground">0{i + 1}</p>
              <p className="mt-2 text-lg font-bold">{t}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold">Live campaigns</h2>
          <Link to="/explore" className="inline-flex items-center gap-1 text-sm font-semibold text-primary">View all <ArrowRight size={14} /></Link>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {featured.map((c) => <CampaignCard key={c.id} campaign={c} backers={pledges.filter((p) => p.campaignId === c.id && p.status === "COMPLETED").length} />)}
        </div>
      </section>

      <section className="rounded-3xl bg-primary-gradient p-8 text-foreground shadow-elegant md:p-10">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs"><Shield size={14} /> Trust-by-design</p>
            <h3 className="text-2xl font-extrabold md:text-3xl">Backers stay protected. Campaigners stay accountable.</h3>
          </div>
          <div className="flex gap-3">
            <Button asChild><Link to="/backer">Back projects</Link></Button>
            <Button variant="outline" asChild><Link to="/campaigner">Launch campaign</Link></Button>
          </div>
        </div>
      </section>
    </div>
  );
}
