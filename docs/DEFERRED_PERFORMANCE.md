# Deferred Performance Improvements

Issues identified during the Feb 2026 performance audit but deferred due to scope or complexity.

---

## Resolved

### ✅ Header balance deduplication (Feb 2026)
**Fix**: Used React's `cache()` in `src/lib/queries.ts` — `getBalance` and `getUser` are deduplicated per-request. Header and page both call the same cached function; only one DB query fires.

### ✅ TanStack Query removal (Feb 2026)
**Context**: TanStack Query was added speculatively but added 9 files and HydrationBoundary wrappers with no meaningful benefit — every navigation still hit the server.
**Fix**: Removed `@tanstack/react-query` entirely. All pages restored to pure async server components. Mutations rely on `revalidatePath()` in server actions.

### ✅ `getUser` redundant auth round-trip (Feb 2026)
**Fix**: Switched from `supabase.auth.getUser()` (~70–130ms network call) to `supabase.auth.getSession()` (~2–5ms cookie read) in `src/lib/queries.ts`. Safe because middleware already calls `getUser()` once per request on protected routes, and RLS enforces data access at the DB level.
**Measured savings**: ~70ms per page (local), ~0ms in production (already ~2ms).

### ✅ `/reflect` sequential queries (Feb 2026)
**Fix**: Profile and reflections were fetched sequentially (profile timezone needed first). Changed to `Promise.all()` with a 36-hour UTC lookback window, then filtered to today client-side after both resolve.
**Measured savings**: ~65–95ms per `/reflect` load.

### ✅ `getBalance` full table scan → cached column (Feb 2026)
**Context**: `getBalance` fetched every row from `currency_transactions` and summed `amount` in JavaScript. Grew linearly with transaction count; was measuring 113–172ms in production.
**Fix**: Added `profiles.balance` column (integer, cached) kept in sync by a Postgres trigger that fires after every `currency_transactions` INSERT: `balance = balance + NEW.amount`. `getBalance` now reads a single column from `profiles` by primary key.
**Migration**: `supabase/migrations/20260225_balance_cache.sql`
**Measured savings**: 113–172ms → 35–62ms in production (~100ms per page).

**Production page totals before → after (Vercel, warm):**
| Page | Before | After |
|---|---|---|
| `/home` | 128–187ms | ~70ms |
| `/goals` | 123–182ms | 41–56ms |
| `/reflect` | 120–182ms | 47–63ms |
| `/rewards` | 133–171ms | ~48ms |
| `/me` | 123–174ms | 67–83ms |

---

---

## 1. Header balance deduplication

**Issue**: The `Header` component re-queries `currency_transactions` on every page render, duplicating the same query already performed in `rewards/page.tsx` and `home/page.tsx`.

**Impact**: 1 extra DB round-trip per page navigation.

**Why deferred**: Requires prop-drilling the balance from each page to the layout, or introducing a cache layer (e.g. React cache()). This is a broader architectural refactor.

**Future fix**: Use React's `cache()` from `"react"` to deduplicate the Supabase fetch within a single request — both the header and the page would call the same cached function and only one DB query fires.

---

## 2. Client-side filter → URL param migration

**Issue**: Goal filters (`GoalFilters`), goal history filters (`GoalHistoryFilters`), and reflection filters (`ReflectionFilters`) fetch the full dataset server-side and filter in-memory on the client. As datasets grow this wastes bandwidth.

**Impact**: Grows linearly with data size; fine for <500 rows, problematic beyond that.

**Why deferred**: Migrating to URL param–driven DB filters requires rethinking the filter UX, adding pagination, and changing the data fetching pattern significantly.

**Future fix**: Move filters to URL search params, push filtering to DB queries (`.eq()`, `.gte()`, etc.), add cursor-based pagination.

---

## 3. PurchaseReward race condition

**Issue**: In `rewards/actions.ts`, `purchaseReward` checks the balance and then inserts the debit transaction in two separate queries. A concurrent request could pass the balance check before the debit lands, leading to a negative balance.

**Why deferred**: Reserved for Phase 4 RPC atomic transaction fix (already noted in CLAUDE.md gotchas).

**Future fix**: Move to a PostgreSQL RPC function that does the balance check and debit in a single atomic transaction with `FOR UPDATE` locking.

---

## 4. GoalCard hydration overhead

**Issue**: `GoalCard` is a Client Component (uses `useTransition`) even though most of its content is static. React 19's `.bind()` pattern on Server Actions could reduce client JS.

**Impact**: Minor — React Compiler already handles memoization automatically.

**Why deferred**: Low ROI; the hydration cost is small and React Compiler mitigates most overhead.

---

## 5. Home page fetches all goals then filters in memory

**Issue**: `home/page.tsx` fetches all goals for the user and then filters `g.scheduled_date === today` in JavaScript. For users with many goals this wastes bandwidth.

**Why deferred**: Linked to the client-side filter refactor (#2) — better to address together. Also blocked by timezone handling: `today` is computed from the user's timezone after the profile fetch, making a single-query solution slightly more complex.

**Future fix**: Add `.eq("scheduled_date", today)` to the DB query once the profile/goals fetches are restructured.
