"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function ModalEditButton({ goalId, from }: { goalId: string; from?: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghostAccent"
      className="w-full"
      onClick={() => {
        const href = from
          ? `/goals/${goalId}/edit?from=${from}`
          : `/goals/${goalId}/edit`;
        const onPopState = () => {
          window.removeEventListener("popstate", onPopState);
          router.push(href);
        };
        window.addEventListener("popstate", onPopState);
        router.back();
      }}
    >
      <span className="flex flex-col items-center gap-1 py-1">
        <span className="text-xl">✏️</span>
        <span className="text-tiny">Edit</span>
      </span>
    </Button>
  );
}
