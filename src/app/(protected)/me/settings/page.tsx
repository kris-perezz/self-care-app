import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "./settings-form";
import { NotificationPanel } from "./notification-panel";
import { BackLink } from "@/components/nav/back-link";
import type { UserProfile, NotificationSettings } from "@/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: profileData }, { data: notifData }, { data: subsData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("notification_settings").select("*").eq("user_id", user.id).single(),
    supabase.from("push_subscriptions").select("id").eq("user_id", user.id).limit(1),
  ]);

  const profile = profileData as UserProfile;
  const notificationSettings = notifData as NotificationSettings | null;
  const hasSubscription = (subsData?.length ?? 0) > 0;

  return (
    <div className="space-y-6">
      <div>
        <BackLink href="/me" />
        <h1 className="heading-large text-neutral-900">Settings</h1>
      </div>
      <SettingsForm profile={profile} />
      <div className="border-t border-neutral-100 pt-2">
        <NotificationPanel
          notificationSettings={notificationSettings}
          hasSubscription={hasSubscription}
        />
      </div>
    </div>
  );
}
