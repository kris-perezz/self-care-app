import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/currency";
import { getToday } from "@/lib/streak";
import { MoodCheckin } from "./mood-checkin";
import { WritingPrompts } from "./writing-prompts";
import { ProgressCard } from "./progress-card";
import Link from "next/link";

export default async function ReflectPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const timezone = profile?.timezone ?? "UTC";
  const today = getToday(timezone);

  // Get today's reflections for progress display
  const startOfDay = `${today}T00:00:00`;
  const { data: todaysReflections } = await supabase
    .from("reflections")
    .select("word_count, currency_earned, type")
    .eq("user_id", user.id)
    .gte("created_at", startOfDay);

  const totalWords = todaysReflections?.reduce((sum, r) => sum + r.word_count, 0) ?? 0;
  const totalEarned = todaysReflections?.reduce((sum, r) => sum + r.currency_earned, 0) ?? 0;
  const hasMoodToday = todaysReflections?.some((r) => r.type === "mood") ?? false;

  return (
    <div className="space-y-4">
      <h2 className="heading-large text-neutral-900">Reflect</h2>

      <MoodCheckin hasMoodToday={hasMoodToday} />

      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/reflect/write?type=prompted"
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white p-4 hover:border-primary"
        >
          <span className="text-2xl">💭</span>
          <span className="text-sm font-medium text-gray-700">Prompted</span>
          <span className="text-xs text-gray-400">guided writing</span>
        </Link>
        <Link
          href="/reflect/write?type=freewrite"
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-gray-200 bg-white p-4 hover:border-primary"
        >
          <span className="text-2xl">✍️</span>
          <span className="text-sm font-medium text-gray-700">Free write</span>
          <span className="text-xs text-gray-400">your thoughts</span>
        </Link>
      </div>

      <WritingPrompts />

      <ProgressCard totalWords={totalWords} totalEarned={totalEarned} />
    </div>
  );
}
