import { createClient } from "@/lib/supabase/server";
import { getToday } from "@/lib/streak";
import { getRandomPrompts } from "@/lib/writing-prompts";
import { MoodCheckin } from "./mood-checkin";
import { WritingPrompts } from "./writing-prompts";
import { ProgressCard } from "./progress-card";
import Link from "next/link";
import { Card, FluentEmoji, PageHeader } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

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
      <PageHeader title="Reflect" />

      <MoodCheckin hasMoodToday={hasMoodToday} />

      <div className="grid grid-cols-2 gap-3">
        <Link href="/reflect/write?type=prompted">
          <Card variant="standard" interactive className="flex flex-col items-center gap-2">
            <FluentEmoji emoji={EMOJI.books} size={24} />
            <span className="text-small text-neutral-900">Prompted</span>
            <span className="text-tiny text-neutral-700/70">guided writing</span>
          </Card>
        </Link>

        <Link href="/reflect/write?type=freewrite">
          <Card variant="standard" interactive className="flex flex-col items-center gap-2">
            <FluentEmoji emoji={EMOJI.writing} size={24} />
            <span className="text-small text-neutral-900">Free write</span>
            <span className="text-tiny text-neutral-700/70">your thoughts</span>
          </Card>
        </Link>
      </div>

      <WritingPrompts initialPrompts={getRandomPrompts(4)} />

      <ProgressCard totalWords={totalWords} totalEarned={totalEarned} />
    </div>
  );
}
