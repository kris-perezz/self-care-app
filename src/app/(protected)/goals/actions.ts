"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { DIFFICULTY_REWARDS, type Difficulty } from "@/lib/currency";
import { computeStreak, getToday, getIsDue } from "@/lib/streak";
import { EMOJI } from "@/lib/emoji";
import { isIntervalGoal, isRecurringGoal } from "@/types";

export type ActionState = {
  error: string | null;
  success?: boolean;
};

function parseRecurringDays(raw: string | null): number[] | null {
  if (!raw || raw.trim() === "") return null;
  const days = [...new Set(
    raw.split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
  )];
  return days.length > 0 ? days : null;
}

function parseIntervalFields(formData: FormData): {
  recurrenceInterval: number | null;
  recurrenceUnit: "hours" | "days" | "months" | null;
  error?: string;
} {
  const rawInterval = formData.get("recurrence_interval") as string | null;
  const rawUnit = formData.get("recurrence_unit") as string | null;

  if (!rawInterval && !rawUnit) return { recurrenceInterval: null, recurrenceUnit: null };

  if (!rawInterval || !rawUnit) {
    return { recurrenceInterval: null, recurrenceUnit: null, error: "Both interval and unit are required" };
  }

  const interval = parseInt(rawInterval, 10);
  if (isNaN(interval) || interval < 1) {
    return { recurrenceInterval: null, recurrenceUnit: null, error: "Interval must be at least 1" };
  }

  const validUnits = ["hours", "days", "months"] as const;
  if (!validUnits.includes(rawUnit as "hours" | "days" | "months")) {
    return { recurrenceInterval: null, recurrenceUnit: null, error: "Invalid recurrence unit" };
  }
  const unit = rawUnit as "hours" | "days" | "months";

  if (unit === "hours" && interval > 720) {
    return { recurrenceInterval: null, recurrenceUnit: null, error: "Hour interval cannot exceed 720" };
  }
  if (unit === "days" && interval > 365) {
    return { recurrenceInterval: null, recurrenceUnit: null, error: "Day interval cannot exceed 365" };
  }
  if (unit === "months" && interval > 60) {
    return { recurrenceInterval: null, recurrenceUnit: null, error: "Month interval cannot exceed 60" };
  }

  return { recurrenceInterval: interval, recurrenceUnit: unit };
}

export async function createGoal(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated", success: false };
  }

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const difficulty = (formData.get("difficulty") as string) || "medium";
  const emoji = (formData.get("emoji") as string) || EMOJI.target;
  const scheduledTime = (formData.get("scheduled_time") as string) || null;
  const rawDays = formData.get("recurring_days") as string | null;
  const recurringDays = parseRecurringDays(rawDays);
  const { recurrenceInterval, recurrenceUnit, error: intervalError } = parseIntervalFields(formData);

  if (!title || title.trim().length === 0) {
    return { error: "Title is required", success: false };
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Invalid difficulty", success: false };
  }

  if (intervalError) {
    return { error: intervalError, success: false };
  }

  if (recurringDays && recurrenceInterval) {
    return { error: "Cannot mix weekly and interval recurrence", success: false };
  }

  const currencyReward = DIFFICULTY_REWARDS[difficulty as Difficulty];
  const preDueRemindersEnabled = formData.get("pre_due_reminders_enabled") === "true";

  const payload: Record<string, unknown> = {
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    difficulty,
    emoji,
    currency_reward: currencyReward,
    scheduled_time: scheduledTime || null,
    pre_due_reminders_enabled: preDueRemindersEnabled,
  };

  if (recurringDays) {
    payload.recurring_days = recurringDays;
    payload.scheduled_date = null;
    payload.completed_at = null;
    payload.last_completed_date = null;
    payload.recurrence_interval = null;
    payload.recurrence_unit = null;
    payload.last_completed_at = null;
  } else if (recurrenceInterval) {
    payload.recurring_days = null;
    payload.scheduled_date = null;
    payload.completed_at = null;
    payload.last_completed_date = null;
    payload.recurrence_interval = recurrenceInterval;
    payload.recurrence_unit = recurrenceUnit;
    payload.last_completed_at = null;
  } else {
    const scheduledDate = (formData.get("scheduled_date") as string) || null;
    payload.recurring_days = null;
    payload.last_completed_date = null;
    payload.scheduled_date = scheduledDate || null;
    payload.recurrence_interval = null;
    payload.recurrence_unit = null;
    payload.last_completed_at = null;
  }

  const { error } = await supabase.from("goals").insert(payload);

  if (error) {
    return { error: error.message, success: false };
  }

  revalidatePath("/goals");
  revalidatePath("/home");
  return { error: null, success: true };
}

