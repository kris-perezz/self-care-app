import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatCurrency } from "@/lib/currency";
import { ReflectionFilters } from "./reflection-filters";
import type { Reflection } from "@/types";

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
  const totalEarned = reflections.reduce(
    (sum, r) => sum + r.currency_earned,
    0
  );
  const moodCount = reflections.filter((r) => r.type === "mood").length;
  const writingCount = reflections.filter((r) => r.type !== "mood").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/me"
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/50"
          aria-label="Back to profile"
        >
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>
        </Link>
        <h2 className="heading-large text-neutral-900">Reflections</h2>
      </div>

      {/* Summary card */}
      <div
        className="rounded-2xl p-4"
        style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
      >
        <div className="grid grid-cols-2 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-pink-900">{writingCount}</p>
            <p className="text-xs text-pink-700/70">Entries written</p>
          </div>
          <div>
            <p className="text-xl font-bold text-pink-900">
              {totalWords.toLocaleString()}
            </p>
            <p className="text-xs text-pink-700/70">Total words</p>
          </div>
          <div>
            <p className="text-xl font-bold text-pink-900">{moodCount}</p>
            <p className="text-xs text-pink-700/70">Mood check-ins</p>
          </div>
          <div>
            <p className="text-xl font-bold text-pink-900">
              {formatCurrency(totalEarned)}
            </p>
            <p className="text-xs text-pink-700/70">Earned</p>
          </div>
        </div>
      </div>

      {reflections.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-sm text-gray-500">
            No reflections yet. Start writing to see your archive!
          </p>
        </div>
      ) : (
        <ReflectionFilters reflections={reflections} />
      )}
    </div>
  );
}
