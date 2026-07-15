alter table public.profiles
  alter column calorie_target drop default,
  alter column calorie_target drop not null,
  alter column protein_target drop default,
  alter column protein_target drop not null,
  add column timezone text not null default 'UTC';

comment on column public.profiles.timezone is
  'IANA timezone name reported by the user browser, used for future calendar-date behavior.';
