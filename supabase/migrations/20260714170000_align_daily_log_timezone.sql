alter table public.profiles
  alter column timezone drop default,
  alter column timezone drop not null;

comment on column public.profiles.timezone is
  'Canonical IANA timezone for the user calendar. New profiles initialize this from the browser during onboarding.';

do $$
begin
  if exists (
    select 1
    from public.profiles as p
    where p.timezone is not null
      and not exists (
        select 1
        from pg_catalog.pg_timezone_names as tz
        where tz.name = p.timezone
      )
  ) then
    raise exception 'public.profiles contains a timezone that is not a recognized IANA timezone.';
  end if;
end;
$$;

create or replace function public.validate_profile_timezone()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.timezone is not null
    and not exists (
      select 1
      from pg_catalog.pg_timezone_names as tz
      where tz.name = new.timezone
    )
  then
    raise exception 'Profile timezone must be a recognized IANA timezone.' using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger profiles_validate_timezone
  before insert or update of timezone on public.profiles
  for each row execute function public.validate_profile_timezone();

create or replace function public.reject_future_daily_log_date()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  owner_timezone text;
  owner_today date;
begin
  select p.timezone
  into owner_timezone
  from public.profiles as p
  where p.id = new.user_id;

  if owner_timezone is null then
    raise exception 'A profile with a valid timezone is required before saving daily logs.' using errcode = '23514';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_timezone_names as tz
    where tz.name = owner_timezone
  ) then
    raise exception 'The daily log owner has an invalid profile timezone.' using errcode = '22023';
  end if;

  owner_today := (pg_catalog.statement_timestamp() at time zone owner_timezone)::date;

  if new.log_date > owner_today then
    raise exception 'Daily log dates cannot be in the future for the profile timezone.' using errcode = '22007';
  end if;

  return new;
end;
$$;
