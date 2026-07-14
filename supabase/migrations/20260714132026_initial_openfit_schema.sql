create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'OpenFit user',
  calorie_target integer not null default 2000 check (calorie_target between 500 and 15000),
  protein_target numeric(6, 2) not null default 150 check (protein_target between 0 and 1000),
  target_weight numeric(5, 2) check (target_weight between 20 and 400),
  target_body_fat numeric(5, 2) check (target_body_fat between 1 and 70),
  theme text not null default 'system' check (theme in ('light', 'dark', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  log_date date not null,
  calories_consumed integer not null check (calories_consumed between 0 and 15000),
  protein_grams numeric(6, 2) not null check (protein_grams between 0 and 1000),
  total_calories_burned integer not null check (total_calories_burned between 0 and 15000),
  weight_kg numeric(5, 2) check (weight_kg between 20 and 400),
  body_fat_percentage numeric(5, 2) check (body_fat_percentage between 1 and 70),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_logs_user_log_date_key unique (user_id, log_date)
);

create index daily_logs_user_log_date_desc_idx
  on public.daily_logs (user_id, log_date desc);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;

revoke all on table public.profiles from anon;
revoke all on table public.daily_logs from anon;
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.daily_logs to authenticated;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Users can delete their own profile"
  on public.profiles for delete
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can read their own daily logs"
  on public.daily_logs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own daily logs"
  on public.daily_logs for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own daily logs"
  on public.daily_logs for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own daily logs"
  on public.daily_logs for delete
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger daily_logs_set_updated_at
  before update on public.daily_logs
  for each row execute function public.set_updated_at();

create or replace function public.reject_future_daily_log_date()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.log_date > (now() at time zone 'UTC')::date then
    raise exception 'Daily log dates cannot be in the future.' using errcode = '22007';
  end if;
  return new;
end;
$$;

create trigger daily_logs_reject_future_date
  before insert or update of log_date on public.daily_logs
  for each row execute function public.reject_future_daily_log_date();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(split_part(new.email, '@', 1), ''),
      'OpenFit user'
    )
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
