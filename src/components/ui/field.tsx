import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={htmlFor} className="block text-small text-neutral-900">
        {label}
        {required ? null : hint ? <span className="text-tiny text-neutral-700/70"> {hint}</span> : null}
      </label>
      {children}
      {error ? <p className="text-tiny text-warning-900">{error}</p> : null}
    </div>
  );
}
