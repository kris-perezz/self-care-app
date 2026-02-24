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
  standard: "bg-neutral-50",
  tintPrimary: "bg-primary-100",
  tintSecondary: "bg-secondary-100",
  tintAccent: "bg-accent-100",
  muted: "bg-neutral-50/70",
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "standard", interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-4 shadow-card",
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
