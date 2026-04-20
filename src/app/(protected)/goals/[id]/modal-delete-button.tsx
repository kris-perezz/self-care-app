"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "@phosphor-icons/react";
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
  const [showConfirm, setShowConfirm] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  function handleFirstTap() {
    setShowConfirm(true);
    timeoutRef.current = setTimeout(() => setShowConfirm(false), 3000);
  }

  function handleConfirmDelete() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    startDeleteTransition(async () => {
      const result = await deleteGoal(goalId);
      if (!result?.error) {
        const onPopState = () => {
          window.removeEventListener("popstate", onPopState);
          router.push(redirectTo);
        };
        window.addEventListener("popstate", onPopState);
        router.back();
      }
    });
  }

  if (showConfirm) {
    return (
      <Button
        type="button"
        variant="destructiveOutline"
        className="w-full border-warning-900 bg-warning-900 text-white"
        onClick={handleConfirmDelete}
        disabled={isDeleting}
      >
        <span className="flex flex-col items-center gap-1 py-1">
          <Trash size={24} />
          <span className="text-tiny">{isDeleting ? "Deleting…" : "Confirm?"}</span>
        </span>
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="destructiveOutline"
      className="w-full"
      onClick={handleFirstTap}
      disabled={isDeleting}
    >
      <span className="flex flex-col items-center gap-1 py-1">
        <Trash size={24} />
        <span className="text-tiny">Delete</span>
      </span>
    </Button>
  );
}
