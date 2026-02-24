import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, max, className, barClassName }: ProgressBarProps) {
  const percent = max <= 0 ? 0 : Math.max(0, Math.min((value / max) * 100, 100));

  return (
    <div
      className={cn(
        "h-2.5 overflow-hidden rounded-full bg-black/8",
        className
      )}
      style={{ boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.1)" }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.max(0, Math.min(value, max))}
    >
      <div
        className={cn("h-full rounded-full bg-primary-500 transition-all duration-300", barClassName)}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
