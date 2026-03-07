import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Goal } from "@/types";
import { Modal } from "@/components/ui";
import { GoalDetailsContent } from "../../../../goals/[id]/goal-details";
import { ModalEditButton } from "../../../../goals/[id]/modal-edit-button";
import { ModalDeleteButton } from "../../../../goals/[id]/modal-delete-button";

export default async function GoalDetailsModal({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const from = resolvedSearch?.from;
  const redirectTo = from === "me" ? "/me/goals" : from === "goals" ? "/goals" : "/home";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  const goal = data as Goal | null;
  if (!goal) {
    notFound();
  }

  return (
    <Modal title="Goal details">
      <GoalDetailsContent goal={goal} showEdit={false} />
      <div className="mt-3 grid grid-cols-2 gap-2">
        <ModalEditButton goalId={goal.id} from={from} />
        <ModalDeleteButton goalId={goal.id} redirectTo={redirectTo} />
      </div>
    </Modal>
  );
}
