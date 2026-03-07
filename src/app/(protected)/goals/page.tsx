import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { getToday } from "@/lib/streak";
import { perf } from "@/lib/perf";
import { GoalFilters } from "./goal-filters";
import { CompletedSection } from "./completed-section";
import type { Goal } from "@/types";
import { Button, EmptyState } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export const dynamic = "force-dynamic";

export default async function GoalsPage() {
  const done = perf("[server] /goals total");
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const doneData = perf("[server] /goals query");
  const { data } = await supabase
    .from("goals")
    .select("id, title, emoji, scheduled_date, completed_at, difficulty, currency_reward, description, scheduled_time, recurring_days, last_completed_date")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  doneData();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();
  done();

  const timezone = profileData?.timezone ?? "UTC";
  const today = getToday(timezone);

  const goals = (data as Goal[]) ?? [];
  // Recurring goals never appear in the completed section — they stay active permanently
  const activeGoals = goals.filter((g) => g.recurring_days !== null || g.completed_at === null);
  const completedGoals = goals.filter((g) => g.recurring_days === null && g.completed_at !== null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-large text-neutral-900">Goals</h1>
        <Button asChild variant="ghostAccent" size="sm">
          <Link href="/goals/new">+ New Goal</Link>
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState
          emoji={EMOJI.seedling}
          heading="Your story starts here"
          message="Create your first goal and start earning rewards."
          className="p-8"
        />
      ) : (
        <>
          <GoalFilters
            goals={activeGoals}
            today={today}
            todayDow={new Date(new Date().toLocaleString("en-US", { timeZone: timezone })).getDay()}
          />
          <CompletedSection goals={completedGoals} />
        </>
      )}
    </div>
  );
}
