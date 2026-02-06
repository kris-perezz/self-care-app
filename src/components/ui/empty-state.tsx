import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  className?: string;
}

export function EmptyState({ message, icon, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed border-neutral-100 bg-neutral-50 p-6 text-center",
        className
      )}
    >
      {icon ? <div className="mb-2 flex justify-center">{icon}</div> : null}
      <p className="text-body text-neutral-700/70">{message}</p>
    </div>
  );
}
