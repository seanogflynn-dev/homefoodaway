export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  slug: string;
  photo_url: string | null;
};

export type Location = {
  id: string;
  name: string;
  address: string;
  city: string;
  city_slug: string;
  country: string;
  lat: number;
  lng: number;
  store_type: "supermarket" | "specialty" | "independent" | "other";
};

export type Sighting = {
  id: string;
  product_id: string;
  location_id: string;
  reported_by: string | null;
  reported_at: string; // ISO timestamp
  status: "confirmed" | "reported" | "not_found";
  note: string | null;
};

export type SightingWithJoins = Sighting & {
  product: Product;
  location: Location;
};

/**
 * A sighting is considered "fresh" if it (or its most recent confirmation)
 * happened within this many days. Anything older is shown as "unconfirmed"
 * rather than a solid checkmark — this is the freshness signal none of the
 * existing directories provide.
 */
export const STALENESS_THRESHOLD_DAYS = 180;

export function sightingFreshness(reportedAt: string): "fresh" | "stale" {
  const days = (Date.now() - new Date(reportedAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= STALENESS_THRESHOLD_DAYS ? "fresh" : "stale";
}
