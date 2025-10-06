import { cn } from "@/lib/utils";

type Status = "created" | "in-transit" | "completed" | "paused" | "closed" | "pending" | "inwarding" | "delivered";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

const statusConfig: Record<Status, { label: string; className: string }> = {
  created: { label: "Created", className: "bg-status-created/10 text-status-created border-status-created/20" },
  "in-transit": { label: "In Transit", className: "bg-status-transit/10 text-status-transit border-status-transit/20" },
  completed: { label: "Completed", className: "bg-status-completed/10 text-status-completed border-status-completed/20" },
  paused: { label: "Paused", className: "bg-status-paused/10 text-status-paused border-status-paused/20" },
  closed: { label: "Closed", className: "bg-status-completed/10 text-status-completed border-status-completed/20" },
  pending: { label: "Pending", className: "bg-status-transit/10 text-status-transit border-status-transit/20" },
  inwarding: { label: "Inwarding", className: "bg-primary/10 text-primary border-primary/20" },
  delivered: { label: "Delivered", className: "bg-status-completed/10 text-status-completed border-status-completed/20" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border",
        config.className,
        className
      )}
    >
      <span className="w-2 h-2 rounded-full bg-current mr-2" />
      {config.label}
    </span>
  );
}
