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
      <h2 className="text-2xl font-bold text-gray-900">Me</h2>

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
          bgColor="bg-primary/10"
        />
        <MenuItem
          icon="📝"
          label="Reflection archive"
          bgColor="bg-pink/10"
        />
        <MenuItem
          icon="❤️"
          label="Monthly summaries"
          bgColor="bg-pink-light/30"
        />
        <MenuItem
          icon="⚙️"
          label="Settings"
          bgColor="bg-gray-100"
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
}: {
  icon: string;
  label: string;
  bgColor: string;
}) {
  return (
    <button className="flex w-full items-center gap-3 rounded-2xl border-2 border-gray-200 bg-white p-4 text-left hover:border-primary/50">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg ${bgColor}`}
      >
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium text-gray-900">{label}</span>
      <svg
        className="h-4 w-4 text-gray-400"
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
    </button>
  );
}
