import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY");
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY");
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:admin@himo.app";

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// Normalises "HH:MM" (strips seconds if present) → "HH:MM"
function toWindowTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  return `${pad(h)}:${pad(m)}`;
}

// The exact minute AFTER a given "HH:MM" time
function nextWindowAfterTime(timeStr: string): string {
  const [h, m] = timeStr.split(":").map(Number);
  const nextMin = (h * 60 + m + 1) % 1440;
  return `${pad(Math.floor(nextMin / 60))}:${pad(nextMin % 60)}`;
}

// The exact minute at (scheduledTime - offsetMinutes)
function preDueWindowTime(scheduledTime: string, offsetMinutes: number): string {
  const [h, m] = scheduledTime.split(":").map(Number);
  const totalMin = ((h * 60 + m - offsetMinutes) + 1440) % 1440;
  return `${pad(Math.floor(totalMin / 60))}:${pad(totalMin % 60)}`;
}

function isDue(goal: {
  recurrence_interval: number;
  recurrence_unit: string;
  last_completed_at: string | null;
}): boolean {
  if (!goal.last_completed_at) return true;
  const now = new Date();
  const completed = new Date(goal.last_completed_at);
  if (goal.recurrence_unit === "hours") {
    return now.getTime() - completed.getTime() >= goal.recurrence_interval * 3_600_000;
  }
  if (goal.recurrence_unit === "days") {
    const daysDiff = Math.round((now.getTime() - completed.getTime()) / 86_400_000);
    return daysDiff >= goal.recurrence_interval;
  }
  if (goal.recurrence_unit === "months") {
    const next = new Date(completed);
    next.setMonth(next.getMonth() + goal.recurrence_interval);
    if (next.getDate() < completed.getDate()) next.setDate(0);
    return now >= next;
  }
  return false;
}

function isCompletedToday(
  goal: {
    recurring_days: number[] | null;
    recurrence_interval: number | null;
    completed_at: string | null;
    last_completed_date: string | null;
  },
  localDateStr: string
): boolean {
  if (goal.recurrence_interval !== null) return false;
  if (goal.recurring_days !== null) return goal.last_completed_date === localDateStr;
  return goal.completed_at !== null;
}

type SupabaseClient = ReturnType<typeof createClient>;

async function alreadySent(
  supabase: SupabaseClient,
  userId: string,
  type: string,
  referenceId: string,
  windowKey: string
): Promise<boolean> {
  const { data } = await supabase
    .from("notification_log")
    .select("id")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("reference_id", referenceId)
    .eq("window_key", windowKey)
    .limit(1);
  return (data?.length ?? 0) > 0;
}

async function logSent(
  supabase: SupabaseClient,
  userId: string,
  type: string,
  referenceId: string,
  windowKey: string
): Promise<void> {
  await supabase.from("notification_log").upsert(
    { user_id: userId, type, reference_id: referenceId, window_key: windowKey },
    { onConflict: "user_id,type,reference_id,window_key", ignoreDuplicates: true }
  );
}

interface QueuedNotification {
  type: string;
  referenceId: string;
  dedupKey: string;
  title: string;
  body: string;
  url: string;
}

