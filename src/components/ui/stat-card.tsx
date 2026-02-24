import { ReactNode } from "react";
import { Card, type CardVariant } from "./card";
import { cn } from "@/lib/utils";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  variant?: Exclude<CardVariant, "muted">;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  variant = "standard",
  className,
}: StatCardProps) {
  return (
    <Card variant={variant} className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <p className="text-tiny text-neutral-700/70">{label}</p>
      </div>
      <p className="text-xl font-semibold text-neutral-900">{value}</p>
    </Card>
  );
}
