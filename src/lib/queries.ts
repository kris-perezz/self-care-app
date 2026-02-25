import { cache } from "react";
import { createClient } from "./supabase/server";
import { perf } from "./perf";

/**
 * Cached per-request auth check.
 * React cache() deduplicates this so Header + page components
 * share one getUser() call instead of making separate auth round-trips.
 */
export const getUser = cache(async () => {
  const done = perf("[server] getUser");
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  done();
  return session?.user ?? null;
});

/**
 * Cached per-request balance fetch.
 * Header, home page, and rewards page all need the balance —
 * this ensures only one DB query fires per request.
 */
export const getBalance = cache(async () => {
  const user = await getUser();
  if (!user) return 0;
  const done = perf("[server] getBalance");
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();
  done();
  return data?.balance ?? 0;
});
