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
      <div className="flex items-center gap-1.5">
        {icon ? <span className="shrink-0">{icon}</span> : null}
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">{label}</p>
      </div>
      <div className="font-heading text-2xl font-semibold leading-tight text-neutral-900">{value}</div>
    </Card>
  );
}
