import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Goal } from "@/types";
import { PageHeader } from "@/components/ui";
import { GoalDetailsContent } from "../goal-details";

export default async function GoalDetailsViewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
  const from = resolvedSearch?.from;
  const backHref = from === "me" ? "/me/goals" : from === "goals" ? "/goals" : "/home";
  const backLabel =
    from === "me" ? "Back to history" : from === "goals" ? "Back to goals" : "Back to home";

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
    <div className="space-y-6">
      <PageHeader title="Goal details" backHref={backHref} backLabel={backLabel} />
      <GoalDetailsContent goal={goal} />
    </div>
  );
}
