import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Goal } from "@/types";
import { GoalDetailsContent } from "./goal-details";
import { BackLink } from "@/components/nav/back-link";

export default async function GoalDetailsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const resolvedSearch = searchParams ? await searchParams : undefined;
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

  const from = resolvedSearch?.from;
  const backHref = from === "me" ? "/me/goals" : from === "goals" ? "/goals" : "/home";
  const backLabel =
    from === "me" ? "Back to history" : from === "goals" ? "Back to goals" : "Back to home";

  return (
    <div className="space-y-6">
      <div>
        <BackLink href={backHref} />
        <h1 className="heading-large text-neutral-900">{goal.title}</h1>
      </div>
      <GoalDetailsContent goal={goal} />
    </div>
  );
}
