import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Goal } from "@/types";
import { Modal } from "@/components/ui";
import { GoalDetailsContent } from "../../../../goals/[id]/goal-details";
import { ModalEditButton } from "../../../../goals/[id]/modal-edit-button";

export default async function GoalDetailsModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      <div className="mt-3">
        <ModalEditButton goalId={goal.id} />
      </div>
    </Modal>
  );
}
