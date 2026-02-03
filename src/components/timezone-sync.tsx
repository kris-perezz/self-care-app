"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * Detects the user's browser timezone and updates their profile
 * if the stored timezone is still 'UTC' (default).
 *
 * Runs once on mount. Renders nothing.
 * This catches existing users who signed up before timezone detection was added.
 */
export function TimezoneSync() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    async function syncTimezone() {
      let detectedTimezone: string;
      try {
        detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return; // Can't detect, do nothing
      }

      // No point updating if we detected UTC — that's already the default
      if (detectedTimezone === "UTC") return;

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Only update if the stored timezone is still the default 'UTC'
      const { data: profile } = await supabase
        .from("profiles")
        .select("timezone")
        .eq("id", user.id)
        .single();

      if (profile?.timezone === "UTC") {
        await supabase
          .from("profiles")
          .update({ timezone: detectedTimezone })
          .eq("id", user.id);
      }
    }

    syncTimezone();
  }, []);

  return null;
}
