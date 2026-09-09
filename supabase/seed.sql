-- Seed data mirroring src/lib/mockData.ts, for a real Supabase project.
-- Run after 0001_init.sql. Safe to re-run (uses ON CONFLICT DO NOTHING on slug/name).

insert into products (name, brand, category, slug) values
  ('Salted Butter', 'Kerrygold', 'Dairy', 'kerrygold-salted-butter'),
  ('Cheese & Onion Crisps', 'Tayto', 'Snacks', 'tayto-cheese-onion'),
  ('Tea Bags', 'Barry''s Tea', 'Beverages', 'barrys-tea-bags'),
  ('Draught Stout', 'Guinness', 'Beverages', 'guinness-draught'),
  ('Fig Rolls', 'Jacob''s', 'Biscuits', 'jacobs-fig-rolls'),
  ('Black Pudding', 'Clonakilty', 'Meat', 'clonakilty-black-pudding'),
  ('White Pudding', 'Clonakilty', 'Meat', 'clonakilty-white-pudding'),
  ('Loose Leaf Tea', 'Lyons', 'Beverages', 'lyons-tea'),
  ('Irish Rashers (Back Bacon)', 'O''Neills', 'Meat', 'oneills-rashers'),
  ('Soda Bread Mix', 'Odlums', 'Bakery', 'odlums-soda-bread-mix'),
  ('Digestive Biscuits', 'McVitie''s', 'Biscuits', 'mcvities-digestives'),
  ('Sausages', 'Denny', 'Meat', 'denny-sausages')
on conflict (slug) do nothing;

-- NOTE: coordinates below are approximate neighborhood-level placeholders.
-- Re-geocode every address with the Google Places API before relying on
-- distance-based search, and confirm each store still carries what's
-- listed here before launch — this is seed/demo content, not verified
-- live inventory.
insert into locations (name, address, city, city_slug, country, lat, lng, store_type) values
  ('Woodside Grocery', '3971 61st St, Woodside, NY 11377', 'New York City', 'new-york-city', 'USA', 40.7440, -73.9057, 'specialty'),
  ('Prime Cuts Irish Butchers', 'Woodlawn, Bronx, NY', 'New York City', 'new-york-city', 'USA', 40.8973, -73.8663, 'specialty'),
  ('The Butcher Block', 'Queens, NY', 'New York City', 'new-york-city', 'USA', 40.7282, -73.7949, 'specialty'),
  ('Tara Market (Tara Rose & Mor)', 'New York, NY', 'New York City', 'new-york-city', 'USA', 40.7128, -74.0060, 'specialty');

-- Sample sightings linking the seed products to the seed locations.
-- reported_by is left null (system-seeded, not a real user report).
insert into sightings (product_id, location_id, reported_at, status, note)
select p.id, l.id, now() - interval '12 days', 'confirmed', null
from products p, locations l
where p.slug = 'kerrygold-salted-butter' and l.name = 'Woodside Grocery';

insert into sightings (product_id, location_id, reported_at, status, note)
select p.id, l.id, now() - interval '40 days', 'confirmed', 'Also had the Salt & Vinegar flavor'
from products p, locations l
where p.slug = 'tayto-cheese-onion' and l.name = 'Woodside Grocery';

insert into sightings (product_id, location_id, reported_at, status, note)
select p.id, l.id, now() - interval '5 days', 'confirmed', null
from products p, locations l
where p.slug = 'clonakilty-black-pudding' and l.name = 'Prime Cuts Irish Butchers';

insert into sightings (product_id, location_id, reported_at, status, note)
select p.id, l.id, now() - interval '5 days', 'confirmed', null
from products p, locations l
where p.slug = 'oneills-rashers' and l.name = 'Prime Cuts Irish Butchers';

insert into sightings (product_id, location_id, reported_at, status, note)
select p.id, l.id, now() - interval '200 days', 'confirmed', 'Past the freshness window — reconfirm'
from products p, locations l
where p.slug = 'clonakilty-white-pudding' and l.name = 'The Butcher Block';

insert into sightings (product_id, location_id, reported_at, status, note)
select p.id, l.id, now() - interval '2 days', 'confirmed', null
from products p, locations l
where p.slug = 'barrys-tea-bags' and l.name = 'Tara Market (Tara Rose & Mor)';

insert into sightings (product_id, location_id, reported_at, status, note)
select p.id, l.id, now() - interval '2 days', 'confirmed', null
from products p, locations l
where p.slug = 'guinness-draught' and l.name = 'Tara Market (Tara Rose & Mor)';
