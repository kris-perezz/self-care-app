import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "easy" | "medium" | "hard" | "status";
export type BadgeStatusColor = "success" | "warning" | "accent";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
  statusColor?: BadgeStatusColor;
}

const difficultyClasses: Record<Exclude<BadgeVariant, "status">, string> = {
  easy:
    "ui-compact-pill h-[22px] rounded-[18px] bg-primary-100 px-2.5 text-[12px] font-semibold text-primary-700",
  medium:
    "ui-compact-pill h-[22px] rounded-[18px] bg-secondary-100 px-2.5 text-[12px] font-semibold text-secondary-900",
  hard:
    "ui-compact-pill h-[22px] rounded-[18px] bg-accent-100 px-2.5 text-[12px] font-semibold text-accent-900",
};

const statusColorClasses: Record<BadgeStatusColor, string> = {
  success: "bg-success-100 text-success-700",
  warning: "bg-warning-100 text-warning-700",
  accent: "bg-accent-100 text-accent-700",
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, statusColor = "success", children, ...props }, ref) => {
    const variantClass =
      variant === "status"
        ? cn(
            "ui-compact-pill h-[22px] rounded-full px-2.5 text-[12px] font-semibold",
            statusColorClasses[statusColor]
          )
        : difficultyClasses[variant];

    return (
      <span
        ref={ref}
        className={cn("inline-flex items-center", variantClass, className)}
        {...props}
      >
        <span className="ui-compact-label">{children}</span>
      </span>
    );
  }
);

Badge.displayName = "Badge";
