"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type WeightActionState = {
  error: string | null;
  success: boolean;
};

export async function logWeight(
  _prevState: WeightActionState,
  formData: FormData
): Promise<WeightActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated", success: false };

  const raw = formData.get("weight_lbs") as string;
  const weight = parseFloat(raw);

  if (isNaN(weight) || weight <= 0 || weight >= 1000) {
    return { error: "Enter a weight between 1 and 999 lbs", success: false };
  }

  const logged_date = formData.get("logged_date") as string;

  const { error } = await supabase.from("weight_logs").upsert(
    {
      user_id: user.id,
      weight_lbs: Math.round(weight * 10) / 10,
      logged_date,
    },
    { onConflict: "user_id,logged_date" }
  );

  if (error) return { error: error.message, success: false };

  revalidatePath("/me/weight");
  return { error: null, success: true };
}

export async function deleteWeightLog(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = formData.get("id") as string;

  await supabase
    .from("weight_logs")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/me/weight");
}
