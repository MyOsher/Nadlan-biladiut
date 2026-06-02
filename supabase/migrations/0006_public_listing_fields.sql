-- 0006_public_listing_fields.sql
-- Phase 1 of the public-website rollout: mark which properties may appear on the
-- external site and expose a clean, public-safe slug + marketing description.
--
-- IMPORTANT: the public website must NOT read the base `properties` table with the
-- anon key (RLS is still "open access", so it would also return ת"ז, חתימות,
-- עמלות, גוש/חלקה וכו'). The external site reads through the `public-listings`
-- Edge Function instead, which returns marketing fields only. These columns just
-- let the agent control what is published and under which URL.

alter table public.properties
  add column if not exists is_published boolean not null default false,
  add column if not exists public_slug text,
  add column if not exists public_description text;

-- Backfill a short, URL-safe slug derived from the id for existing rows.
update public.properties
  set public_slug = left(replace(id::text, '-', ''), 10)
  where public_slug is null or public_slug = '';

create unique index if not exists properties_public_slug_idx
  on public.properties (public_slug);

create index if not exists properties_is_published_idx
  on public.properties (is_published);

-- Auto-assign a slug to new rows when one is not provided.
create or replace function public.set_public_slug()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.public_slug is null or new.public_slug = '' then
    new.public_slug := left(replace(new.id::text, '-', ''), 10);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_properties_public_slug on public.properties;
create trigger trg_properties_public_slug
  before insert on public.properties
  for each row execute function public.set_public_slug();
