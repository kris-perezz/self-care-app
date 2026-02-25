import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { perf } from "@/lib/perf";
import { SignOutButton } from "./sign-out-button";
import type { UserProfile } from "@/types";
import { Card, FluentEmoji, PageHeader, StatCard } from "@/components/ui";
import { EMOJI } from "@/lib/emoji";

export default async function MePage() {
  const done = perf("[server] /me total");
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const doneData = perf("[server] /me queries");

  const [{ data: profileData }, { count: goalsDone }] = await Promise.all([
    supabase
      .from("profiles")
      .select("current_streak, longest_streak, created_at, email, timezone")
      .eq("id", user.id)
      .single(),
    supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("completed_at", "is", null),
  ]);

  doneData();
  done();

  const profile = profileData as UserProfile | null;

  return (
    <div className="space-y-4">
      <PageHeader title="Me" />

      <Card variant="tintAccent" className="space-y-4">
        <div className="text-center">
          <p className="text-small text-neutral-900">{profile?.email ?? ""}</p>
          <p className="text-tiny text-neutral-700/70">
            Member since{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "-"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Day streak" value={profile?.current_streak ?? 0} />
          <StatCard label="Best streak" value={profile?.longest_streak ?? 0} />
          <StatCard label="Goals done" value={goalsDone ?? 0} />
        </div>
      </Card>

      <div className="space-y-2">
        <MenuItem emoji={EMOJI.chart} label="Goal history" href="/me/goals" />
        <MenuItem emoji={EMOJI.books} label="Reflection archive" href="/me/reflections" />
        <MenuItem emoji={EMOJI.sparkles} label="Monthly summaries" sublabel="Coming soon" />
        <MenuItem emoji={EMOJI.gear} label="Settings" href="/me/settings" />
      </div>

      <div className="pt-2">
        <SignOutButton />
      </div>
    </div>
  );
}

function MenuItem({
  emoji,
  label,
  href,
  sublabel,
}: {
  emoji: string;
  label: string;
  href?: string;
  sublabel?: string;
}) {
  const content = (
    <>
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-50">
        <FluentEmoji emoji={emoji} size={20} />
      </span>

      <span className="flex flex-1 flex-col">
        <span className="text-small text-neutral-900">{label}</span>
        {sublabel ? (
          <span className="text-tiny text-neutral-700/70">{sublabel}</span>
        ) : null}
      </span>

      <span className="text-neutral-700/70">&gt;</span>
    </>
  );

  if (href) {
    return (
      <Link href={href}>
        <Card variant="standard" interactive className="flex items-center gap-3">
          {content}
        </Card>
      </Link>
    );
  }

  return (
    <Card variant="muted" className="flex items-center gap-3 opacity-60">
      {content}
    </Card>
  );
}
