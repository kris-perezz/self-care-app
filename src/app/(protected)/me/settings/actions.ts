"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { NotificationSettings } from "@/types";

export type SettingsActionState = {
  error: string | null;
  success: boolean;
};

const VALID_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
  "America/Toronto",
  "America/Edmonton",
  "America/Vancouver",
  "America/Winnipeg",
  "America/Halifax",
  "America/St_Johns",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "America/Argentina/Buenos_Aires",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Amsterdam",
  "Europe/Stockholm",
  "Europe/Moscow",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Hong_Kong",
  "Asia/Seoul",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Australia/Perth",
  "Pacific/Auckland",
  "Pacific/Honolulu",
];

export async function updateProfile(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", success: false };
  }

  const displayName =
    (formData.get("display_name") as string)?.trim() || null;
  const timezone = formData.get("timezone") as string;

  if (displayName && displayName.length > 50) {
    return { error: "Display name must be 50 characters or fewer", success: false };
  }

  if (!VALID_TIMEZONES.includes(timezone)) {
    return { error: "Invalid timezone", success: false };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ display_name: displayName, timezone })
    .eq("id", user.id);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/me");
  revalidatePath("/me/settings");
  revalidatePath("/", "layout");
  return { error: null, success: true };
}

type PushSubscriptionJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function savePushSubscription(
  subscription: PushSubscriptionJSON
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    { onConflict: "endpoint" }
  );
  if (error) return { error: error.message };

  await supabase
    .from("notification_settings")
    .upsert({ user_id: user.id, enabled: true }, { onConflict: "user_id" });

  revalidatePath("/me/settings");
  return { error: null };
}

export async function deletePushSubscription(
  endpoint: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint).eq("user_id", user.id);
  await supabase
    .from("notification_settings")
    .update({ enabled: false })
    .eq("user_id", user.id);

  revalidatePath("/me/settings");
  return { error: null };
}

export type NotifSettingsState = { error: string | null; success: boolean };

function parseTime(raw: unknown, fallback: string): string {
  if (typeof raw !== "string" || !/^\d{2}:\d{2}$/.test(raw)) return fallback;
  return raw;
}

export async function saveNotificationSettings(
  _prevState: NotifSettingsState,
  formData: FormData
): Promise<NotifSettingsState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", success: false };

  const bool = (key: string) => formData.get(key) === "true";

  const payload: Omit<NotificationSettings, "updated_at"> = {
    user_id: user.id,
    enabled: true,
    daily_summary_enabled: bool("daily_summary_enabled"),
    daily_summary_time: parseTime(formData.get("daily_summary_time"), "08:00"),
    at_time_reminders_enabled: bool("at_time_reminders_enabled"),
    overdue_reminders_enabled: bool("overdue_reminders_enabled"),
    streak_at_risk_enabled: bool("streak_at_risk_enabled"),
    streak_at_risk_time: parseTime(formData.get("streak_at_risk_time"), "21:00"),
    reflection_reminder_enabled: bool("reflection_reminder_enabled"),
    reflection_reminder_time: parseTime(formData.get("reflection_reminder_time"), "20:00"),
    mood_reminder_enabled: bool("mood_reminder_enabled"),
    mood_reminder_time: parseTime(formData.get("mood_reminder_time"), "12:00"),
  };

  const { error } = await supabase
    .from("notification_settings")
    .upsert({ ...payload, updated_at: new Date().toISOString() }, { onConflict: "user_id" });

  if (error) return { error: error.message, success: false };

  revalidatePath("/me/settings");
  return { error: null, success: true };
}
