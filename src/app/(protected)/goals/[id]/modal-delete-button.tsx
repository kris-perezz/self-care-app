"use client";

import { useState, useTransition } from "react";
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
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  function handleDelete() {
    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteGoal(goalId);
      if (result?.error) {
        setError(result.error);
      } else {
        router.back();
        setTimeout(() => {
          router.push(redirectTo);
        }, 0);
      }
    });
  }

  if (!showConfirm) {
    return (
      <Button
        type="button"
        variant="destructiveOutline"
        className="w-full"
        onClick={() => setShowConfirm(true)}
      >
        <span className="flex flex-col items-center gap-1 py-1">
          <span className="text-xl">🗑️</span>
          <span className="text-tiny">Delete</span>
        </span>
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl bg-warning-50 p-3">
      <p className="text-small text-warning-900">Delete this goal? This cannot be undone.</p>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          variant="destructiveOutline"
          className="flex-1 border-warning-900 bg-warning-900 text-white"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={() => {
            setShowConfirm(false);
            setError(null);
          }}
          disabled={isDeleting}
        >
          Cancel
        </Button>
      </div>

      {error ? <p className="text-tiny text-warning-900">{error}</p> : null}
    </div>
  );
}
