# Self Care App — Full Technical Breakdown

> **Generated**: 2026-02-03
> **Audience**: Experienced programmers, AI code reviewers
> **Codebase**: 44 TypeScript/TSX source files, 3 SQL migrations
> **Stack**: Next.js 16.1.6, React 19.2.3, Supabase (auth + Postgres + RLS), Tailwind CSS v4

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Directory Structure](#2-directory-structure)
3. [Configuration Files](#3-configuration-files)
4. [Type System](#4-type-system)
5. [Supabase Layer](#5-supabase-layer)
6. [Database Schema](#6-database-schema)
7. [SQL Migrations](#7-sql-migrations)
8. [Authentication Flow](#8-authentication-flow)
9. [Middleware](#9-middleware)
10. [Routing & Pages](#10-routing--pages)
11. [Server Actions](#11-server-actions)
12. [Components — Full Inventory](#12-components--full-inventory)
13. [Utility Libraries](#13-utility-libraries)
14. [Styling System](#14-styling-system)
15. [State Management Patterns](#15-state-management-patterns)
16. [Data Flow Diagrams](#16-data-flow-diagrams)
17. [Business Logic Deep-Dive](#17-business-logic-deep-dive)
18. [Architectural Decisions & Tradeoffs](#18-architectural-decisions--tradeoffs)
19. [Known Gaps & Placeholder Features](#19-known-gaps--placeholder-features)

---

## 1. Architecture Overview

This is a **mobile-first self-care tracking app** built as a Next.js App Router application with a Supabase backend. The core loop is:

1. User creates **goals** (with difficulty tiers) and schedules them
2. Completing goals earns **virtual currency** (cents)
3. User writes **reflections** (mood check-ins, prompted writing, freewrite) to earn more currency
4. Currency is spent on **IRL rewards** the user defines (e.g., "Coffee treat $7.00")
5. **Streaks** track consecutive days of goal completion

### Rendering Model

- **Server Components** (default): All pages and data-fetching components. No client JS shipped for these.
- **Client Components** (`"use client"`): Interactive UI (forms, buttons, filters, navigation). Clearly marked.
- **Server Actions** (`"use server"`): All mutations. No API routes (except auth callback).

### Data Architecture

- **No centralized client state** (no Redux, no Context, no Zustand)
- Server components fetch fresh on each render
- Mutations use Next.js server actions with `revalidatePath()` for cache busting
- Currency balance is **computed** (never stored), always `SUM(amount)` from `currency_transactions`

---

## 2. Directory Structure

```
self-care-app/
├── src/
│   ├── app/
│   │   ├── globals.css                           # Tailwind v4 + custom theme
│   │   ├── layout.tsx                            # Root layout (font, metadata)
│   │   ├── page.tsx                              # / → redirect to /home
│   │   ├── login/page.tsx                        # Login form (client)
│   │   ├── signup/page.tsx                       # Signup form (client)
│   │   ├── auth/callback/route.ts                # OAuth code exchange (GET)
│   │   └── (protected)/                          # Route group — requires auth
│   │       ├── layout.tsx                        # Shared shell: Header + BottomNav + TimezoneSync
│   │       ├── home/
│   │       │   ├── page.tsx                      # Dashboard (server)
│   │       │   ├── stat-cards.tsx                # Balance / Streak / Today stats
│   │       │   ├── todays-goals.tsx              # Today's goal cards
│   │       │   ├── reward-progress.tsx           # Active reward progress bar
│   │       │   └── reflect-cta.tsx               # "Reflect Now" button
│   │       ├── goals/
│   │       │   ├── page.tsx                      # Goals list (server)
│   │       │   ├── actions.ts                    # createGoal, completeGoal, updateGoal, deleteGoal
│   │       │   ├── goal-card.tsx                 # Single goal card (client)
│   │       │   ├── goal-filters.tsx              # Today/Week/All filter buttons (client)
│   │       │   ├── completed-section.tsx         # Collapsible completed goals (client)
│   │       │   ├── new/page.tsx                  # New goal form (client)
│   │       │   └── [id]/edit/
│   │       │       ├── page.tsx                  # Edit goal loader (server)
│   │       │       └── edit-goal-form.tsx         # Edit form + delete (client)
│   │       ├── reflect/
│   │       │   ├── page.tsx                      # Reflect hub (server)
│   │       │   ├── actions.ts                    # saveMoodCheckin, saveReflection
│   │       │   ├── mood-checkin.tsx              # 6 mood emoji buttons (client)
│   │       │   ├── writing-prompts.tsx           # 4 shuffled prompts + shuffle (client)
│   │       │   ├── progress-card.tsx             # Words written + earned today
│   │       │   └── write/
│   │       │       ├── page.tsx                  # Writing page (server)
│   │       │       └── writing-form.tsx          # Textarea + word count + save (client)
│   │       ├── rewards/
│   │       │   ├── page.tsx                      # Rewards hub (server)
│   │       │   ├── actions.ts                    # createReward, addPresetReward, setActiveReward, purchaseReward, deleteReward
│   │       │   ├── balance-card.tsx              # Current balance display
│   │       │   ├── reward-card.tsx               # Single reward card (client)
│   │       │   ├── new-reward-form.tsx           # Custom reward form (client)
│   │       │   └── preset-rewards.tsx            # 4 preset reward quick-add buttons (client)
│   │       └── me/
│   │           ├── page.tsx                      # Profile + stats (server)
│   │           └── sign-out-button.tsx           # Sign out (client)
│   ├── components/
│   │   ├── nav/
│   │   │   ├── header.tsx                        # Sticky header with currency (server)
│   │   │   └── bottom-nav.tsx                    # 5-tab bottom nav (client)
│   │   └── timezone-sync.tsx                     # Auto-detect and sync TZ (client)
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                         # Browser Supabase client
│   │   │   ├── server.ts                         # Server Supabase client (cookie-based)
│   │   │   └── middleware.ts                     # Session refresh + route protection
│   │   ├── currency.ts                           # formatCurrency, DIFFICULTY_REWARDS
│   │   ├── streak.ts                             # computeStreak, getToday
│   │   └── writing-prompts.ts                    # Prompts, CENTS_PER_WORD, calculateReflectionEarnings
│   ├── types/
│   │   └── index.ts                              # Goal, Reflection, CurrencyTransaction, UserProfile, Reward
│   └── middleware.ts                             # Next.js middleware entry point
├── supabase/
│   └── migrations/
│       ├── 20260201000000_create_tables.sql      # Current schema doc (Phase 1 + 2 + 3 combined)
│       ├── 20260201_phase2_refactor.sql          # Phase 2: initial tables (profiles, goals, currency_transactions)
│       └── 20260202_phase3.sql                   # Phase 3: difficulty, reflections, rewards, streaks
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.local                                    # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
└── .gitignore
```

**Total source files**: 44 TypeScript/TSX
**Total SQL migrations**: 3

---

## 3. Configuration Files

### `package.json`

```json
{
  "name": "self-care-app",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@supabase/ssr": "^0.8.0",
    "@supabase/supabase-js": "^2.93.3",
    "next": "16.1.6",
    "react": "19.2.3",
    "react-dom": "19.2.3"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "babel-plugin-react-compiler": "1.0.0",
    "eslint": "^9",
    "eslint-config-next": "16.1.6",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

**Notable**: Very lean dependency set. Only 5 runtime dependencies. React Compiler enabled experimentally.

### `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,  // Enables React Compiler (auto-memoization)
};

export default nextConfig;
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,                    // Full strict mode
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }    // Path alias
  }
}
```

### `postcss.config.mjs`

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},  // Tailwind CSS v4 PostCSS plugin
  },
};
export default config;
```

### `eslint.config.mjs`

Uses flat config with:
- `eslint-config-next/core-web-vitals` (performance rules)
- `eslint-config-next/typescript` (TS rules)
- Global ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

Both are `NEXT_PUBLIC_` (exposed to browser) — this is correct; the anon key is safe for client-side use with RLS enforced.

---

## 4. Type System

**File**: `src/types/index.ts`

### `Goal`
```typescript
interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  difficulty: "easy" | "medium" | "hard";
  currency_reward: number;                    // cents: easy=2, medium=5, hard=10
  scheduled_time: string | null;              // "HH:MM" format
  scheduled_date: string | null;              // "YYYY-MM-DD" format
  completed_at: string | null;                // null = incomplete, ISO string = completed
  created_at: string;
}
```

### `Reflection`
```typescript
interface Reflection {
  id: string;
  user_id: string;
  type: "mood" | "prompted" | "freewrite";
  mood: string | null;                        // label for mood check-ins
  prompt: string | null;                      // writing prompt used
  content: string;
  word_count: number;
  currency_earned: number;                    // cents earned
  created_at: string;
}
```

### `CurrencyTransaction`
```typescript
interface CurrencyTransaction {
  id: string;
  user_id: string;
  amount: number;                             // positive = earned, negative = spent
  source: "goal" | "reflection" | "reward_spend";
  reference_id: string | null;                // FK to goal/reflection/reward
  created_at: string;
}
```

### `UserProfile`
```typescript
interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  timezone: string;                           // IANA (e.g., "America/Edmonton")
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;            // "YYYY-MM-DD"
  created_at: string;
}
```

### `Reward`
```typescript
interface Reward {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  price: number;                              // cents (700 = $7.00)
  is_active: boolean;
  purchased_at: string | null;                // null = saving, ISO string = purchased
  created_at: string;
}
```

### Action State Types

```typescript
// Used by goals actions
type ActionState = { error: string | null };

// Used by reflect actions
type ReflectActionState = { error: string | null };

// Used by rewards actions
type RewardActionState = { error: string | null };
```

---

## 5. Supabase Layer

### Browser Client — `src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Used in: `"use client"` components (login, signup, sign-out, timezone-sync).

### Server Client — `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignored in Server Components (middleware handles refresh)
          }
        },
      },
    }
  );
}
```

Used in: All server components, all server actions, auth callback route.

### Middleware Client — `src/lib/supabase/middleware.ts`

Creates a Supabase client scoped to the request/response cookies for session refresh. See [Middleware](#9-middleware) for full logic.

---

## 6. Database Schema

### Entity Relationship Diagram

```
auth.users (Supabase built-in)
    │
    ├── 1:1 ── profiles
    │            ├── id (PK, FK → auth.users)
    │            ├── email
    │            ├── display_name
    │            ├── timezone
    │            ├── current_streak
    │            ├── longest_streak
    │            ├── last_active_date
    │            └── created_at
    │
    ├── 1:N ── goals
    │            ├── id (PK, uuid)
    │            ├── user_id (FK → auth.users)
    │            ├── title
    │            ├── description
    │            ├── difficulty ('easy'|'medium'|'hard')
    │            ├── currency_reward (int, cents)
    │            ├── scheduled_time (time)
    │            ├── scheduled_date (date)
    │            ├── created_at
    │            └── completed_at (null = incomplete)
    │
    ├── 1:N ── reflections
    │            ├── id (PK, uuid)
    │            ├── user_id (FK → auth.users)
    │            ├── type ('mood'|'prompted'|'freewrite')
    │            ├── mood
    │            ├── prompt
    │            ├── content
    │            ├── word_count
    │            ├── currency_earned (int, cents)
    │            └── created_at
    │
    ├── 1:N ── currency_transactions
    │            ├── id (PK, uuid)
    │            ├── user_id (FK → auth.users)
    │            ├── amount (int, cents; +earned, -spent)
    │            ├── source ('goal'|'reflection'|'reward_spend')
    │            ├── reference_id (nullable uuid)
    │            └── created_at
    │
    └── 1:N ── rewards
                 ├── id (PK, uuid)
                 ├── user_id (FK → auth.users)
                 ├── name
                 ├── emoji
                 ├── price (int, cents)
                 ├── is_active (boolean)
                 ├── purchased_at (null = saving)
                 └── created_at
```

### Row Level Security Policies

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| `profiles` | `auth.uid() = id` | *(trigger only)* | `auth.uid() = id` | *(none)* |
| `goals` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `currency_transactions` | `auth.uid() = user_id` | `auth.uid() = user_id` | *(none)* | *(none)* |
| `reflections` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |
| `rewards` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` | `auth.uid() = user_id` |

**Note**: `currency_transactions` has no UPDATE or DELETE policies — transactions are append-only by design.

### Indexes

| Index | Table | Columns |
|---|---|---|
| `idx_goals_user_id` | goals | (user_id) |
| `idx_goals_user_id_created_at` | goals | (user_id, created_at) |
| `idx_goals_user_id_scheduled_date` | goals | (user_id, scheduled_date) |
| `idx_currency_transactions_user_id_amount` | currency_transactions | (user_id, amount) |
| `idx_currency_transactions_user_id_created_at` | currency_transactions | (user_id, created_at) |
| `idx_reflections_user_id_created_at` | reflections | (user_id, created_at) |
| `idx_rewards_user_id_is_active` | rewards | (user_id, is_active) |

### Triggers

```sql
-- Auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- handle_new_user():
-- INSERT INTO profiles (id, email, timezone)
-- VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'timezone', 'UTC'))
```

---

## 7. SQL Migrations

### Phase 2 — `20260201_phase2_refactor.sql`

Initial schema creation. Wrapped in `BEGIN`/`COMMIT` transaction.

Creates:
- `profiles` (id, email, display_name, timezone, created_at)
- `goals` (id, user_id, title, description, currency_reward=10, created_at, completed_at)
- `currency_transactions` (id, user_id, amount, source, reference_id, created_at)
- All RLS policies
- Profile auto-creation trigger
- Backfill for existing users
- Performance indexes

### Phase 3 — `20260202_phase3.sql`

Additive migration. Wrapped in `BEGIN`/`COMMIT` transaction.

Adds:
- `goals.difficulty` column (text, CHECK constraint, default 'medium')
- `goals.scheduled_time` column (time)
- `goals.scheduled_date` column (date)
- New `reflections` table with full RLS
- New `rewards` table with full RLS
- `profiles.current_streak` (int, default 0)
- `profiles.longest_streak` (int, default 0)
- `profiles.last_active_date` (date)
- New indexes for scheduling and active rewards

### Phase 1 — `20260201000000_create_tables.sql`

Documentation file showing the current schema state after all migrations. Not a migration to run — serves as a schema reference.

---

## 8. Authentication Flow

### Sign Up (`src/app/signup/page.tsx`)

1. Client component with email, password, confirmPassword fields
2. Client-side validation: passwords match, min 6 chars
3. Detects browser timezone: `Intl.DateTimeFormat().resolvedOptions().timeZone`
4. Calls `supabase.auth.signUp({ email, password, options: { data: { timezone } } })`
5. Timezone passed via `raw_user_meta_data`
6. DB trigger `on_auth_user_created` fires → creates profile row with timezone
7. On success: `router.push("/home")` + `router.refresh()`

### Sign In (`src/app/login/page.tsx`)

1. Client component with email, password fields
2. Calls `supabase.auth.signInWithPassword({ email, password })`
3. Session cookie set automatically by `@supabase/ssr`
4. On success: `router.push("/home")` + `router.refresh()`

### OAuth Callback (`src/app/auth/callback/route.ts`)

```typescript
export async function GET(request: Request) {
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/home";
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate`);
}
```

### Sign Out (`src/app/(protected)/me/sign-out-button.tsx`)

```typescript
await supabase.auth.signOut();
router.push("/login");
router.refresh();
```

### Timezone Sync (`src/components/timezone-sync.tsx`)

- Runs once on mount via `useEffect` + `useRef` guard
- Detects browser timezone
- If stored profile timezone is `"UTC"` (default), updates to detected timezone
- Handles legacy users who signed up before timezone detection was added
- Renders `null` (invisible component)

---

## 9. Middleware

### Entry Point — `src/middleware.ts`

```typescript
import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Matcher**: All routes except static assets, images, and favicon.

### Session Logic — `src/lib/supabase/middleware.ts`

```
1. Create Supabase server client with request/response cookie handling
2. Call supabase.auth.getUser() (validates + refreshes session)
3. Session cookies are updated on the response
4. Route protection:
   - IF !user AND route is NOT /login, /signup, /auth → redirect to /login
   - IF user AND route IS /login or /signup → redirect to /home
5. Return response (with updated cookies)
```

**Key detail**: The cookie `setAll` callback updates BOTH the request cookies (for downstream Server Components) AND the response cookies (for the browser).

---

## 10. Routing & Pages

### Route Table

| Route | Type | Auth | Component | Description |
|---|---|---|---|---|
| `/` | Server | No | `page.tsx` | Immediate redirect to `/home` |
| `/login` | Client | No | `LoginPage` | Email/password sign in form |
| `/signup` | Client | No | `SignUpPage` | Email/password/confirm + timezone detection |
| `/auth/callback` | Route Handler | No | `GET` | OAuth code exchange |
| `/home` | Server | Yes | `HomePage` | Dashboard: stats, active reward, today's goals |
| `/goals` | Server | Yes | `GoalsPage` | All goals with filter + completed section |
| `/goals/new` | Client | Yes | `NewGoalPage` | Create goal form |
| `/goals/[id]/edit` | Server→Client | Yes | `EditGoalPage` → `EditGoalForm` | Edit goal + delete with confirmation |
| `/reflect` | Server | Yes | `ReflectPage` | Mood check-in, writing options, prompts, progress |
| `/reflect/write` | Server→Client | Yes | `WritePage` → `WritingForm` | Writing interface with word count |
| `/rewards` | Server | Yes | `RewardsPage` | Active rewards, purchased, presets, custom form |
| `/me` | Server | Yes | `MePage` | Profile stats, menu items, sign out |

### Protected Route Group

The `(protected)` directory is a Next.js route group (parentheses = no URL segment).

**Layout** (`src/app/(protected)/layout.tsx`):
```tsx
<div className="mx-auto min-h-screen max-w-md" style={{ background gradient }}>
  <TimezoneSync />     {/* Silent timezone detection */}
  <Header />           {/* Server component: "Self Care" + currency balance */}
  <main className="px-4 pb-20 pt-4">{children}</main>
  <BottomNav />        {/* Client component: 5-tab navigation */}
</div>
```

---

## 11. Server Actions

### Goals Actions — `src/app/(protected)/goals/actions.ts`

#### `createGoal(_prevState: ActionState, formData: FormData): Promise<ActionState>`
- Validates: title required, difficulty in `['easy', 'medium', 'hard']`
- Sets `currency_reward` from `DIFFICULTY_REWARDS[difficulty]`
- Inserts goal with scheduled_date, scheduled_time (optional)
- Redirects to `/goals`

#### `completeGoal(goalId: string): Promise<ActionState>`
1. Fetches goal (verifies ownership + not already completed)
2. **Race-condition-safe update**: `.update({ completed_at }).eq("id", goalId).is("completed_at", null)`
3. Creates positive `currency_transaction` (source: "goal")
4. Fetches user profile for streak data
5. Calls `computeStreak()` → updates profile with new streak + longest_streak + last_active_date
6. Revalidates: `/goals`, `/home`, layout

#### `updateGoal(goalId: string, _prevState: ActionState, formData: FormData): Promise<ActionState>`
- Updates: title, description, difficulty, currency_reward, scheduled_time, scheduled_date
- Server-side ownership check via `.eq("user_id", user.id)`
- Redirects to `/goals`

#### `deleteGoal(goalId: string): Promise<ActionState>`
- Fetches goal first to verify it's not completed (completed goals cannot be deleted)
- Deletes with ownership check
- Redirects to `/goals`

### Reflect Actions — `src/app/(protected)/reflect/actions.ts`

#### `saveMoodCheckin(mood: string): Promise<ReflectActionState>`
- Inserts reflection with `type: "mood"`, `currency_earned: MOOD_CHECKIN_REWARD` (2 cents)
- Creates positive `currency_transaction` (source: "reflection")
- Revalidates: `/reflect`, layout

#### `saveReflection(_prevState: ReflectActionState, formData: FormData): Promise<ReflectActionState>`
- Validates: content not empty
- Calculates `wordCount` via `content.split(/\s+/).filter(Boolean).length`
- Calculates earnings via `calculateReflectionEarnings(wordCount)`
- Inserts reflection
- Creates `currency_transaction` if earnings > 0
- Redirects to `/reflect`

### Rewards Actions — `src/app/(protected)/rewards/actions.ts`

#### `createReward(_prevState: RewardActionState, formData: FormData): Promise<RewardActionState>`
- Converts dollar input to cents: `Math.round(parseFloat(priceStr) * 100)`
- Validates: name required, price >= $1.00 (100 cents)
- Auto-activates if no existing active reward
- Revalidates: `/rewards`, `/home`

#### `addPresetReward(name: string, emoji: string, price: number): Promise<RewardActionState>`
- Same as createReward but with hardcoded values (no form)
- Auto-activates if no existing active reward

#### `setActiveReward(rewardId: string): Promise<RewardActionState>`
1. Deactivates ALL current active rewards for user
2. Activates the selected reward
- Revalidates: `/rewards`, `/home`

#### `purchaseReward(rewardId: string): Promise<RewardActionState>`
1. Fetches reward (verifies not already purchased)
2. Computes current balance via `SUM(amount)` on transactions
3. Validates `balance >= reward.price`
4. Creates negative `currency_transaction` (source: "reward_spend", amount: `-reward.price`)
5. Sets `purchased_at` and `is_active: false` on reward
- Revalidates: `/rewards`, `/home`, layout

#### `deleteReward(rewardId: string): Promise<RewardActionState>`
- Deletes with ownership check
- Revalidates: `/rewards`, `/home`

---

## 12. Components — Full Inventory

### Layout & Navigation

| Component | File | Type | Props | Description |
|---|---|---|---|---|
| `RootLayout` | `src/app/layout.tsx` | Server | children | HTML shell, DM Sans font, metadata |
| `ProtectedLayout` | `src/app/(protected)/layout.tsx` | Server | children | Gradient bg, Header, BottomNav, TimezoneSync, max-w-md |
| `Header` | `src/components/nav/header.tsx` | Server | *(none)* | Sticky header: "Self Care" title + computed currency balance |
| `BottomNav` | `src/components/nav/bottom-nav.tsx` | Client | *(none)* | Fixed bottom: Home, Goals, Reflect, Rewards, Me tabs |
| `TimezoneSync` | `src/components/timezone-sync.tsx` | Client | *(none)* | Auto-detects & syncs timezone once. Renders null. |

### Home Page

| Component | File | Type | Props |
|---|---|---|---|
| `HomePage` | `home/page.tsx` | Server | *(none — fetches own data)* |
| `StatCards` | `home/stat-cards.tsx` | Server | `balance: number, streak: number, completedToday: number, totalToday: number` |
| `TodaysGoals` | `home/todays-goals.tsx` | Server | `goals: Goal[]` |
| `RewardProgress` | `home/reward-progress.tsx` | Server | `reward: Reward, balance: number` |
| `ReflectCta` | `home/reflect-cta.tsx` | Server | *(none)* |

### Goals

| Component | File | Type | Props |
|---|---|---|---|
| `GoalsPage` | `goals/page.tsx` | Server | *(none)* |
| `GoalCard` | `goals/goal-card.tsx` | Client | `goal: Goal, compact?: boolean` |
| `GoalFilters` | `goals/goal-filters.tsx` | Client | `goals: Goal[]` |
| `CompletedSection` | `goals/completed-section.tsx` | Client | `goals: Goal[]` |
| `NewGoalPage` | `goals/new/page.tsx` | Client | *(none)* |
| `EditGoalPage` | `goals/[id]/edit/page.tsx` | Server | `params: Promise<{ id: string }>` |
| `EditGoalForm` | `goals/[id]/edit/edit-goal-form.tsx` | Client | `goal: Goal` |

### Reflect

| Component | File | Type | Props |
|---|---|---|---|
| `ReflectPage` | `reflect/page.tsx` | Server | *(none)* |
| `MoodCheckin` | `reflect/mood-checkin.tsx` | Client | `hasMoodToday: boolean` |
| `WritingPrompts` | `reflect/writing-prompts.tsx` | Client | *(none)* |
| `ProgressCard` | `reflect/progress-card.tsx` | Server | `totalWords: number, totalEarned: number` |
| `WritePage` | `reflect/write/page.tsx` | Server | `searchParams: Promise<{ type?, prompt? }>` |
| `WritingForm` | `reflect/write/writing-form.tsx` | Client | `type: string, prompt: string \| null` |

### Rewards

| Component | File | Type | Props |
|---|---|---|---|
| `RewardsPage` | `rewards/page.tsx` | Server | *(none)* |
| `BalanceCard` | `rewards/balance-card.tsx` | Server | `balance: number` |
| `RewardCard` | `rewards/reward-card.tsx` | Client | `reward: Reward, balance: number` |
| `NewRewardForm` | `rewards/new-reward-form.tsx` | Client | *(none)* |
| `PresetRewards` | `rewards/preset-rewards.tsx` | Client | *(none)* |

### Me / Profile

| Component | File | Type | Props |
|---|---|---|---|
| `MePage` | `me/page.tsx` | Server | *(none)* |
| `MenuItem` | `me/page.tsx` (local) | Server | `icon: string, label: string, bgColor: string` |
| `SignOutButton` | `me/sign-out-button.tsx` | Client | *(none)* |

### Inline SVG Icon Components

These are defined within their parent files (not exported separately):

- `CoinIcon` — in `header.tsx`
- `HomeIcon`, `GoalsIcon`, `ReflectIcon`, `RewardsIcon`, `MeIcon` — in `bottom-nav.tsx` (each takes `{ active: boolean }`)
- `CalendarIcon`, `PencilIcon`, `TrashIcon` — in `goal-card.tsx`
- `ShuffleIcon` — in `writing-prompts.tsx`

---

## 13. Utility Libraries

### `src/lib/currency.ts`

```typescript
export function formatCurrency(cents: number): string
// 250 → "$2.50", 5 → "$0.05", 0 → "$0.00"
// Implementation: `$${(cents / 100).toFixed(2)}`

export const DIFFICULTY_REWARDS = {
  easy: 2,      // $0.02
  medium: 5,    // $0.05
  hard: 10,     // $0.10
} as const;

export type Difficulty = keyof typeof DIFFICULTY_REWARDS;
// "easy" | "medium" | "hard"
```

### `src/lib/streak.ts`

```typescript
export function computeStreak(
  currentStreak: number,
  lastActiveDate: string | null,
  timezone: string
): { newStreak: number; todayStr: string }
// Decision tree:
// - No lastActiveDate → { newStreak: 1 }
// - lastActiveDate === today → { newStreak: currentStreak } (no change)
// - lastActiveDate === yesterday → { newStreak: currentStreak + 1 }
// - else (gap) → { newStreak: 1 } (reset)

export function getToday(timezone: string): string
// Returns "YYYY-MM-DD" for today in the given IANA timezone
// Uses: new Date().toLocaleDateString("en-CA", { timeZone: timezone })
// "en-CA" locale produces YYYY-MM-DD format

// Internal helpers (not exported):
function getTodayInTimezone(timezone: string): string
function getYesterdayInTimezone(timezone: string): string
```

### `src/lib/writing-prompts.ts`

```typescript
const PROMPTS: string[]  // 20 hardcoded reflection prompts

export function getRandomPrompts(count: number = 4): string[]
// Fisher-Yates-ish shuffle: [...PROMPTS].sort(() => Math.random() - 0.5)
// Returns first `count` from shuffled array

export const CENTS_PER_WORD = 0.5;
export const MOOD_CHECKIN_REWARD = 2;  // 2 cents flat

export function calculateReflectionEarnings(wordCount: number): number
// Math.floor(wordCount * CENTS_PER_WORD)
// 100 words → 50 cents, 1 word → 0 cents
```

---

## 14. Styling System

### Tailwind CSS v4 Configuration

**`src/app/globals.css`**:

```css
@import "tailwindcss";

:root {
  --background: #f9f5f2;
  --foreground: #111827;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-dm-sans);
  --color-primary: #abc798;          /* Sage green */
  --color-primary-dark: #7a9970;     /* Darker sage */
  --color-pink: #ffc4eb;             /* Light pink */
  --color-pink-light: #ffe4fa;       /* Very light pink */
  --color-tan: #e1dabd;              /* Warm tan */
  --color-tan-light: #f1dedc;        /* Light warm tan */
}
```

### Design Tokens

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#abc798` | Buttons, active states, progress bars, badges |
| `primary-dark` | `#7a9970` | Button hover, active tab text, links |
| `pink` | `#ffc4eb` | Mood card gradient, goal difficulty badge (hard) |
| `pink-light` | `#ffe4fa` | Background gradients, prompt cards |
| `tan` | `#e1dabd` | Background gradient end, balance card |
| `tan-light` | `#f1dedc` | Background gradient middle |
| `background` | `#f9f5f2` | Page background (warm off-white) |
| `foreground` | `#111827` | Text color (near-black) |

### Font

**DM Sans** (Google Fonts) — weights 400, 500, 700. Loaded in root layout with CSS variable `--font-dm-sans`.

### Gradient Patterns

Used consistently across the app:

```css
/* Main background (protected layout, auth pages) */
background: linear-gradient(to bottom right, #ffe4fa, #f1dedc, #e1dabd);

/* Mood check-in card */
background: linear-gradient(135deg, #ffe4fa, #ffc4eb);

/* Balance stat card */
background: linear-gradient(135deg, #ffe4fa, #ffc4eb);

/* Streak stat card */
background: linear-gradient(135deg, #d4edda, #abc798);

/* Rewards balance card */
background: linear-gradient(135deg, #f1dedc, #e1dabd);
```

### Layout

- Mobile-first: `max-w-md` (448px) for main content
- Bottom padding `pb-20` to account for fixed bottom nav
- Header is `sticky top-0 z-40` with backdrop blur
- Bottom nav is `fixed bottom-0 z-50` with backdrop blur

---

## 15. State Management Patterns

### Server-Side Data Fetching

All pages use this pattern:

```typescript
// Inside async server component
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
const { data } = await supabase.from("table").select("*").eq("user_id", user.id);
```

### Parallel Data Fetching

Pages that need multiple queries use `Promise.all`:

```typescript
const [{ data: profile }, { data: transactions }, { data: goals }, { data: reward }] =
  await Promise.all([
    supabase.from("profiles").select("...").single(),
    supabase.from("currency_transactions").select("amount"),
    supabase.from("goals").select("*"),
    supabase.from("rewards").select("*").eq("is_active", true).maybeSingle(),
  ]);
```

### Client State Patterns

| Pattern | Hook | Used In |
|---|---|---|
| Form state | `useState` | LoginPage, SignUpPage, GoalFilters, NewRewardForm |
| Server action state | `useActionState` | NewGoalPage, EditGoalForm, WritingForm, NewRewardForm |
| Transition (loading) | `useTransition` | GoalCard, MoodCheckin, RewardCard, PresetRewards |
| Derived state | computed | WritingForm (word count → earnings) |
| One-time effect | `useEffect` + `useRef` | TimezoneSync |
| Routing | `usePathname`, `useRouter` | BottomNav, LoginPage, SignUpPage, SignOutButton |

### Mutation → Revalidation Flow

```
User action → Server Action → DB write → revalidatePath() → Page re-renders with fresh data
```

All mutations use `revalidatePath()` to bust the Next.js cache:
- Single path: `revalidatePath("/goals")`
- Layout-level: `revalidatePath("/", "layout")` (refreshes header balance)
- Multiple paths when cross-cutting (e.g., completing a goal revalidates `/goals`, `/home`, and layout)

---

## 16. Data Flow Diagrams

### Goal Completion Flow

```
[GoalCard] → click checkbox
    │
    ├── useTransition (show spinner)
    │
    └── completeGoal(goalId) [server action]
        │
        ├── 1. Verify goal exists + owned + not completed
        │
        ├── 2. UPDATE goals SET completed_at = now()
        │      WHERE id = goalId AND completed_at IS NULL  ← race-condition guard
        │
        ├── 3. INSERT currency_transactions (amount: +reward, source: 'goal')
        │
        ├── 4. SELECT profile (streak, timezone)
        │
        ├── 5. computeStreak(currentStreak, lastActiveDate, timezone)
        │      ├── same day → no change
        │      ├── yesterday → increment
        │      └── gap → reset to 1
        │
        ├── 6. UPDATE profiles (current_streak, longest_streak, last_active_date)
        │
        └── 7. revalidatePath("/goals", "/home", layout)
```

### Reflection Writing Flow

```
[WritingForm] → type in textarea
    │
    ├── onChange → calculate wordCount (split + filter)
    ├── Display: "{wordCount} words" + "Earn: {formatCurrency(earnings)}"
    │
    └── submit form
        │
        └── saveReflection(formData) [server action]
            │
            ├── 1. Validate content not empty
            ├── 2. wordCount = content.split(/\s+/).filter(Boolean).length
            ├── 3. currencyEarned = Math.floor(wordCount * 0.5)
            ├── 4. INSERT reflections
            ├── 5. INSERT currency_transactions (if earnings > 0)
            └── 6. redirect("/reflect")
```

### Reward Purchase Flow

```
[RewardCard] → click "Redeem ($X.XX)"
    │
    └── purchaseReward(rewardId) [server action]
        │
        ├── 1. Verify reward exists + not purchased
        ├── 2. Compute balance: SUM(amount) FROM currency_transactions
        ├── 3. Validate balance >= price
        ├── 4. INSERT currency_transactions (amount: -price, source: 'reward_spend')
        ├── 5. UPDATE rewards SET purchased_at = now(), is_active = false
        └── 6. revalidatePath("/rewards", "/home", layout)
```

### Currency Balance Computation

```
Balance is NEVER stored. Always computed:

SELECT SUM(amount) FROM currency_transactions WHERE user_id = ?

Sources of positive transactions:
  - Goal completion: +2/+5/+10 cents (by difficulty)
  - Mood check-in: +2 cents
  - Reflection writing: +floor(words × 0.5) cents

Sources of negative transactions:
  - Reward purchase: -price cents
```

---

## 17. Business Logic Deep-Dive

### Currency Economics

| Action | Reward |
|---|---|
| Complete easy goal | $0.02 |
| Complete medium goal | $0.05 |
| Complete hard goal | $0.10 |
| Mood check-in | $0.02 |
| Write 100 words | $0.50 |
| Write 500 words | $2.50 |

**All values stored as integer cents** — no floating-point arithmetic for money.

### Preset Rewards

| Name | Emoji | Price |
|---|---|---|
| Coffee treat | ☕ | $7.00 (700 cents) |
| New book | 📚 | $10.00 (1000 cents) |
| Face mask | 🧖 | $5.00 (500 cents) |
| Movie night | 🎬 | $15.00 (1500 cents) |

### Mood Options

| Emoji | Label |
|---|---|
| 😊 | Happy |
| 😌 | Calm |
| 😔 | Sad |
| 😰 | Anxious |
| 😴 | Tired |
| 😤 | Frustrated |

### Writing Prompts (20 total)

Hardcoded in `writing-prompts.ts`. Examples:
- "What brought you joy today?"
- "How does your body feel right now?"
- "What's a boundary you're glad you set?"

4 random prompts shown at a time, with shuffle button.

### Streak Algorithm

```
computeStreak(currentStreak, lastActiveDate, timezone):
  today = date in user's timezone (YYYY-MM-DD)

  if lastActiveDate is null:
    return { newStreak: 1, todayStr: today }      // First ever

  if lastActiveDate === today:
    return { newStreak: currentStreak }             // Already counted today

  yesterday = yesterday's date in user's timezone
  if lastActiveDate === yesterday:
    return { newStreak: currentStreak + 1 }         // Consecutive!

  return { newStreak: 1 }                           // Gap — reset
```

**Timezone handling**: Uses `toLocaleDateString("en-CA", { timeZone })` — the `"en-CA"` locale produces ISO YYYY-MM-DD format. Applied to both "today" and "yesterday" calculations.

### Race Condition Prevention

Goal completion uses optimistic locking:

```sql
UPDATE goals
SET completed_at = '2026-02-03T...'
WHERE id = $1
  AND completed_at IS NULL    -- Only succeeds if still incomplete
RETURNING *;
```

If two concurrent requests race, only one gets a result — the other gets an error.

### Reward Auto-Activation

When creating a reward, the system checks if the user has any existing active (unpurchased) reward. If not, the new reward is automatically set as active:

```typescript
const { data: existing } = await supabase
  .from("rewards")
  .select("id")
  .eq("user_id", user.id)
  .eq("is_active", true)
  .is("purchased_at", null)
  .limit(1);

const isActive = !existing || existing.length === 0;
```

---

## 18. Architectural Decisions & Tradeoffs

### 1. `completed_at` Instead of `is_completed` Boolean
**Decision**: No boolean flag for goal completion status.
**Rationale**: `completed_at` is the single source of truth — it records *when* a goal was completed and doubles as a boolean check (`!== null`).
**Tradeoff**: Slightly more verbose null checks, but eliminates state sync issues.

### 2. Computed Balance (No Denormalized Column)
**Decision**: Balance is always `SUM(amount)` from `currency_transactions`.
**Rationale**: Append-only ledger pattern. No race conditions around balance updates.
**Tradeoff**: Every page that shows balance must query all transactions. Could become slow at scale (mitigated by `idx_currency_transactions_user_id_amount`).

### 3. Server Components by Default
**Decision**: All pages are Server Components. Client components only where interactivity is needed.
**Rationale**: Minimal JS shipped. Data fetching happens server-side with direct DB access.
**Tradeoff**: No client-side caching or optimistic updates. Every navigation re-fetches.

### 4. Server Actions Over API Routes
**Decision**: All mutations use Next.js Server Actions (`"use server"`). No REST API.
**Rationale**: Type-safe end-to-end, less boilerplate, automatic form integration.
**Tradeoff**: Tightly coupled to Next.js. Cannot be called from external clients.

### 5. No State Management Library
**Decision**: No Redux, Zustand, or Context providers.
**Rationale**: Server-driven architecture makes client state minimal. Local `useState` suffices.
**Tradeoff**: No cross-component state sharing. If needed, would require a provider.

### 6. Tailwind v4 with PostCSS
**Decision**: Using `@tailwindcss/postcss` (v4) instead of v3 config.
**Rationale**: Latest Tailwind with improved performance and CSS-first configuration.
**Note**: Theme tokens defined in CSS (`@theme inline`) rather than `tailwind.config.ts`.

### 7. React Compiler
**Decision**: `reactCompiler: true` in `next.config.ts`.
**Rationale**: Automatic memoization — no need for manual `useMemo`/`useCallback`.
**Tradeoff**: Experimental feature. May have edge cases.

### 8. Integer Cents for Currency
**Decision**: All monetary values stored as integer cents.
**Rationale**: Avoids floating-point precision issues (e.g., 0.1 + 0.2 ≠ 0.3).
**Tradeoff**: Must convert to/from dollars for display (`formatCurrency()`).

### 9. RLS for Authorization
**Decision**: Row Level Security on all tables enforces `auth.uid() = user_id`.
**Rationale**: Defense-in-depth. Even if application code has a bug, the DB won't leak data.
**Tradeoff**: Slightly more complex debugging. Must ensure RLS is enabled in test environments.

### 10. Timezone Strategy
**Decision**: Captured at signup, stored as IANA string, used server-side for streak/date calculations.
**Rationale**: Streaks and "today's goals" must respect the user's local day boundary.
**Tradeoff**: If a user travels, their timezone won't auto-update (unless stored value is still UTC, in which case `TimezoneSync` catches it).

---

## 19. Known Gaps & Placeholder Features

### Placeholder Menu Items (Non-Functional)

The Me page has 4 menu items that are rendered but do nothing:
- 📊 Goal history
- 📝 Reflection archive
- ❤️ Monthly summaries
- ⚙️ Settings

These are `<button>` elements with no `onClick` handler and no linked pages.

### No Test Suite

There are no test files (`*.test.ts`, `*.spec.ts`) or testing dependencies in `package.json`. No unit tests, integration tests, or E2E tests.

### No Error Boundaries

No React Error Boundary components. Server errors would show the default Next.js error page.

### No Loading States for Pages

No `loading.tsx` files in any route directory. Full-page navigations show no skeleton/spinner.

### No `not-found.tsx`

No custom 404 page. Uses Next.js default.

### Limited Validation

- Client-side: Only password match + length on signup
- Server-side: Basic null/empty checks. No sanitization beyond `.trim()`
- No rate limiting on server actions
- No CSRF protection beyond Next.js defaults

### Reflection Date Filtering Limitation

Today's reflections are filtered using `gte("created_at", startOfDay)` where `startOfDay = \`${today}T00:00:00\``. This assumes the server's timezone interpretation of the timestamp string matches the user's timezone — could have edge-case issues.

### No Pagination

Goals, transactions, reflections, and rewards queries have no `LIMIT`/`OFFSET`. All records are fetched at once. Could be a performance issue for power users.

### Currency Transaction Integrity

Purchases use two separate DB operations (insert transaction + update reward) without a database transaction. If the second operation fails, the user loses currency without getting the reward. This should use a Supabase RPC (stored procedure) or a single transaction.

### No Undo for Goal Completion

Once a goal is completed, it cannot be un-completed. The `completed_at` timestamp is set permanently. The completed goal is also not deletable.

### GoalFilters Timezone Mismatch

`GoalFilters` uses `new Date().toLocaleDateString("en-CA")` (browser timezone) while the server uses the profile's stored timezone. These could differ if the user has traveled or set a custom timezone.

---

*End of technical breakdown. All 44 source files and 3 SQL migrations have been read and documented.*
