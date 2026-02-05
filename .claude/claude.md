# Self-Care App - Claude Context

> **Quick Reference**: Essential context for Claude Code sessions working on this self-care tracking PWA

---

## Project Overview

A mobile-first **self-care tracking PWA** built for gamified habit tracking through goals, reflections, and rewards. Users earn virtual currency by completing goals and writing reflections, then spend it on real-life rewards they define.

**Current Status**: MVP complete (Phases 1-3). See `docs/DEVELOPMENT_ROADMAP.md` for what's next.

---

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, Server Components, React 19.2.3)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Auth**: Supabase Auth (email/password, OAuth ready)
- **Styling**: Tailwind CSS v4 (PostCSS plugin)
- **TypeScript**: Strict mode enabled
- **Font**: Currently DM Sans, transitioning to Fraunces (headings) + Epilogue (body)
- **React Compiler**: Enabled (auto-memoization, no manual `useMemo`/`useCallback`)

---

## Key Architecture Decisions

### Rendering Strategy
- **Server Components by default** - All pages and data-fetching components
- **Client Components** (`"use client"`) - Only for interactivity (forms, buttons, filters)
- **Server Actions** (`"use server"`) - All mutations, no API routes (except auth callback)

### Data Architecture
- **No centralized client state** - No Redux, Context, or Zustand
- Server Components fetch fresh data on each render
- Mutations use `revalidatePath()` for cache invalidation
- **Currency balance is computed** (never stored) - Always `SUM(amount)` from `currency_transactions`

### Database Conventions
- **Integer cents for all currency** - Never floats (700 = $7.00)
- **`completed_at` timestamp** instead of `is_completed` boolean (source of truth)
- **Append-only transactions** - `currency_transactions` has no UPDATE/DELETE
- **Row Level Security (RLS)** on all tables enforcing `auth.uid() = user_id`
- **Timezone-aware** - Stored as IANA string (e.g., "America/Edmonton")

---

## Development Conventions

### Code Patterns
- Use Server Components by default
- Mark Client Components with `"use client"` at the top
- Server Actions use `"use server"` directive
- All monetary values in **cents (integer)**
- Date strings in **"YYYY-MM-DD"** format
- Timestamps in **ISO 8601** format
- Use `revalidatePath()` after all mutations
- Path alias: `@/*` maps to `./src/*`

### Currency Handling
```typescript
// ALWAYS use cents
const reward = 250; // $2.50
import { formatCurrency } from "@/lib/currency";
formatCurrency(250); // "$2.50"
```

### Mutations Pattern
```typescript
"use server";

export async function completeGoal(goalId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. Update DB
  await supabase.from("goals").update({ completed_at: new Date().toISOString() })
    .eq("id", goalId).eq("user_id", user.id);

  // 2. Revalidate cache
  revalidatePath("/goals");
  revalidatePath("/home");
  revalidatePath("/", "layout"); // For header currency
}
```

---

## Project Structure

```
self-care-app/
├── src/
│   ├── app/
│   │   ├── globals.css                   # Tailwind v4 config
│   │   ├── layout.tsx                    # Root layout
│   │   ├── page.tsx                      # / → redirect to /home
│   │   ├── login/page.tsx                # Login (client)
│   │   ├── signup/page.tsx               # Signup (client)
│   │   ├── auth/callback/route.ts        # OAuth handler
│   │   └── (protected)/                  # Requires auth
│   │       ├── layout.tsx                # Header + BottomNav + TimezoneSync
│   │       ├── home/                     # Dashboard
│   │       ├── goals/                    # Goals CRUD
│   │       ├── reflect/                  # Mood + Writing
│   │       ├── rewards/                  # Rewards system
│   │       └── me/                       # Profile + stats
│   ├── components/
│   │   ├── nav/                          # Header, BottomNav
│   │   └── timezone-sync.tsx             # Auto-detect timezone
│   ├── lib/
│   │   ├── supabase/                     # Client/server/middleware
│   │   ├── currency.ts                   # formatCurrency, DIFFICULTY_REWARDS
│   │   ├── streak.ts                     # computeStreak, getToday
│   │   └── writing-prompts.ts            # Reflection prompts + earnings
│   └── types/index.ts                    # TypeScript types
├── supabase/migrations/                  # SQL migrations
├── docs/                                 # Documentation
└── .claude/                              # Claude Code config
```

---

## Reference Files

The `.claude/` folder contains reference materials and Claude Code configuration:

### Design System Reference
- **`component-library.html`** - Visual component library with live examples
  - Open in browser to see all UI components styled with Matcha palette
  - Includes: typography, buttons, badges, cards, navigation, inputs, color swatches
  - Use this when implementing new UI to match existing design patterns
  - Shows interactive states (hover, active, disabled)

