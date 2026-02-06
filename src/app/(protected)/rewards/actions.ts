"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { EMOJI } from "@/lib/emoji";

export type RewardActionState = {
  error: string | null;
};

export async function createReward(
  _prevState: RewardActionState,
  formData: FormData
): Promise<RewardActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const name = formData.get("name") as string;
  const emoji = (formData.get("emoji") as string) || EMOJI.gift;
  const priceStr = formData.get("price") as string;
  const price = Math.round(parseFloat(priceStr) * 100);

  if (!name || name.trim().length === 0) {
    return { error: "Name is required" };
  }

  if (isNaN(price) || price < 100) {
    return { error: "Price must be at least $1.00" };
  }

  // If there is no active reward yet, set the new one active by default.
  const { data: existing } = await supabase
    .from("rewards")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .is("purchased_at", null)
    .limit(1);

  const isActive = !existing || existing.length === 0;

  const { error } = await supabase.from("rewards").insert({
    user_id: user.id,
    name: name.trim(),
    emoji,
    price,
    is_active: isActive,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/rewards");
  revalidatePath("/home");
  return { error: null };
}

export async function addPresetReward(
  name: string,
  emoji: string,
  price: number
): Promise<RewardActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: existing } = await supabase
    .from("rewards")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .is("purchased_at", null)
    .limit(1);

  const isActive = !existing || existing.length === 0;

  const { error } = await supabase.from("rewards").insert({
    user_id: user.id,
    name,
    emoji,
    price,
    is_active: isActive,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/rewards");
  revalidatePath("/home");
  return { error: null };
}

export async function setActiveReward(rewardId: string): Promise<RewardActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  await supabase
    .from("rewards")
    .update({ is_active: false })
    .eq("user_id", user.id)
    .eq("is_active", true);

  const { error } = await supabase
    .from("rewards")
    .update({ is_active: true })
    .eq("id", rewardId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/rewards");
  revalidatePath("/home");
  return { error: null };
}

export async function purchaseReward(rewardId: string): Promise<RewardActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: reward } = await supabase
    .from("rewards")
    .select("price, purchased_at")
    .eq("id", rewardId)
    .eq("user_id", user.id)
    .single();

  if (!reward) {
    return { error: "Reward not found" };
  }

  if (reward.purchased_at) {
    return { error: "Already purchased" };
  }

  const { data: transactions } = await supabase
    .from("currency_transactions")
    .select("amount")
    .eq("user_id", user.id);

  const balance = transactions?.reduce((sum, t) => sum + t.amount, 0) ?? 0;

  if (balance < reward.price) {
    return { error: "Insufficient balance" };
  }

  const { error: txError } = await supabase.from("currency_transactions").insert({
    user_id: user.id,
    amount: -reward.price,
    source: "reward_spend",
    reference_id: rewardId,
  });

  if (txError) {
    return { error: txError.message };
  }

  await supabase
    .from("rewards")
    .update({ purchased_at: new Date().toISOString(), is_active: false })
    .eq("id", rewardId);

  revalidatePath("/rewards");
  revalidatePath("/home");
  revalidatePath("/", "layout");
  return { error: null };
}

export async function deleteReward(rewardId: string): Promise<RewardActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("rewards")
    .delete()
    .eq("id", rewardId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/rewards");
  revalidatePath("/home");
  return { error: null };
}
