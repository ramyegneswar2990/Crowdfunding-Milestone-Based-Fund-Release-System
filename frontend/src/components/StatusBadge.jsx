import { cn } from "../lib/utils";

const tone = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING_APPROVAL: "bg-warning text-warning-foreground",
  ACTIVE: "bg-primary/20 text-primary-foreground",
  FUNDED: "bg-secondary text-secondary-foreground",
  IN_PROGRESS: "bg-accent text-accent-foreground",
  COMPLETED: "bg-success text-success-foreground",
  FAILED: "bg-destructive text-destructive-foreground",
  CANCELLED: "bg-muted text-muted-foreground",
  LOCKED: "bg-muted text-muted-foreground",
  SUBMITTED: "bg-warning text-warning-foreground",
  VERIFIED: "bg-accent text-accent-foreground",
  RELEASED: "bg-success text-success-foreground",
  REJECTED: "bg-destructive text-destructive-foreground",
  PENDING: "bg-warning text-warning-foreground",
  REFUNDED: "bg-muted text-muted-foreground",
};

export default function StatusBadge({ status, className }) {
  return (
    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", tone[status] || tone.DRAFT, className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
