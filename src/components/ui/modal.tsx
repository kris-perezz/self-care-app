"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

export function Modal({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 pt-16 sm:items-center sm:px-6">
      <div
        className="absolute inset-0"
        onClick={() => router.back()}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[520px] rounded-3xl bg-white p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          {title ? <h2 className="heading-section text-neutral-900">{title}</h2> : <span />}
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl px-3 py-1.5 text-tiny font-medium text-neutral-700 hover:bg-neutral-100"
          >
            Close
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
