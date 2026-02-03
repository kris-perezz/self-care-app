-- ============================================
-- Self Care App: Database Schema (current as of Phase 3)
-- This file documents the current database state.
-- For actual migrations, see:
--   - 20260201_phase2_refactor.sql (Phase 2)
--   - 20260202_phase3.sql (Phase 3)
-- ============================================

-- 1. PROFILES TABLE
-- Extends auth.users with app-specific data.
-- Currency balance is NOT stored here — it's computed from currency_transactions.
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  timezone text not null default 'UTC',  -- IANA timezone (e.g., 'America/Edmonton')
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_active_date date,                 -- last date a goal was completed (user's timezone)
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
-- Reads timezone from raw_user_meta_data passed during signUp()
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, timezone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'timezone', 'UTC')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any existing users
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;


-- 2. GOALS TABLE
-- completed_at is null for incomplete goals, has timestamp when completed.
-- There is no is_completed boolean — completed_at is the single source of truth.
-- currency_reward is auto-set from difficulty: easy=2, medium=5, hard=10 (cents).
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  difficulty text not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  currency_reward integer not null default 5,
  scheduled_time time,              -- optional time of day (e.g., '08:00')
  scheduled_date date,              -- optional date for filtering (Today/This week/All)
  created_at timestamptz not null default now(),
  completed_at timestamptz          -- null = incomplete, has value = completed
);

alter table public.goals enable row level security;

create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

-- Performance indexes
create index idx_goals_user_id on public.goals (user_id);
create index idx_goals_user_id_created_at on public.goals (user_id, created_at);
create index idx_goals_user_id_scheduled_date on public.goals (user_id, scheduled_date);


-- 3. CURRENCY TRANSACTIONS TABLE
-- This is the single source of truth for currency balance.
-- Balance = SUM(amount) for a given user.
-- Positive amounts = earned (goal completion, reflection).
-- Negative amounts = spent (rewards).
create table public.currency_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  amount integer not null,
  source text not null check (source in ('goal', 'reflection', 'reward_spend')),
  reference_id uuid,
  created_at timestamptz not null default now()
);

alter table public.currency_transactions enable row level security;

create policy "Users can view own transactions"
  on public.currency_transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.currency_transactions for insert
  with check (auth.uid() = user_id);

-- Performance indexes
create index idx_currency_transactions_user_id_amount on public.currency_transactions (user_id, amount);
create index idx_currency_transactions_user_id_created_at on public.currency_transactions (user_id, created_at);


-- 4. REFLECTIONS TABLE (Phase 3)
-- Journal entries, mood check-ins, and prompted/free writing.
-- currency_earned stores cents earned for this particular entry.
create table public.reflections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  type text not null check (type in ('mood', 'prompted', 'freewrite')),
  mood text,                        -- emoji/label for mood check-ins
  prompt text,                      -- the writing prompt used (null for freewrite/mood)
  content text not null default '', -- journal entry text
  word_count integer not null default 0,
  currency_earned integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.reflections enable row level security;

create policy "Users can view own reflections"
  on public.reflections for select
  using (auth.uid() = user_id);

create policy "Users can insert own reflections"
  on public.reflections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reflections"
  on public.reflections for update
  using (auth.uid() = user_id);

create policy "Users can delete own reflections"
  on public.reflections for delete
  using (auth.uid() = user_id);

create index idx_reflections_user_id_created_at on public.reflections (user_id, created_at);


-- 5. REWARDS TABLE (Phase 3)
-- User-created IRL rewards they're saving toward.
-- Progress = current balance / price. One reward can be "active" (shown on home).
-- When purchased, purchased_at is set and a negative currency_transaction is created.
create table public.rewards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text not null default '🎁',
  price integer not null,           -- price in cents (e.g., 700 = $7.00)
  is_active boolean not null default false,
  purchased_at timestamptz,         -- null = still saving, set = purchased
  created_at timestamptz not null default now()
);

alter table public.rewards enable row level security;

create policy "Users can view own rewards"
  on public.rewards for select
  using (auth.uid() = user_id);

create policy "Users can insert own rewards"
  on public.rewards for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rewards"
  on public.rewards for update
  using (auth.uid() = user_id);

create policy "Users can delete own rewards"
  on public.rewards for delete
  using (auth.uid() = user_id);

create index idx_rewards_user_id_is_active on public.rewards (user_id, is_active);
