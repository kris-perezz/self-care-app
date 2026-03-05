"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGoal } from "../actions";
import { Button } from "@/components/ui";

export function ModalDeleteButton({
  goalId,
  redirectTo,
}: {
  goalId: string;
  redirectTo: string;
}) {
  const router = useRouter();
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    startDeleteTransition(async () => {
      const result = await deleteGoal(goalId);
      if (!result?.error) {
        router.back();
        setTimeout(() => {
          router.push(redirectTo);
        }, 0);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="destructiveOutline"
      className="w-full"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      <span className="flex flex-col items-center gap-1 py-1">
        <span className="text-xl">🗑️</span>
        <span className="text-tiny">{isDeleting ? "Deleting…" : "Delete"}</span>
      </span>
    </Button>
  );
}
