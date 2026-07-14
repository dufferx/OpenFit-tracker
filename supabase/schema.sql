create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'OpenFit user',
  calorie_target integer not null default 2000 check (calorie_target between 500 and 15000),
  protein_target numeric(6,2) not null default 150 check (protein_target between 0 and 1000),
  target_weight numeric(5,2) check (target_weight between 20 and 400),
  target_body_fat numeric(5,2) check (target_body_fat between 1 and 70),
  theme text not null default 'system' check (theme in ('light','dark','system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  calories_consumed integer not null check (calories_consumed between 0 and 15000),
  protein_grams numeric(6,2) not null check (protein_grams between 0 and 1000),
  total_calories_burned integer not null check (total_calories_burned between 0 and 15000),
  weight_kg numeric(5,2) check (weight_kg between 20 and 400),
  body_fat_percentage numeric(5,2) check (body_fat_percentage between 1 and 70),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, log_date)
);

alter table public.profiles enable row level security;
alter table public.daily_logs enable row level security;
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own logs" on public.daily_logs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
