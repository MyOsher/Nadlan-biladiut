-- 0001_init_real_estate_schema.sql
-- Core schema for the real-estate property manager.

create type deal_type as enum ('sale','rent');
create type property_status as enum ('active','sold','rented','expired','cancelled','draft');
create type media_type as enum ('image','video');

-- Single-row agent settings
create table public.app_settings (
  id int primary key default 1,
  agent_name text default 'שמואל זקן',
  agent_id_number text,
  agent_email text,
  agent_phone text,
  default_sale_fee_percent numeric default 2,
  default_rent_fee_text text default 'שווי של חודש שכירות',
  reminder_days int[] default '{14,7,3,1}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into public.app_settings (id) values (1) on conflict do nothing;

-- Properties (one per signed exclusivity agreement)
create table public.properties (
  id uuid primary key default gen_random_uuid(),
  form_number text,
  agent_name text,
  agent_id_number text,
  deal_type deal_type not null default 'sale',
  status property_status not null default 'active',
  property_type text,
  rooms numeric,
  size_sqm numeric,
  floor text,
  property_address text,
  city text,
  block text,        -- גוש
  parcel text,       -- חלקה
  sub_parcel text,   -- תת חלקה
  asking_price numeric,
  owner_name text,
  exclusivity_start date,
  exclusivity_end date,
  fee_sale_percent numeric default 2,
  fee_rent_text text,
  agreement_date date,
  notes text,
  owner_signature text,        -- digital signature data URL
  agent_signature text,
  signed_digitally_at timestamptz,
  signed_form_url text,        -- uploaded scan of signed agreement
  cover_image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index properties_exclusivity_end_idx on public.properties (exclusivity_end);
create index properties_status_idx on public.properties (status);

-- Owners / clients listed on the agreement (form supports up to 2, schema allows many)
create table public.property_owners (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  full_name text,
  id_number text,   -- ת.ז
  phone text,
  address text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index property_owners_property_id_idx on public.property_owners(property_id);

-- Photos and videos
create table public.property_media (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  type media_type not null,
  storage_path text not null,
  url text,
  caption text,
  sort_order int default 0,
  created_at timestamptz default now()
);
create index property_media_property_id_idx on public.property_media(property_id);

-- Keep updated_at fresh
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

create trigger trg_properties_updated before update on public.properties
for each row execute function public.set_updated_at();
create trigger trg_settings_updated before update on public.app_settings
for each row execute function public.set_updated_at();
