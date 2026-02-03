"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { DIFFICULTY_REWARDS, type Difficulty } from "@/lib/currency";
import { computeStreak } from "@/lib/streak";

export type ActionState = {
  error: string | null;
};

export async function createGoal(
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
  const scheduledTime = (formData.get("scheduled_time") as string) || null;
  const scheduledDate = (formData.get("scheduled_date") as string) || null;

  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Invalid difficulty" };
  }

  const currencyReward = DIFFICULTY_REWARDS[difficulty as Difficulty];

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    difficulty,
    currency_reward: currencyReward,
    scheduled_time: scheduledTime || null,
    scheduled_date: scheduledDate || null,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/goals");
  redirect("/goals");
}

export async function completeGoal(goalId: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Fetch the goal to get the reward amount and verify ownership
  const { data: goal, error: fetchError } = await supabase
    .from("goals")
    .select("currency_reward, completed_at")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  if (goal.completed_at !== null) {
    return { error: "Goal is already completed" };
  }

  // Mark goal as completed — the .is('completed_at', null) filter
  // prevents race conditions: only the first request succeeds
  const { data: updated, error: updateError } = await supabase
    .from("goals")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", goalId)
    .is("completed_at", null)
    .select()
    .single();

  if (updateError || !updated) {
    return { error: "Goal already completed" };
  }

  // Record the currency transaction
  const { error: txError } = await supabase
    .from("currency_transactions")
    .insert({
      user_id: user.id,
      amount: goal.currency_reward,
      source: "goal",
      reference_id: goalId,
    });

  if (txError) {
    return { error: txError.message };
  }

  // Update streak
  const { data: profile } = await supabase
    .from("profiles")
    .select("current_streak, longest_streak, last_active_date, timezone")
    .eq("id", user.id)
    .single();

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
  const scheduledTime = (formData.get("scheduled_time") as string) || null;
  const scheduledDate = (formData.get("scheduled_date") as string) || null;

  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return { error: "Invalid difficulty" };
  }

  const currencyReward = DIFFICULTY_REWARDS[difficulty as Difficulty];

  const { error } = await supabase
    .from("goals")
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      difficulty,
      currency_reward: currencyReward,
      scheduled_time: scheduledTime || null,
      scheduled_date: scheduledDate || null,
    })
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
    .select("completed_at")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  if (goal.completed_at !== null) {
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
