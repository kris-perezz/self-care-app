import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { EditGoalForm } from "./edit-goal-form";
import { BackLink } from "@/components/nav/back-link";
import type { Goal } from "@/types";

export default async function EditGoalPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const from = resolvedSearch?.from;
  const backHref =
    from === "me" ? "/me/goals" : from === "goals" ? "/goals" : from === "home" ? "/home" : "/goals";
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data) {
    redirect("/goals");
  }

  const goal = data as Goal;

  // Completed goals cannot be edited
  if (goal.completed_at !== null) {
    redirect("/goals");
  }

  return (
    <div className="space-y-6">
      <div>
        <BackLink href={backHref} />
        <h1 className="heading-large text-neutral-900">Edit Goal</h1>
      </div>
      <EditGoalForm goal={goal} backHref={backHref} />
    </div>
  );
}
