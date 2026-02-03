import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { getToday } from "@/lib/streak";
import { StatCards } from "./stat-cards";
import { RewardProgress } from "./reward-progress";
import { ReflectCta } from "./reflect-cta";
import { TodaysGoals } from "./todays-goals";
import type { Goal, Reward, UserProfile } from "@/types";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [
    { data: profile },
    { data: transactions },
    { data: allTodayGoals },
    { data: activeReward },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_streak, timezone")
      .eq("id", user.id)
      .single(),
    supabase
      .from("currency_transactions")
      .select("amount")
      .eq("user_id", user.id),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("rewards")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .is("purchased_at", null)
      .limit(1)
      .maybeSingle(),
  ]);

  const balance = transactions?.reduce((sum, t) => sum + t.amount, 0) ?? 0;
  const timezone = (profile as Pick<UserProfile, "current_streak" | "timezone">)?.timezone ?? "UTC";
  const streak = (profile as Pick<UserProfile, "current_streak" | "timezone">)?.current_streak ?? 0;
  const today = getToday(timezone);

  // Filter today's goals
  const todaysGoals = ((allTodayGoals as Goal[]) ?? []).filter(
    (g) => g.scheduled_date === today
  );
  const completedToday = todaysGoals.filter((g) => g.completed_at !== null).length;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Today</h2>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <StatCards
        balance={balance}
        streak={streak}
        completedToday={completedToday}
        totalToday={todaysGoals.length}
      />

      {activeReward && (
        <RewardProgress reward={activeReward as Reward} balance={balance} />
      )}

      <ReflectCta />

      <TodaysGoals goals={todaysGoals as Goal[]} />
    </div>
  );
}
