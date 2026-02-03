"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  const currencyReward = parseInt(formData.get("currency_reward") as string, 10);

  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  if (isNaN(currencyReward) || currencyReward < 1 || currencyReward > 100) {
    return { error: "Reward must be between 1 and 100" };
  }

  const { error } = await supabase.from("goals").insert({
    user_id: user.id,
    title: title.trim(),
    description: description?.trim() || null,
    currency_reward: currencyReward,
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
    console.error("Goal completion race condition or update error:", updateError);
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

  revalidatePath("/goals");
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
  const currencyReward = parseInt(formData.get("currency_reward") as string, 10);

  if (!title || title.trim().length === 0) {
    return { error: "Title is required" };
  }

  if (isNaN(currencyReward) || currencyReward < 1 || currencyReward > 100) {
    return { error: "Reward must be between 1 and 100" };
  }

  const { error } = await supabase
    .from("goals")
    .update({
      title: title.trim(),
      description: description?.trim() || null,
      currency_reward: currencyReward,
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

  // Verify the goal exists, is owned by the user, and is NOT completed
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
