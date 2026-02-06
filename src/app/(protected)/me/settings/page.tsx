import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import type { UserProfile } from "@/types";
import { PageHeader } from "@/components/ui";

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
      <PageHeader title="Settings" backHref="/me" backLabel="Back to profile" />
      <SettingsForm profile={profile} />
    </div>
  );
}
