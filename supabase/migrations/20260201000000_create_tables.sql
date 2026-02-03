-- ============================================
-- Self Care App: Database Schema (current as of Phase 2)
-- This file documents the current database state.
-- For the actual migration that was run, see 20260201_phase2_refactor.sql
-- ============================================

-- 1. PROFILES TABLE
-- Extends auth.users with app-specific data.
-- Currency balance is NOT stored here — it's computed from currency_transactions.
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  timezone text not null default 'UTC',  -- IANA timezone (e.g., 'America/Edmonton')
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
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  currency_reward integer not null default 10,
  created_at timestamptz not null default now(),
  completed_at timestamptz  -- null = incomplete, has value = completed
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