Deno.serve(async () => {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    return new Response(
      JSON.stringify({ error: "VAPID keys not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const now = new Date();
  const windowKey = `${now.getUTCFullYear()}-${pad(now.getUTCMonth() + 1)}-${pad(now.getUTCDate())}:${pad(now.getUTCHours())}:${pad(now.getUTCMinutes())}`;

  const { data: settingsRows } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("enabled", true);

  if (!settingsRows?.length) {
    return new Response(JSON.stringify({ sent: 0, window: windowKey }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  let totalSent = 0;

  for (const settings of settingsRows) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("timezone, current_streak, last_active_date")
      .eq("id", settings.user_id)
      .single();

    if (!profile) continue;

    const { data: subs } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", settings.user_id);

    if (!subs?.length) continue;

    const timezone = profile.timezone ?? "UTC";
    const localNow = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const localDateStr = now.toLocaleDateString("en-CA", { timeZone: timezone });
    const localWindowTime = `${pad(localNow.getHours())}:${pad(localNow.getMinutes())}`;

    const notifications: QueuedNotification[] = [];

    // 1. Daily summary
    if (settings.daily_summary_enabled && toWindowTime(settings.daily_summary_time) === localWindowTime) {
      if (!(await alreadySent(supabase, settings.user_id, "daily_summary", localDateStr, windowKey))) {
        const { data: goals } = await supabase
          .from("goals")
          .select("recurring_days, recurrence_interval, completed_at, last_completed_date")
          .eq("user_id", settings.user_id);

        const incomplete = (goals ?? []).filter((g) => !isCompletedToday(g, localDateStr)).length;
        if (incomplete > 0) {
          notifications.push({
            type: "daily_summary",
            referenceId: localDateStr,
            dedupKey: windowKey,
            title: "Your day, planned",
            body: `${incomplete} goal${incomplete !== 1 ? "s" : ""} waiting for you today.`,
            url: "/goals",
          });
        }
      }
    }

    // 2. At-time, pre-due, and overdue reminders
    if (settings.at_time_reminders_enabled || settings.overdue_reminders_enabled) {
      const { data: goals } = await supabase
        .from("goals")
        .select("id, title, scheduled_time, recurring_days, recurrence_interval, recurrence_unit, last_completed_at, last_completed_date, completed_at, pre_due_reminders_enabled")
        .eq("user_id", settings.user_id);

      for (const goal of goals ?? []) {
        if (isCompletedToday(goal, localDateStr)) continue;

        if (settings.at_time_reminders_enabled && goal.scheduled_time) {
          if (toWindowTime(goal.scheduled_time) === localWindowTime) {
            const refId = `${goal.id}:${localDateStr}:at_time`;
            if (!(await alreadySent(supabase, settings.user_id, "at_time", refId, windowKey))) {
              notifications.push({
                type: "at_time",
                referenceId: refId,
                dedupKey: windowKey,
                title: `Time for: ${goal.title}`,
                body: "This goal is scheduled for right now.",
                url: "/goals",
              });
            }
          }
        }

        // Pre-due: 1h, 30m, 15m before scheduled_time (offsets are all multiples of 15 → unique windows)
        if (goal.pre_due_reminders_enabled && goal.scheduled_time) {
          for (const offset of [60, 30, 15]) {
            if (preDueWindowTime(goal.scheduled_time, offset) === localWindowTime) {
              const refId = `${goal.id}:${localDateStr}:pre${offset}`;
              if (!(await alreadySent(supabase, settings.user_id, "pre_due", refId, windowKey))) {
                const label = offset === 60 ? "1 hour" : `${offset} minutes`;
                notifications.push({
                  type: "pre_due",
                  referenceId: refId,
                  dedupKey: windowKey,
                  title: `Coming up: ${goal.title}`,
                  body: `Due in ${label}.`,
                  url: "/goals",
                });
              }
            }
          }
        }

        if (settings.overdue_reminders_enabled) {
          // One-time/recurring goals with a scheduled_time: fire in the window immediately after
          if (goal.scheduled_time && goal.recurrence_interval === null) {
            if (nextWindowAfterTime(goal.scheduled_time) === localWindowTime) {
              const refId = `${goal.id}:${localDateStr}:overdue`;
              if (!(await alreadySent(supabase, settings.user_id, "overdue", refId, windowKey))) {
                notifications.push({
                  type: "overdue",
                  referenceId: refId,
                  dedupKey: windowKey,
                  title: `Overdue: ${goal.title}`,
                  body: "This goal is past its scheduled time.",
                  url: "/goals",
                });
              }
            }
          }

          // Interval goals: fire once per day when due.
          // Uses localDateStr as the dedup key (not the per-minute windowKey) so
          // the notification isn't re-sent on every subsequent cron tick that day.
          if (goal.recurrence_interval !== null && goal.recurrence_unit !== null) {
            if (isDue({ recurrence_interval: goal.recurrence_interval, recurrence_unit: goal.recurrence_unit, last_completed_at: goal.last_completed_at })) {
              const refId = `${goal.id}:${localDateStr}:overdue`;
              if (!(await alreadySent(supabase, settings.user_id, "overdue", refId, localDateStr))) {
                notifications.push({
                  type: "overdue",
                  referenceId: refId,
                  dedupKey: localDateStr,
                  title: `Due now: ${goal.title}`,
                  body: `Every ${goal.recurrence_interval} ${goal.recurrence_unit} — time to complete it!`,
                  url: "/goals",
                });
              }
            }
          }
        }
      }
    }

    // 3. Streak at risk: active streak + nothing completed yet today
    if (
      settings.streak_at_risk_enabled &&
      profile.current_streak > 0 &&
      profile.last_active_date !== localDateStr &&
      toWindowTime(settings.streak_at_risk_time) === localWindowTime
    ) {
      if (!(await alreadySent(supabase, settings.user_id, "streak_at_risk", localDateStr, windowKey))) {
        notifications.push({
          type: "streak_at_risk",
          referenceId: localDateStr,
          dedupKey: windowKey,
          title: "Your streak is at risk!",
          body: `${profile.current_streak}-day streak — complete a goal before midnight to keep it going!`,
          url: "/goals",
        });
      }
    }

    // 4. Reflection reminder
    if (settings.reflection_reminder_enabled && toWindowTime(settings.reflection_reminder_time) === localWindowTime) {
      if (!(await alreadySent(supabase, settings.user_id, "reflection", localDateStr, windowKey))) {
        const since = new Date(now.getTime() - 24 * 3_600_000).toISOString();
        const { data: reflections } = await supabase
          .from("reflections")
          .select("id")
          .eq("user_id", settings.user_id)
          .in("type", ["prompted", "freewrite"])
          .gte("created_at", since)
          .limit(1);

        if (!reflections?.length) {
          notifications.push({
            type: "reflection",
            referenceId: localDateStr,
            dedupKey: windowKey,
            title: "Time to reflect",
            body: "Take a moment to write about your day.",
            url: "/reflect",
          });
        }
      }
    }

    // 5. Mood reminder
    if (settings.mood_reminder_enabled && toWindowTime(settings.mood_reminder_time) === localWindowTime) {
      if (!(await alreadySent(supabase, settings.user_id, "mood", localDateStr, windowKey))) {
        const since = new Date(now.getTime() - 24 * 3_600_000).toISOString();
        const { data: moods } = await supabase
          .from("reflections")
          .select("id")
          .eq("user_id", settings.user_id)
          .eq("type", "mood")
          .gte("created_at", since)
          .limit(1);

        if (!moods?.length) {
          notifications.push({
            type: "mood",
            referenceId: localDateStr,
            dedupKey: windowKey,
            title: "How are you feeling?",
            body: "Log your mood for today.",
            url: "/reflect",
          });
        }
      }
    }

    // Send all queued notifications
    for (const notif of notifications) {
      const payload = JSON.stringify({
        title: notif.title,
        body: notif.body,
        url: notif.url,
        tag: notif.type,
      });

      for (const sub of subs) {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
          totalSent++;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number }).statusCode;
          if (status === 410 || status === 404) {
            await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
          }
        }
      }

      await logSent(supabase, settings.user_id, notif.type, notif.referenceId, notif.dedupKey);
    }
  }

  console.log(JSON.stringify({ sent: totalSent, window: windowKey, settingsCount: settingsRows.length }));
  return new Response(JSON.stringify({ sent: totalSent, window: windowKey }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
