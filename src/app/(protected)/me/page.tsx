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

  // Read from profiles table (source of truth for user data)
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = data as UserProfile | null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
      </div>

      <div className="rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Email
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {profile?.email ?? user.email}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Member since
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "—"}
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Timezone
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {profile?.timezone ?? "UTC"}
          </p>
        </div>
      </div>

      <SignOutButton />
    </div>
  );
}
