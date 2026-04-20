import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { BackLink } from "@/components/nav/back-link";
import { StatCard, EmptyState, FluentEmoji } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";
import { getToday } from "@/lib/streak";
import type { WeightLog } from "@/types";
import { WeightLogForm } from "./weight-log-form";
import { WeightSection } from "./weight-section";

export default async function WeightPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const [{ data: profileData }, { data: logsData }] = await Promise.all([
    supabase
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .single(),
    supabase
      .from("weight_logs")
      .select("id, user_id, weight_lbs, logged_date, created_at")
      .eq("user_id", user.id)
      .order("logged_date", { ascending: false }),
  ]);

  const timezone = (profileData as { timezone: string } | null)?.timezone ?? "UTC";
  const today = getToday(timezone);
  const logs = (logsData as WeightLog[]) ?? [];

  const todayEntry = logs.find((l) => l.logged_date === today) ?? null;
  const latestWeight = logs[0]?.weight_lbs ?? null;

  // Week bounds (Sun–Sat) in user's local date
  const [ty, tm, td] = today.split("-").map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  const dayOfWeek = todayDate.getDay();
  const thisWeekStart = new Date(todayDate);
  thisWeekStart.setDate(todayDate.getDate() - dayOfWeek);
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekEnd);
  lastWeekEnd.setDate(thisWeekEnd.getDate() - 7);

  const fmtDate = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const thisWeekLogs = logs.filter(
    (l) => l.logged_date >= fmtDate(thisWeekStart) && l.logged_date <= fmtDate(thisWeekEnd)
  );
  const lastWeekLogs = logs.filter(
    (l) => l.logged_date >= fmtDate(lastWeekStart) && l.logged_date <= fmtDate(lastWeekEnd)
  );

  const avg = (arr: WeightLog[]) =>
    arr.length > 0 ? arr.reduce((s, l) => s + l.weight_lbs, 0) / arr.length : null;

  const thisWeekAvg = avg(thisWeekLogs);
  const lastWeekAvg = avg(lastWeekLogs);
  const weekDelta =
    thisWeekAvg !== null && lastWeekAvg !== null ? thisWeekAvg - lastWeekAvg : null;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href="/me" />
        <h1 className="heading-large text-neutral-900">Weight</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
      {(thisWeekAvg !== null || latestWeight !== null) && (
          <StatCard
          variant="tintPrimary"
          icon={<FluentEmoji emoji={EMOJI.scale} size={18} />}
          label={thisWeekAvg !== null ? "This week's average" : "Latest"}
          value={
              <span className="flex flex-col gap-0.5">
              <span>{thisWeekAvg !== null ? `${thisWeekAvg.toFixed(1)} lbs` : `${latestWeight} lbs`}</span>
              {weekDelta !== null && (
                  <span
                  className={`text-small font-normal ${
                      weekDelta > 0 ? "text-warning-700" : weekDelta < 0 ? "text-success-700" : "text-neutral-700"
                  }`}
                  >
                  {weekDelta > 0 ? "+" : ""}
                  {weekDelta.toFixed(1)} lbs vs last week
                  </span>
              )}
              {weekDelta === null && lastWeekAvg === null && thisWeekLogs.length > 0 && (
                  <span className="text-small font-normal text-neutral-700">No data last week</span>
              )}
              </span>
          }
          />
      )}

      <WeightLogForm today={today} todayWeight={todayEntry?.weight_lbs ?? null} />
      </div>

      {logs.length === 0 ? (
        <EmptyState
          emoji={EMOJI.scale}
          heading="No entries yet"
          message="Log your first weight above to start tracking."
          className="p-8"
        />
      ) : (
        <WeightSection logs={logs} />
      )}
    </div>
  );
}
