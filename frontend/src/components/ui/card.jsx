import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("card-elevated", className)} {...props} />;
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("p-5 pb-3", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("p-5 pt-2", className)} {...props} />;
}
