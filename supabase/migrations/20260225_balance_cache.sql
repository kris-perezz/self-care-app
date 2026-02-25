-- ============================================
-- Add cached balance column to profiles
--
-- Architecture:
--   currency_transactions = source of truth / audit log (unchanged)
--   profiles.balance      = cached current balance, kept in sync by trigger
--
-- This eliminates the getBalance() SUM() query on every page render.
-- Pages read profiles.balance directly as part of the profile row they
-- already fetch.
-- ============================================

-- 1. Add balance column to profiles
alter table public.profiles
  add column balance integer not null default 0;

-- 2. Backfill balance for all existing users from current transactions
update public.profiles p
set balance = coalesce((
  select sum(amount)
  from public.currency_transactions ct
  where ct.user_id = p.id
), 0);

-- 3. Trigger function: increment/decrement balance on every transaction insert
create or replace function public.update_profile_balance()
returns trigger as $$
begin
  update public.profiles
  set balance = balance + NEW.amount
  where id = NEW.user_id;
  return NEW;
end;
$$ language plpgsql security definer;

-- 4. Attach trigger to currency_transactions
create trigger on_transaction_inserted
  after insert on public.currency_transactions
  for each row execute function public.update_profile_balance();