### Mockups & Prototypes
- **`self-care-mockups-v6.jsx`** - Original React mockup/prototype
  - Reference for initial design vision and UX flows

### Configuration
- **`claude.md`** - This file (project context for Claude sessions)
- **`settings.local.json`** - Claude Code local settings (gitignored)
- **`plans/`** - Temporary plan files (gitignored)

**Quick Tip**: When implementing UI components, open `component-library.html` in your browser to see exactly how components should look and behave with the Matcha design system.

---

## Common Workflows

```bash
# Development
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # Run ESLint

# Git (examples)
git status
git add .
git commit -m "feat: add new feature"
```

---

## Database Schema Notes

### Tables
- `profiles` - User profiles (1:1 with `auth.users`)
- `goals` - User goals with difficulty, scheduling, completion tracking
- `currency_transactions` - Append-only ledger for all currency flow
- `reflections` - Mood check-ins and written reflections
- `rewards` - User-defined IRL rewards

### Important Patterns
- **All tables have RLS** - Enforces `auth.uid() = user_id`
- **No UPDATE/DELETE on transactions** - Append-only for integrity
- **Streaks tracked in profiles** - `current_streak`, `longest_streak`, `last_active_date`
- **Race condition protection** - Goal completion uses `WHERE completed_at IS NULL`

### Currency Flow
```
Earn:
  - Complete easy goal: +2 cents
  - Complete medium goal: +5 cents
  - Complete hard goal: +10 cents
  - Mood check-in: +2 cents
  - Write reflection: +0.5 cents per word

Spend:
  - Purchase reward: -price (e.g., -700 for $7.00 coffee)

Balance = SUM(amount) FROM currency_transactions
```

---

## Design System

**Palette**: Matcha (earthy greens, dusty rose, warm neutrals)

**Typography**:
- Headings: Fraunces (serif, warm, literary)
- Body: Epilogue (sans-serif, clean)

**Icons**:
- System UI: Phosphor Icons (outline default, filled when active)
- Personal content: Fluent Emoji (goals, rewards, mood)

**Layout**:
- Mobile-first, max-width 900px on desktop
- Bottom navigation (5 tabs: Home, Goals, Reflect, Rewards, Me)

**See**: `docs/design-system.json` for full specification, `.claude/component-library.html` for visual reference

---

## Important Gotchas

1. **Always use user's timezone** for date calculations (never assume UTC)
2. **Race conditions on goal completion** - Protected with `WHERE completed_at IS NULL`
3. **Reward purchase integrity bug** - Phase 4 will fix with atomic RPC (see roadmap)
4. **No pagination yet** - Will be needed for users with 100+ goals/reflections
5. **TimezoneSync component** - Runs once on mount to fix legacy UTC users
6. **Currency must be integers** - Never use floats (always cents)
7. **React Compiler enabled** - Don't manually memoize, it's automatic

---

## Reference Documentation

- **Full Technical Breakdown**: `docs/TECHNICAL_BREAKDOWN.md` (44 source files documented)
- **Development Roadmap**: `docs/DEVELOPMENT_ROADMAP.md` (Phases 4-9 planned)
- **Design System**: `docs/design-system.json` (Complete UI specification)

---

## Current Phase & Next Steps

**Completed**: Phases 1-3 (MVP - Auth, Goals, Reflections, Rewards, UI)

**Next Up** (Phase 4 - See roadmap):
1. Fix currency transaction integrity bug (atomic RPC)
2. Implement Me page views (goal history, reflection archive, settings)
3. Add loading states and error boundaries
4. Polish and fill core gaps

**Future**: Cat system (Phase 5), Bundles (Phase 6), Advanced features (Phase 7+)

---

## Development Notes

- **Git commits use**: `feat:`, `fix:`, `docs:`, `refactor:` prefixes
- **All code is strict TypeScript** - No `any` types
- **Mobile-first approach** - Test on mobile viewport first
- **Keep it simple** - Avoid over-engineering, premature optimization
- **Server-first** - Fetch data server-side, minimize client JS
- **Security** - RLS protects all data, never trust client input

---

## Quick Tips for Claude Sessions

- Check `docs/TECHNICAL_BREAKDOWN.md` for complete file inventory
- Check `docs/DEVELOPMENT_ROADMAP.md` for planned features
- Check `docs/design-system.json` for UI/UX specifications
- Always use timezone-aware date functions from `lib/streak.ts`
- Currency formatting: Use `formatCurrency()` from `lib/currency.ts`
- New migrations: Create in `supabase/migrations/` with timestamp prefix
- Revalidate paths after mutations to bust Next.js cache
- Test with multiple users to verify RLS policies work correctly
