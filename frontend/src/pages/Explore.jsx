import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import CampaignCard from "../components/CampaignCard";
import { Input } from "../components/ui/input";
import { useStore } from "../lib/store";

const CAT = ["ALL", "TECHNOLOGY", "EDUCATION", "MEDICAL", "CREATIVE", "SOCIAL"];
const STATUS = ["ALL", "ACTIVE", "FUNDED", "IN_PROGRESS", "COMPLETED"];

export default function Explore() {
  const campaigns = useStore((s) => s.campaigns);
  const pledges = useStore((s) => s.pledges);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const filtered = useMemo(() => campaigns
    .filter((c) => !["DRAFT", "PENDING_APPROVAL"].includes(c.status))
    .filter((c) => category === "ALL" || c.category === category)
    .filter((c) => status === "ALL" || c.status === status)
    .filter((c) => `${c.title} ${c.tagline}`.toLowerCase().includes(query.toLowerCase())), [campaigns, category, status, query]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-extrabold">Explore campaigns</h1>
        <p className="mt-1 text-muted-foreground">Discover curated projects and fund with milestone-backed confidence.</p>
      </div>
      <div className="card-elevated space-y-4 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-3 text-muted-foreground" size={16} />
          <Input className="pl-9" placeholder="Search campaigns..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">{CAT.map((c) => <button key={c} className={`rounded-full px-3 py-1 text-xs font-semibold ${category === c ? "bg-primary text-primary-foreground" : "bg-muted"}`} onClick={() => setCategory(c)}>{c}</button>)}</div>
          <div className="flex flex-wrap gap-2">{STATUS.map((s) => <button key={s} className={`rounded-full px-3 py-1 text-xs font-semibold ${status === s ? "bg-secondary text-secondary-foreground" : "bg-muted"}`} onClick={() => setStatus(s)}>{s}</button>)}</div>
        </div>
      </div>
      {filtered.length ? (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => <CampaignCard key={c.id} campaign={c} backers={pledges.filter((p) => p.campaignId === c.id && p.status === "COMPLETED").length} />)}
        </div>
      ) : (
        <div className="card-elevated p-12 text-center">
          <p className="text-lg font-semibold">No campaigns match your filters.</p>
          <p className="text-sm text-muted-foreground">Try changing category or search term.</p>
        </div>
      )}
    </div>
  );
}
