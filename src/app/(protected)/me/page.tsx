import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "./sign-out-button";

export default async function MePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
          <p className="mt-1 text-sm text-gray-900">{user?.email}</p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Member since
          </label>
          <p className="mt-1 text-sm text-gray-900">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString()
              : "—"}
          </p>
        </div>
      </div>

      <SignOutButton />
    </div>
  );
}
