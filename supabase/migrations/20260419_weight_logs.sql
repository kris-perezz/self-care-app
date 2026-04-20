create table weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight_lbs numeric(5, 1) not null check (weight_lbs > 0 and weight_lbs < 1000),
  logged_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table weight_logs enable row level security;

create policy "Users manage own weight logs"
  on weight_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index weight_logs_user_date_idx on weight_logs (user_id, logged_date desc);

create unique index weight_logs_user_date_unique on weight_logs (user_id, logged_date);
