"use client";

import { Button } from "@/components/ui";

export function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      onClick={onClick}
      variant={active ? "primary" : "ghostAccent"}
      size="sm"
      className={active ? "" : "border-neutral-100 bg-neutral-50 text-neutral-700"}
    >
      {children}
    </Button>
  );
}
