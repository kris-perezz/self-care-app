import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { ReflectionFilters } from "./reflection-filters";
import type { Reflection } from "@/types";
import { EmptyState, StatCard } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";
import { BackLink } from "@/components/nav/back-link";

export default async function ReflectionArchivePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data } = await supabase
    .from("reflections")
    .select("id, type, mood, word_count, currency_earned, prompt, content, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const reflections = (data as Reflection[]) ?? [];

  const totalWords = reflections.reduce((sum, r) => sum + r.word_count, 0);
  const totalEarned = reflections.reduce((sum, r) => sum + r.currency_earned, 0);
  const moodCount = reflections.filter((r) => r.type === "mood").length;
  const writingCount = reflections.filter((r) => r.type !== "mood").length;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href="/me" />
        <h1 className="heading-large text-neutral-900">Reflections</h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard variant="tintAccent" label="Entries written" value={writingCount} />
        <StatCard variant="tintAccent" label="Total words" value={totalWords.toLocaleString()} />
        <StatCard variant="tintAccent" label="Mood check-ins" value={moodCount} />
        <StatCard variant="tintAccent" label="Earned" value={formatCurrency(totalEarned)} />
      </div>

      {reflections.length === 0 ? (
        <EmptyState
          emoji={EMOJI.writing}
          heading="Your first entry awaits"
          message="Write anything — even 10 words counts toward your balance."
          className="p-8"
        />
      ) : (
        <ReflectionFilters reflections={reflections} />
      )}
    </div>
  );
}
