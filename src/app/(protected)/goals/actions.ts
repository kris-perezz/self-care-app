"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DIFFICULTY_REWARDS, type Difficulty } from "@/lib/currency";
import { computeStreak, getToday } from "@/lib/streak";
import { EMOJI } from "@/lib/emoji";

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

  if (!title || title.trim().length === 0) {
    return { error: "Title is required", success: false };
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Invalid difficulty", success: false };
  }

  const currencyReward = DIFFICULTY_REWARDS[difficulty as Difficulty];

  const payload: Record<string, unknown> = {
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    difficulty,
    emoji,
    currency_reward: currencyReward,
    scheduled_time: scheduledTime || null,
  };

  if (recurringDays) {
    payload.recurring_days = recurringDays;
    payload.scheduled_date = null;
    payload.completed_at = null;
    payload.last_completed_date = null;
  } else {
    const scheduledDate = (formData.get("scheduled_date") as string) || null;
    payload.recurring_days = null;
    payload.last_completed_date = null;
    payload.scheduled_date = scheduledDate || null;
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

  // Fetch the goal to get the reward amount and verify ownership.
  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("currency_reward, completed_at, recurring_days, last_completed_date")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  // Fetch user timezone for today's date calculation
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date, timezone")
    .eq("id", user.id)
    .single();

  const timezone = profile?.timezone ?? "UTC";
  const today = getToday(timezone);

  let rewarded = false;

  if (goal.recurring_days) {
    // Recurring goal: use last_completed_date to track "completed today"
    // Must explicitly allow NULL rows through (NULL != x evaluates to NULL, not TRUE)
    const { count } = await supabase
      .from("goals")
      .update({ last_completed_date: today }, { count: "exact" })
      .eq("id", goalId)
      .eq("user_id", user.id)
      .or(`last_completed_date.is.null,last_completed_date.neq.${today}`);

    if (!count) return { error: null }; // already completed today — skip reward
    rewarded = true;
  } else {
    // One-time goal: use completed_at
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

  // Run currency insert and profile fetch in parallel
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

  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Invalid difficulty" };
  }

  const currencyReward = DIFFICULTY_REWARDS[difficulty as Difficulty];

  const payload: Record<string, unknown> = {
    title: title.trim(),
    description: description?.trim() || null,
    difficulty,
    emoji,
    currency_reward: currencyReward,
    scheduled_time: scheduledTime || null,
  };

  if (recurringDays) {
    payload.recurring_days = recurringDays;
    payload.scheduled_date = null;
    payload.completed_at = null;
    payload.last_completed_date = null;
  } else {
    const scheduledDate = (formData.get("scheduled_date") as string) || null;
    payload.recurring_days = null;
    payload.last_completed_date = null;
    payload.scheduled_date = scheduledDate || null;
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
  redirect("/goals");
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
    .select("completed_at, recurring_days")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  if (!goal.recurring_days && goal.completed_at !== null) {
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
  redirect("/goals");
}
