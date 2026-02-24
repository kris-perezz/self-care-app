import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type IconButtonVariant = "neutral" | "accent" | "danger" | "primary";
export type IconButtonSize = "sm" | "md";

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}

const variantClasses: Record<IconButtonVariant, string> = {
  neutral: "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900",
  accent: "text-neutral-500 hover:bg-accent-50 hover:text-accent-700",
  danger: "text-warning-900 hover:bg-warning-50 hover:text-warning-900",
  primary: "text-primary-700 hover:bg-primary-50 hover:text-primary-900",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { className, variant = "neutral", size = "sm", type = "button", ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "interactive-icon inline-flex items-center justify-center rounded-lg disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);

IconButton.displayName = "IconButton";
