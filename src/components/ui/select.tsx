import { SelectHTMLAttributes, forwardRef } from "react";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "block w-full appearance-none rounded-xl border-2 border-neutral-100 bg-neutral-50 px-4 py-2.5 pr-10 text-body text-neutral-900 outline-none transition-all duration-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <CaretDown
          size={16}
          weight="regular"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-700"
        />
      </div>
    );
  }
);

Select.displayName = "Select";
