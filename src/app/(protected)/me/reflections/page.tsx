import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { ReflectionFilters } from "./reflection-filters";
import type { Reflection } from "@/types";
import { EmptyState, PageHeader, StatCard } from "@/components/ui";

export default async function ReflectionArchivePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("reflections")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const reflections = (data as Reflection[]) ?? [];

  const totalWords = reflections.reduce((sum, r) => sum + r.word_count, 0);
  const totalEarned = reflections.reduce((sum, r) => sum + r.currency_earned, 0);
  const moodCount = reflections.filter((r) => r.type === "mood").length;
  const writingCount = reflections.filter((r) => r.type !== "mood").length;

  return (
    <div className="space-y-4">
      <PageHeader title="Reflections" backHref="/me" backLabel="Back to profile" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard variant="tintAccent" label="Entries written" value={writingCount} />
        <StatCard variant="tintAccent" label="Total words" value={totalWords.toLocaleString()} />
        <StatCard variant="tintAccent" label="Mood check-ins" value={moodCount} />
        <StatCard variant="tintAccent" label="Earned" value={formatCurrency(totalEarned)} />
      </div>

      {reflections.length === 0 ? (
        <EmptyState
          message="No reflections yet. Start writing to see your archive!"
          className="p-8"
        />
      ) : (
        <ReflectionFilters reflections={reflections} />
      )}
    </div>
  );
}
