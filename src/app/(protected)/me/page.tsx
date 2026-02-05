import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";
import type { UserProfile } from "@/types";

export default async function MePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profileData }, { count: goalsDone }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("goals")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .not("completed_at", "is", null),
  ]);

  const profile = profileData as UserProfile | null;

  return (
    <div className="space-y-4">
      <h2 className="heading-large text-neutral-900">Me</h2>

      {/* Stats card */}
      <div
        className="rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #ffe4fa, #ffc4eb)" }}
      >
        <div className="mb-4 text-center">
          <p className="text-sm font-medium text-pink-800/70">
            {profile?.email ?? user.email}
          </p>
          <p className="text-xs text-pink-700/50">
            Member since{" "}
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-white/50 p-3 text-center">
            <p className="text-xl font-bold text-pink-900">
              {profile?.current_streak ?? 0}
            </p>
            <p className="text-xs text-pink-700/70">Day streak</p>
          </div>
          <div className="rounded-xl bg-white/50 p-3 text-center">
            <p className="text-xl font-bold text-pink-900">
              {profile?.longest_streak ?? 0}
            </p>
            <p className="text-xs text-pink-700/70">Best streak</p>
          </div>
          <div className="rounded-xl bg-white/50 p-3 text-center">
            <p className="text-xl font-bold text-pink-900">{goalsDone ?? 0}</p>
            <p className="text-xs text-pink-700/70">Goals done</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      <div className="space-y-2">
        <MenuItem
          icon="📊"
          label="Goal history"
          bgColor="bg-primary-50"
          textColor="text-primary-700"
          href="/me/goals"
        />
        <MenuItem
          icon="📝"
          label="Reflection archive"
          bgColor="bg-accent-50"
          textColor="text-accent-700"
          href="/me/reflections"
        />
        <MenuItem
          icon="❤️"
          label="Monthly summaries"
          bgColor="bg-accent-50"
          textColor="text-accent-700"
          sublabel="Coming soon"
        />
        <MenuItem
          icon="⚙️"
          label="Settings"
          bgColor="bg-secondary-50"
          textColor="text-secondary-700"
          href="/me/settings"
        />
      </div>

      <div className="pt-2">
        <SignOutButton />
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  bgColor,
  textColor,
  href,
  sublabel,
}: {
  icon: string;
  label: string;
  bgColor: string;
  textColor: string;
  href?: string;
  sublabel?: string;
}) {
  const chevron = (
    <svg
      className="h-4 w-4 text-neutral-500"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8.25 4.5 7.5 7.5-7.5 7.5"
      />
    </svg>
  );

  const content = (
    <>
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${bgColor} ${textColor}`}
      >
        {icon}
      </span>
      <span className="flex flex-1 flex-col">
        <span className="text-small text-neutral-900">{label}</span>
        {sublabel && (
          <span className="text-tiny text-neutral-500">{sublabel}</span>
        )}
      </span>
      {chevron}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="interactive-card flex w-full items-center gap-3 rounded-2xl border-2 border-neutral-100 bg-white p-4 shadow-card text-left hover:border-primary-500/30"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="flex w-full items-center gap-3 rounded-2xl border-2 border-neutral-100 bg-white/60 p-4 shadow-card text-left opacity-50">
      {content}
    </div>
  );
}
