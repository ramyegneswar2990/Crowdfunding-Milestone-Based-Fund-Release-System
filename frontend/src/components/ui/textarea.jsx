import { cn } from "../../lib/utils";

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "min-h-[110px] w-full rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none transition-base placeholder:text-muted-foreground focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    />
  );
}
