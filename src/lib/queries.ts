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
 * Reads profiles.balance — a cached column kept in sync by a DB trigger
 * on every currency_transactions INSERT. O(1) regardless of transaction count.
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
