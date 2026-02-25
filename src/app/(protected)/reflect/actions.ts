"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calculateReflectionEarnings, MOOD_CHECKIN_REWARD } from "@/lib/writing-prompts";

export type ReflectActionState = {
  error: string | null;
};

export async function saveMoodCheckin(mood: string): Promise<ReflectActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { data: reflection, error } = await supabase
    .from("reflections")
    .insert({
      user_id: user.id,
      type: "mood",
      mood,
      content: "",
      word_count: 0,
      currency_earned: MOOD_CHECKIN_REWARD,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  // Record currency transaction
  await supabase.from("currency_transactions").insert({
    user_id: user.id,
    amount: MOOD_CHECKIN_REWARD,
    source: "reflection",
    reference_id: reflection.id,
  });

  revalidatePath("/reflect");
  return { error: null };
}

export async function saveReflection(
  _prevState: ReflectActionState,
  formData: FormData
): Promise<ReflectActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const content = (formData.get("content") as string)?.trim();
  const type = (formData.get("type") as string) || "freewrite";
  const prompt = (formData.get("prompt") as string) || null;

  if (!content || content.length === 0) {
    return { error: "Write something before saving" };
  }

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const currencyEarned = calculateReflectionEarnings(wordCount);

  const { data: reflection, error } = await supabase
    .from("reflections")
    .insert({
      user_id: user.id,
      type,
      prompt,
      content,
      word_count: wordCount,
      currency_earned: currencyEarned,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  if (currencyEarned > 0) {
    await supabase.from("currency_transactions").insert({
      user_id: user.id,
      amount: currencyEarned,
      source: "reflection",
      reference_id: reflection.id,
    });
  }

  revalidatePath("/reflect");
  redirect("/reflect");
}
