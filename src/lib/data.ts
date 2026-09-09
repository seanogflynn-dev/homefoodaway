import "server-only";
import { hasSupabaseConfig } from "./supabase/client";
import { createAnonClient } from "./supabase/anon";
import { mockCities, mockLocations, mockProducts, mockSightings } from "./mockData";
import type { Product, Location, SightingWithJoins } from "./types";

/**
 * Server-side data access. Every function reads from Supabase when it's
 * configured, and falls back to the in-memory seed data otherwise — so the
 * app is fully browsable before you've created a Supabase project. Writes
 * (see actions.ts) require real Supabase; there's no mock write path.
 */

export async function getAllProducts(): Promise<Product[]> {
  if (!hasSupabaseConfig) return mockProducts;
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("products").select("*").order("name");
  if (error) throw error;
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!hasSupabaseConfig) return mockProducts.find((p) => p.slug === slug) ?? null;
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("products").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export type City = { name: string; slug: string; country: string };

export async function getCities(): Promise<City[]> {
  if (!hasSupabaseConfig) return mockCities;
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("locations")
    .select("city, city_slug, country")
    .order("city");
  if (error) throw error;
  const seen = new Set<string>();
  const rows = data as { city: string; city_slug: string; country: string }[] | null;
  return (rows ?? [])
    .filter((c) => {
      if (seen.has(c.city_slug)) return false;
      seen.add(c.city_slug);
      return true;
    })
    .map((c) => ({ name: c.city, slug: c.city_slug, country: c.country }));
}

export async function getLocationsForCity(citySlug: string): Promise<Location[]> {
  if (!hasSupabaseConfig) return mockLocations.filter((l) => l.city_slug === citySlug);
  const supabase = createAnonClient();
  const { data, error } = await supabase.from("locations").select("*").eq("city_slug", citySlug);
  if (error) throw error;
  return data as Location[];
}

/**
 * The core query: "where has this product been sighted in this city?"
 * Powers both the search UI and the static SEO product/city pages.
 */
export async function getSightingsForProductInCity(
  productSlug: string,
  citySlug: string
): Promise<SightingWithJoins[]> {
  if (!hasSupabaseConfig) {
    const product = mockProducts.find((p) => p.slug === productSlug);
    if (!product) return [];
    const cityLocationIds = new Set(
      mockLocations.filter((l) => l.city_slug === citySlug).map((l) => l.id)
    );
    return mockSightings
      .filter((s) => s.product_id === product.id && cityLocationIds.has(s.location_id))
      .map((s) => ({
        ...s,
        product,
        location: mockLocations.find((l) => l.id === s.location_id)!,
      }))
      .sort((a, b) => +new Date(b.reported_at) - +new Date(a.reported_at));
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("sightings")
    .select("*, product:products!inner(*), location:locations!inner(*)")
    .eq("product.slug", productSlug)
    .eq("location.city_slug", citySlug)
    .order("reported_at", { ascending: false });
  if (error) throw error;
  return data as unknown as SightingWithJoins[];
}

export async function getSightingsForLocation(locationId: string): Promise<SightingWithJoins[]> {
  if (!hasSupabaseConfig) {
    return mockSightings
      .filter((s) => s.location_id === locationId)
      .map((s) => ({
        ...s,
        product: mockProducts.find((p) => p.id === s.product_id)!,
        location: mockLocations.find((l) => l.id === locationId)!,
      }));
  }
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("sightings")
    .select("*, product:products(*), location:locations(*)")
    .eq("location_id", locationId)
    .order("reported_at", { ascending: false });
  if (error) throw error;
  return data as unknown as SightingWithJoins[];
}

/** All product+city combinations that currently have at least one sighting — used to generate SEO pages. */
export async function getAllProductCityPairs(): Promise<{ productSlug: string; citySlug: string }[]> {
  if (!hasSupabaseConfig) {
    const pairs = new Set<string>();
    for (const s of mockSightings) {
      const product = mockProducts.find((p) => p.id === s.product_id)!;
      const location = mockLocations.find((l) => l.id === s.location_id)!;
      pairs.add(`${product.slug}::${location.city_slug}`);
    }
    return [...pairs].map((key) => {
      const [productSlug, citySlug] = key.split("::");
      return { productSlug, citySlug };
    });
  }
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("sightings")
    .select("product:products(slug), location:locations(city_slug)");
  if (error) throw error;
  const pairs = new Set<string>();
  for (const row of (data ?? []) as unknown as { product: { slug: string }; location: { city_slug: string } }[]) {
    pairs.add(`${row.product.slug}::${row.location.city_slug}`);
  }
  return [...pairs].map((key) => {
    const [productSlug, citySlug] = key.split("::");
    return { productSlug, citySlug };
  });
}