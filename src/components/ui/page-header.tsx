"use client";

import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";

export interface PageHeaderProps {
  title: string;
  backHref?: string;
  backLabel?: string;
  rightSlot?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  backHref,
  backLabel,
  rightSlot,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <div className="flex min-w-0 items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label={backLabel ?? "Back"}
            className="interactive-icon inline-flex h-8 w-8 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
          >
            <ArrowLeft size={20} weight="regular" />
          </Link>
        ) : null}
        <h2 className="heading-large text-neutral-900">{title}</h2>
      </div>
      {rightSlot ? <div className="shrink-0">{rightSlot}</div> : null}
    </div>
  );
}
