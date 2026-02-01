-- ============================================
-- Self Care App: Database Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. PROFILES TABLE
-- Extends auth.users with app-specific data.
-- Currency balance is NOT stored here — it's computed from currency_transactions.
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
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
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Backfill profiles for any existing users
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do nothing;


-- 2. GOALS TABLE
create table public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  is_completed boolean not null default false,
  currency_reward integer not null default 10,
  created_at timestamptz not null default now(),
  completed_at timestamptz
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
