"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";

export function ModalEditButton({ goalId }: { goalId: string }) {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghostAccent"
      className="w-full"
      onClick={() => {
        router.back();
        setTimeout(() => {
          router.push(`/goals/${goalId}/edit`);
        }, 0);
      }}
    >
      <span className="flex flex-col items-center gap-1 py-1">
        <span className="text-xl">✏️</span>
        <span className="text-tiny">Edit</span>
      </span>
    </Button>
  );
}
