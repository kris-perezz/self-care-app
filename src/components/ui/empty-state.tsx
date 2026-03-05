import Link from "next/link";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  message: string;
  icon?: ReactNode;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({ message, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-6 text-center",
        className
      )}
    >
      {icon ? <div className="mb-3 flex justify-center">{icon}</div> : null}
      <p className="text-body text-neutral-600">{message}</p>
      {action ? (
        <Link
          href={action.href}
          className="mt-4 inline-flex items-center justify-center rounded-3xl bg-primary-500 px-6 py-2.5 text-small font-medium text-white shadow-button transition-all duration-200 hover:-translate-y-0.5 hover:brightness-90"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
