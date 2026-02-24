-- Fix RLS init plan performance warning.
-- Replaces auth.uid() with (select auth.uid()) so Postgres evaluates the
-- function once per query instead of once per row.

-- profiles
drop policy "Users can view own profile" on public.profiles;
drop policy "Users can update own profile" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update own profile"
  on public.profiles for update
  using ((select auth.uid()) = id);


-- goals
drop policy "Users can view own goals" on public.goals;
drop policy "Users can insert own goals" on public.goals;
drop policy "Users can update own goals" on public.goals;
drop policy "Users can delete own goals" on public.goals;

create policy "Users can view own goals"
  on public.goals for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using ((select auth.uid()) = user_id);


-- currency_transactions
drop policy "Users can view own transactions" on public.currency_transactions;
drop policy "Users can insert own transactions" on public.currency_transactions;

create policy "Users can view own transactions"
  on public.currency_transactions for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own transactions"
  on public.currency_transactions for insert
  with check ((select auth.uid()) = user_id);


-- reflections
drop policy "Users can view own reflections" on public.reflections;
drop policy "Users can insert own reflections" on public.reflections;
drop policy "Users can update own reflections" on public.reflections;
drop policy "Users can delete own reflections" on public.reflections;

create policy "Users can view own reflections"
  on public.reflections for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own reflections"
  on public.reflections for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own reflections"
  on public.reflections for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own reflections"
  on public.reflections for delete
  using ((select auth.uid()) = user_id);


-- rewards
drop policy "Users can view own rewards" on public.rewards;
drop policy "Users can insert own rewards" on public.rewards;
drop policy "Users can update own rewards" on public.rewards;
drop policy "Users can delete own rewards" on public.rewards;

create policy "Users can view own rewards"
  on public.rewards for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert own rewards"
  on public.rewards for insert
  with check ((select auth.uid()) = user_id);

create policy "Users can update own rewards"
  on public.rewards for update
  using ((select auth.uid()) = user_id);

create policy "Users can delete own rewards"
  on public.rewards for delete
  using ((select auth.uid()) = user_id);