export async function completeGoal(goalId: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("currency_reward, completed_at, recurring_days, last_completed_date, recurrence_interval, recurrence_unit, last_completed_at")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date, timezone")
    .eq("id", user.id)
    .single();

  const timezone = profile?.timezone ?? "UTC";
  const today = getToday(timezone);

  let rewarded = false;

  if (goal.recurrence_interval !== null && goal.recurrence_unit !== null) {
    // Interval goal: check it's actually due before allowing completion
    if (!getIsDue({ recurrence_interval: goal.recurrence_interval, recurrence_unit: goal.recurrence_unit, last_completed_at: goal.last_completed_at }, timezone)) {
      return { error: "Goal is not due yet" };
    }

    const { count } = await supabase
      .from("goals")
      .update({ last_completed_at: new Date().toISOString() }, { count: "exact" })
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (!count) return { error: null };
    rewarded = true;
  } else if (goal.recurring_days !== null) {
    const { count } = await supabase
      .from("goals")
      .update({ last_completed_date: today }, { count: "exact" })
      .eq("id", goalId)
      .eq("user_id", user.id)
      .or(`last_completed_date.is.null,last_completed_date.neq.${today}`);

    if (!count) return { error: null };
    rewarded = true;
  } else {
    if (goal.completed_at !== null) {
      return { error: "Goal is already completed" };
    }

    const { count } = await supabase
      .from("goals")
      .update({ completed_at: new Date().toISOString() }, { count: "exact" })
      .eq("id", goalId)
      .eq("user_id", user.id)
      .is("completed_at", null);

    if (!count) return { error: "Goal already completed" };
    rewarded = true;
  }

  if (!rewarded) return { error: null };

  const [{ error: txError }] = await Promise.all([
    supabase.from("currency_transactions").insert({
      user_id: user.id,
      amount: goal.currency_reward,
      source: "goal",
      reference_id: goalId,
    }),
  ]);

  if (txError) {
    return { error: txError.message };
  }

  if (profile) {
    const { newStreak, todayStr } = computeStreak(
      profile.current_streak,
      profile.last_active_date,
      profile.timezone
    );

    await supabase
      .from("profiles")
      .update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, profile.longest_streak),
        last_active_date: todayStr,
      })
      .eq("id", user.id);
  }

  revalidatePath("/goals");
  revalidatePath("/home");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function updateGoal(
  goalId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const title = formData.get("title") as string;
  const description = (formData.get("description") as string) || null;
  const difficulty = (formData.get("difficulty") as string) || "medium";
  const emoji = (formData.get("emoji") as string) || EMOJI.target;
  const scheduledTime = (formData.get("scheduled_time") as string) || null;
  const rawDays = formData.get("recurring_days") as string | null;
  const recurringDays = parseRecurringDays(rawDays);
  const { recurrenceInterval, recurrenceUnit, error: intervalError } = parseIntervalFields(formData);

  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Invalid difficulty" };
  }

  if (intervalError) {
    return { error: intervalError };
  }

  if (recurringDays && recurrenceInterval) {
    return { error: "Cannot mix weekly and interval recurrence" };
  }

  const currencyReward = DIFFICULTY_REWARDS[difficulty as Difficulty];
  const preDueRemindersEnabled = formData.get("pre_due_reminders_enabled") === "true";

  const payload: Record<string, unknown> = {
    title: title.trim(),
    description: description?.trim() || null,
    difficulty,
    emoji,
    currency_reward: currencyReward,
    scheduled_time: scheduledTime || null,
    pre_due_reminders_enabled: preDueRemindersEnabled,
  };

  if (recurringDays) {
    payload.recurring_days = recurringDays;
    payload.scheduled_date = null;
    payload.completed_at = null;
    payload.last_completed_date = null;
    payload.recurrence_interval = null;
    payload.recurrence_unit = null;
    payload.last_completed_at = null;
  } else if (recurrenceInterval) {
    payload.recurring_days = null;
    payload.scheduled_date = null;
    payload.completed_at = null;
    payload.last_completed_date = null;
    payload.recurrence_interval = recurrenceInterval;
    payload.recurrence_unit = recurrenceUnit;
    payload.last_completed_at = null;
  } else {
    const scheduledDate = (formData.get("scheduled_date") as string) || null;
    payload.recurring_days = null;
    payload.last_completed_date = null;
    payload.scheduled_date = scheduledDate || null;
    payload.recurrence_interval = null;
    payload.recurrence_unit = null;
    payload.last_completed_at = null;
  }

  const { error } = await supabase
    .from("goals")
    .update(payload)
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/home");
  revalidatePath("/me/goals");
  return { error: null, success: true };
}

export async function deleteGoal(goalId: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("completed_at, recurring_days, recurrence_interval")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  // Only block deletion for completed one-time goals
  if (!goal.recurring_days && !goal.recurrence_interval && goal.completed_at !== null) {
    return { error: "Completed goals cannot be deleted" };
  }

  const { error } = await supabase
    .from("goals")
    .delete()
    .eq("id", goalId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  revalidatePath("/home");
  revalidatePath("/me/goals");
  return { error: null, success: true };
}
