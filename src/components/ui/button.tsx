import {
  ButtonHTMLAttributes,
  type ReactElement,
  cloneElement,
  forwardRef,
  isValidElement,
} from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "ghostAccent"
  | "destructiveOutline";

export type ButtonSize = "md" | "sm" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary-500 text-white",
  secondary: "bg-secondary-500 text-white",
  accent: "bg-accent-500 text-white",
  ghostAccent:
    "border-2 border-dashed border-accent-500 bg-accent-50 text-accent-700 shadow-none",
  destructiveOutline:
    "border-2 border-warning-700 bg-warning-50 text-warning-900 shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "rounded-3xl px-7 py-3.5 text-emphasis",
  sm: "rounded-3xl px-4 py-2 text-small",
  icon: "h-10 w-10 rounded-lg p-0 text-small",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", asChild = false, type = "button", children, ...props },
    ref
  ) => {
    const classes = cn(
      "interactive-button inline-flex items-center justify-center gap-2 font-medium shadow-button disabled:opacity-50",
      variantClasses[variant],
      sizeClasses[size],
      className
    );

    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<{ className?: string }>;
      return cloneElement(child, {
        ...(props as Record<string, unknown>),
        className: cn(child.props.className, classes),
      });
    }

    return (
      <button ref={ref} type={type} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
