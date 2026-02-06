import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "block w-full rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-2.5 text-body text-neutral-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
