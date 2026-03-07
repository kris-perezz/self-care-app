import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type CardVariant =
  | "standard"
  | "tintPrimary"
  | "tintSecondary"
  | "tintAccent"
  | "muted";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  interactive?: boolean;
}

const variantClasses: Record<CardVariant, string> = {
  standard: "bg-neutral-50 shadow-card",
  tintPrimary: "bg-primary-100 shadow-card-primary",
  tintSecondary: "bg-secondary-100 shadow-card-secondary",
  tintAccent: "bg-accent-100 shadow-card-accent",
  muted: "bg-neutral-50/70 shadow-card",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "standard", interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-4 border border-black/[0.04]",
          variantClasses[variant],
          interactive && "border-2 border-neutral-100",
          interactive && "interactive-card",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";
