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
    .select("currency_reward, is_completed")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  if (goal.is_completed) {
    return { error: "Goal is already completed" };
  }

  // Mark goal as completed
  const { error: updateError } = await supabase
    .from("goals")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", goalId);

  if (updateError) {
    return { error: updateError.message };
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
    .select("is_completed")
    .eq("id", goalId)
    .eq("user_id", user.id)
    .single();

  if (fetchError || !goal) {
    return { error: "Goal not found" };
  }

  if (goal.is_completed) {
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
