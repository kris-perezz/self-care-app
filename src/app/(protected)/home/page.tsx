import { createClient } from "@/lib/supabase/server";
import { getBalance, getUser } from "@/lib/queries";
import { getToday } from "@/lib/streak";
import { perf } from "@/lib/perf";
import { StatCards } from "./stat-cards";
import { RewardProgress } from "./reward-progress";
import { ReflectCta } from "./reflect-cta";
import { TodaysGoals } from "./todays-goals";
import type { Goal, Reward, UserProfile } from "@/types";

export default async function HomePage() {
  const done = perf("[server] /home total");
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const doneData = perf("[server] /home queries");

  const [balance, { data: profile }, { data: goals }, { data: activeReward }] =
    await Promise.all([
      getBalance(),
      supabase
        .from("profiles")
        .select("current_streak, timezone")
        .eq("id", user.id)
        .single(),
      supabase
        .from("goals")
        .select("id, title, emoji, scheduled_date, completed_at, difficulty, currency_reward, recurring_days, last_completed_date")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("rewards")
        .select("id, name, emoji, price, purchased_at, is_active, created_at")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .is("purchased_at", null)
        .limit(1)
        .maybeSingle(),
    ]);

  doneData();
  done();

  const timezone = (profile as Pick<UserProfile, "current_streak" | "timezone"> | null)?.timezone ?? "UTC";
  const streak = (profile as Pick<UserProfile, "current_streak" | "timezone"> | null)?.current_streak ?? 0;
  const today = getToday(timezone);
  const todayDow = new Date(new Date().toLocaleString("en-US", { timeZone: timezone })).getDay();

  const allGoals = (goals as Goal[]) ?? [];
  const todaysGoals = allGoals.filter(
    (g) => g.scheduled_date === today || g.recurring_days?.includes(todayDow)
  );
  const completedToday = todaysGoals.filter((g) =>
    g.recurring_days ? g.last_completed_date === today : g.completed_at !== null
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="heading-large text-neutral-900">Today</h2>
        <p className="text-tiny text-neutral-700/70">
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

      <TodaysGoals goals={todaysGoals as Goal[]} today={today} />
    </div>
  );
}
