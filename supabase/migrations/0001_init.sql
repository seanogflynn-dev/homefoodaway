-- HomeFoodAway v1 schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.

create extension if not exists postgis;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth.users, so we can show a contribution count
-- without exposing anything else from auth.users.
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  sightings_count int not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand text not null,
  category text not null,
  slug text not null unique,
  photo_url text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- locations
-- ---------------------------------------------------------------------------
create table if not exists locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city text not null,
  city_slug text not null,
  country text not null,
  lat double precision not null,
  lng double precision not null,
  geog geography(Point, 4326) generated always as (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) stored,
  store_type text not null default 'other' check (store_type in ('supermarket', 'specialty', 'independent', 'other')),
  created_at timestamptz not null default now()
);

create index if not exists locations_geog_idx on locations using gist (geog);
create index if not exists locations_city_slug_idx on locations (city_slug);

-- ---------------------------------------------------------------------------
-- sightings — the core table. One row = "this product was seen at this
-- location on this date."
-- ---------------------------------------------------------------------------
create table if not exists sightings (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  reported_by uuid references auth.users(id) on delete set null,
  reported_at timestamptz not null default now(),
  status text not null default 'confirmed' check (status in ('confirmed', 'reported', 'not_found')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists sightings_product_idx on sightings (product_id);
create index if not exists sightings_location_idx on sightings (location_id);
create index if not exists sightings_reported_at_idx on sightings (reported_at desc);

-- Bump the reporter's contribution count on insert.
create or replace function public.increment_sightings_count()
returns trigger as $$
begin
  if new.reported_by is not null then
    update public.profiles set sightings_count = sightings_count + 1 where id = new.reported_by;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_sighting_created on sightings;
create trigger on_sighting_created
  after insert on sightings
  for each row execute procedure public.increment_sightings_count();

-- ---------------------------------------------------------------------------
-- Row Level Security: everything is publicly readable (this is a public
-- directory), writes require an authenticated user.
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
alter table products enable row level security;
alter table locations enable row level security;
alter table sightings enable row level security;

create policy "profiles are publicly readable" on profiles for select using (true);

create policy "products are publicly readable" on products for select using (true);
create policy "authenticated users can add products" on products for insert
  to authenticated with check (true);

create policy "locations are publicly readable" on locations for select using (true);
create policy "authenticated users can add locations" on locations for insert
  to authenticated with check (true);

create policy "sightings are publicly readable" on sightings for select using (true);
create policy "authenticated users can add sightings" on sightings for insert
  to authenticated with check (auth.uid() = reported_by);
create policy "authenticated users can update sightings" on sightings for update
  to authenticated using (true) with check (true);
