import type { Location, Product, Sighting } from "./types";

/**
 * Seed / demo data used when Supabase isn't configured yet, and as the
 * starting point for the real `products` seed migration once it is.
 *
 * Curated list of well-known Irish brands — deliberately not exhaustive.
 * Expand this list as you seed more cities, but resist trying to be a full
 * catalog on day one (see the v1 build plan).
 */
export const mockProducts: Product[] = [
  { id: "p1", name: "Salted Butter", brand: "Kerrygold", category: "Dairy", slug: "kerrygold-salted-butter", photo_url: null },
  { id: "p2", name: "Cheese & Onion Crisps", brand: "Tayto", category: "Snacks", slug: "tayto-cheese-onion", photo_url: null },
  { id: "p3", name: "Tea Bags", brand: "Barry's Tea", category: "Beverages", slug: "barrys-tea-bags", photo_url: null },
  { id: "p4", name: "Draught Stout", brand: "Guinness", category: "Beverages", slug: "guinness-draught", photo_url: null },
  { id: "p5", name: "Fig Rolls", brand: "Jacob's", category: "Biscuits", slug: "jacobs-fig-rolls", photo_url: null },
  { id: "p6", name: "Black Pudding", brand: "Clonakilty", category: "Meat", slug: "clonakilty-black-pudding", photo_url: null },
  { id: "p7", name: "White Pudding", brand: "Clonakilty", category: "Meat", slug: "clonakilty-white-pudding", photo_url: null },
  { id: "p8", name: "Loose Leaf Tea", brand: "Lyons", category: "Beverages", slug: "lyons-tea", photo_url: null },
  { id: "p9", name: "Irish Rashers (Back Bacon)", brand: "O'Neills", category: "Meat", slug: "oneills-rashers", photo_url: null },
  { id: "p10", name: "Soda Bread Mix", brand: "Odlums", category: "Bakery", slug: "odlums-soda-bread-mix", photo_url: null },
  { id: "p11", name: "Digestive Biscuits", brand: "McVitie's", category: "Biscuits", slug: "mcvities-digestives", photo_url: null },
  { id: "p12", name: "Sausages", brand: "Denny", category: "Meat", slug: "denny-sausages", photo_url: null },
];

/**
 * Launch city: New York City. Chosen for a large, reachable Irish diaspora
 * (active GAA clubs, Irish community groups) — see the v1 build plan's
 * cold-start strategy.
 *
 * These four locations are real, published businesses (sourced via public
 * store listings — see the citations in the accompanying research), but
 * treat the coordinates as approximate neighborhood-level placeholders:
 * before going live, re-geocode every address with the Google Places API
 * and have someone confirm current hours/stock in person.
 */
export const mockLocations: Location[] = [
  {
    id: "l1",
    name: "Woodside Grocery",
    address: "3971 61st St, Woodside, NY 11377",
    city: "New York City",
    city_slug: "new-york-city",
    country: "USA",
    lat: 40.744,
    lng: -73.9057,
    store_type: "specialty",
  },
  {
    id: "l2",
    name: "Prime Cuts Irish Butchers",
    address: "Woodlawn, Bronx, NY",
    city: "New York City",
    city_slug: "new-york-city",
    country: "USA",
    lat: 40.8973,
    lng: -73.8663,
    store_type: "specialty",
  },
  {
    id: "l3",
    name: "The Butcher Block",
    address: "Queens, NY",
    city: "New York City",
    city_slug: "new-york-city",
    country: "USA",
    lat: 40.7282,
    lng: -73.7949,
    store_type: "specialty",
  },
  {
    id: "l4",
    name: "Tara Market (Tara Rose & Mor)",
    address: "New York, NY",
    city: "New York City",
    city_slug: "new-york-city",
    country: "USA",
    lat: 40.7128,
    lng: -74.006,
    store_type: "specialty",
  },
];

const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const mockSightings: Sighting[] = [
  { id: "s1", product_id: "p1", location_id: "l1", reported_by: null, reported_at: daysAgo(12), status: "confirmed", note: null },
  { id: "s2", product_id: "p2", location_id: "l1", reported_by: null, reported_at: daysAgo(40), status: "confirmed", note: "Also had the Salt & Vinegar flavor" },
  { id: "s3", product_id: "p6", location_id: "l2", reported_by: null, reported_at: daysAgo(5), status: "confirmed", note: null },
  { id: "s4", product_id: "p9", location_id: "l2", reported_by: null, reported_at: daysAgo(5), status: "confirmed", note: null },
  { id: "s5", product_id: "p7", location_id: "l3", reported_by: null, reported_at: daysAgo(200), status: "confirmed", note: "May want to reconfirm — this is past the freshness window" },
  { id: "s6", product_id: "p3", location_id: "l4", reported_by: null, reported_at: daysAgo(2), status: "confirmed", note: null },
  { id: "s7", product_id: "p4", location_id: "l4", reported_by: null, reported_at: daysAgo(2), status: "confirmed", note: null },
];

export const mockCities = [
  { name: "New York City", slug: "new-york-city", country: "USA" },
];
