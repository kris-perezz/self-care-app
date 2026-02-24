"use client";

import { useRouter } from "next/navigation";
import { PencilSimple } from "@phosphor-icons/react/dist/ssr";
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
      <span className="inline-flex items-center justify-center gap-2">
        <PencilSimple size={16} weight="regular" />
        Edit goal
      </span>
    </Button>
  );
}
