-- SUPERPAY/TIPHIVE: one wallet profile table for fans + creators.
-- Run in Supabase SQL editor.
-- Goal:
--   wallet connects -> user_profiles row
--   fan edits same row
--   creator mode updates same row
--   public URL is /profile/:username
--   no duplicate profile identity data in creators table

create extension if not exists pgcrypto;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  wallet_address text not null unique,
  username text unique,
  display_name text,
  bio text not null default '',
  avatar_url text,
  social_links jsonb not null default '{}'::jsonb,
  is_creator boolean not null default false,
  creator_category text,
  creator_description text,
  portfolio_link text,
  total_earned numeric not null default 0,
  verified_on_chain boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_wallet_format check (wallet_address ~ '^0x[a-f0-9]{40}$'),
  constraint user_profiles_username_format check (username is null or username ~ '^[a-z0-9_]{3,24}$')
);

alter table public.user_profiles add column if not exists username text;
alter table public.user_profiles add column if not exists display_name text;
alter table public.user_profiles add column if not exists bio text not null default '';
alter table public.user_profiles add column if not exists avatar_url text;
alter table public.user_profiles add column if not exists social_links jsonb not null default '{}'::jsonb;
alter table public.user_profiles add column if not exists is_creator boolean not null default false;
alter table public.user_profiles add column if not exists creator_category text;
alter table public.user_profiles add column if not exists creator_description text;
alter table public.user_profiles add column if not exists portfolio_link text;
alter table public.user_profiles add column if not exists total_earned numeric not null default 0;
alter table public.user_profiles add column if not exists verified_on_chain boolean not null default true;
alter table public.user_profiles add column if not exists created_at timestamptz not null default now();
alter table public.user_profiles add column if not exists updated_at timestamptz not null default now();

-- Old previous migration columns are no longer used by the app.
alter table public.user_profiles drop column if exists profile_picture_url;
alter table public.user_profiles drop column if exists creator_address;

create index if not exists idx_user_profiles_wallet on public.user_profiles(wallet_address);
create index if not exists idx_user_profiles_is_creator on public.user_profiles(is_creator);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();

-- Backfill old creators table into the one profile table, if your previous DB has creators.
do $$
begin
  if to_regclass('public.creators') is not null then
    insert into public.user_profiles (
      wallet_address,
      username,
      display_name,
      bio,
      avatar_url,
      is_creator,
      creator_category,
      creator_description,
      portfolio_link,
      total_earned,
      verified_on_chain
    )
    select
      lower(address),
      lower(regexp_replace(coalesce(username, 'user_' || substring(lower(address), 3, 8)), '[^a-z0-9_]', '_', 'g')),
      coalesce(name, 'User ' || substring(lower(address), 3, 6)),
      coalesce(bio, ''),
      avatar_url,
      true,
      category,
      coalesce(bio, ''),
      link,
      coalesce(total_earned, 0),
      true
    from public.creators
    on conflict (wallet_address) do update set
      username = coalesce(public.user_profiles.username, excluded.username),
      display_name = coalesce(public.user_profiles.display_name, excluded.display_name),
      bio = case
        when public.user_profiles.bio is null or public.user_profiles.bio = '' then excluded.bio
        else public.user_profiles.bio
      end,
      avatar_url = coalesce(public.user_profiles.avatar_url, excluded.avatar_url),
      is_creator = true,
      creator_category = coalesce(public.user_profiles.creator_category, excluded.creator_category),
      creator_description = coalesce(public.user_profiles.creator_description, excluded.creator_description),
      portfolio_link = coalesce(public.user_profiles.portfolio_link, excluded.portfolio_link),
      total_earned = greatest(coalesce(public.user_profiles.total_earned, 0), coalesce(excluded.total_earned, 0)),
      updated_at = now();
  end if;
end $$;

-- Fill missing usernames/display names for any wallet rows created before username existed.
update public.user_profiles
set
  username = coalesce(username, 'user_' || substring(wallet_address, 3, 8)),
  display_name = coalesce(display_name, 'User ' || substring(wallet_address, 3, 6)),
  avatar_url = coalesce(avatar_url, 'https://api.dicebear.com/9.x/shapes/svg?seed=' || wallet_address)
where username is null or display_name is null or avatar_url is null;

-- Repair duplicate usernames before adding the unique index.
with ranked_profiles as (
  select
    id,
    username,
    wallet_address,
    row_number() over (partition by username order by created_at, wallet_address) as username_rank
  from public.user_profiles
)
update public.user_profiles profile
set username = left(ranked.username, 15) || '_' || substring(ranked.wallet_address, 3, 8)
from ranked_profiles ranked
where profile.id = ranked.id
  and ranked.username_rank > 1;

create unique index if not exists idx_user_profiles_username_unique on public.user_profiles(username) where username is not null;

-- Make username required after backfill.
alter table public.user_profiles alter column username set not null;
alter table public.user_profiles alter column display_name set not null;

-- Make existing activity tables point to user_profiles where possible.
-- This removes old creator-table foreign keys without needing to know their names.
do $$
declare
  constraint_record record;
begin
  if to_regclass('public.creators') is not null then
    for constraint_record in
      select conrelid::regclass as table_name, conname
      from pg_constraint
      where contype = 'f'
        and confrelid = 'public.creators'::regclass
    loop
      execute format('alter table %s drop constraint if exists %I', constraint_record.table_name, constraint_record.conname);
    end loop;
  end if;
end $$;

-- Do NOT foreign-key activity wallet columns to user_profiles.
-- Tips/subscriptions are blockchain/backend operations and store wallet addresses.
-- Some wallets may have sent tips before ever connecting to the app, so forcing
-- from_address/fan_address into user_profiles breaks historical data.
do $$
begin
  if to_regclass('public.tips') is not null then
    alter table public.tips drop constraint if exists tips_from_profile_fkey;
    alter table public.tips drop constraint if exists tips_to_profile_fkey;
  end if;

  if to_regclass('public.subscriptions') is not null then
    alter table public.subscriptions drop constraint if exists subscriptions_fan_profile_fkey;
    alter table public.subscriptions drop constraint if exists subscriptions_creator_profile_fkey;
  end if;

  if to_regclass('public.subscription_plans') is not null then
    alter table public.subscription_plans drop constraint if exists subscription_plans_creator_profile_fkey;
  end if;
end $$;

-- Existing app calls this RPC after tips/subscriptions.
create or replace function public.increment_creator_earned(
  creator_address text,
  amount_to_add numeric
)
returns void
language plpgsql
as $$
begin
  update public.user_profiles
  set total_earned = coalesce(total_earned, 0) + amount_to_add
  where wallet_address = lower(creator_address);
end;
$$;

alter table public.user_profiles enable row level security;

drop policy if exists "Profiles are publicly readable" on public.user_profiles;
create policy "Profiles are publicly readable"
on public.user_profiles
for select
using (true);

-- Writes are done through Next.js API routes with SUPABASE_SERVICE_ROLE_KEY.
-- For local dev, make sure .env.local has SUPABASE_SERVICE_ROLE_KEY.

-- Optional cleanup after you verify the app:
--   drop table public.creators;
-- Keep it until you are sure no old Supabase views/functions still depend on it.
