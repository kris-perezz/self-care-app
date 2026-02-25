import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { BackLink } from "@/components/nav/back-link";
import type { UserProfile } from "@/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile = profileData as UserProfile;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href="/me" />
        <h1 className="heading-large text-neutral-900">Settings</h1>
      </div>
      <SettingsForm profile={profile} />
    </div>
  );
}
