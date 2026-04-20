import { Link } from "react-router-dom";
import { Clock3, Users } from "lucide-react";
import { daysUntil, formatCompactINR, percent } from "../lib/format";
import StatusBadge from "./StatusBadge";

export default function CampaignCard({ campaign, backers = 0 }) {
  const p = percent(campaign.currentFunded, campaign.fundingGoal);
  return (
    <Link to={`/campaign/${campaign.id}`} className="card-elevated overflow-hidden animate-fade-in-up">
      <div className="relative aspect-[4/3]">
        <img src={campaign.imageUrl} alt={campaign.title} className="h-full w-full object-cover" />
        <span className="absolute left-3 top-3 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur-md">{campaign.category}</span>
        <StatusBadge status={campaign.status} className="absolute right-3 top-3 bg-background/90" />
      </div>
      <div className="space-y-3 p-4 text-left">
        <h3 className="line-clamp-2 text-lg font-bold">{campaign.title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{campaign.tagline}</p>
        <div>
          <div className="h-2 rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary-gradient" style={{ width: `${p}%` }} />
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>{formatCompactINR(campaign.currentFunded)} / {formatCompactINR(campaign.fundingGoal)}</span>
            <span className="font-semibold">{p}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Users size={14} /> {backers} backers</span>
          <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {daysUntil(campaign.endDate)} days</span>
        </div>
      </div>
    </Link>
  );
}
