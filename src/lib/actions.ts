"use server";

import { revalidatePath } from "next/cache";
import { hasSupabaseConfig, createClient as createServerSupabase } from "./supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Adds a new sighting (a product spotted at a location). Requires a signed-in
 * user and a real Supabase connection — there is no mock/demo write path, by
 * design, so this always tells you plainly why it can't run yet rather than
 * silently pretending to succeed.
 */
export async function reportSighting(formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseConfig) {
    return { ok: false, error: "Connect Supabase first — see the README — before sightings can be saved." };
  }

  const productId = formData.get("productId")?.toString();
  const locationId = formData.get("locationId")?.toString();
  const note = formData.get("note")?.toString() || null;

  if (!productId || !locationId) {
    return { ok: false, error: "Missing product or location." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sign in to report a sighting." };
  }

  const { error } = await supabase.from("sightings").insert({
    product_id: productId,
    location_id: locationId,
    reported_by: user.id,
    reported_at: new Date().toISOString(),
    status: "confirmed",
    note,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Adds a brand-new store to a city and immediately logs a sighting there.
 * Coordinates are optional here (defaulting near 0,0 if omitted) — for a
 * real launch, geocode the address server-side (e.g. via the Google
 * Places API) instead of trusting free-text lat/lng from a form.
 */
export async function addLocationAndSighting(formData: FormData): Promise<ActionResult> {
  if (!hasSupabaseConfig) {
    return { ok: false, error: "Connect Supabase first — see the README — before locations can be saved." };
  }

  const productId = formData.get("productId")?.toString();
  const citySlug = formData.get("citySlug")?.toString();
  const city = formData.get("city")?.toString();
  const country = formData.get("country")?.toString();
  const name = formData.get("name")?.toString();
  const address = formData.get("address")?.toString();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const storeType = (formData.get("storeType")?.toString() || "other") as
    | "supermarket"
    | "specialty"
    | "independent"
    | "other";
  const note = formData.get("note")?.toString() || null;

  if (!productId || !citySlug || !city || !country || !name || !address || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { ok: false, error: "Please fill in the store name, address, and coordinates." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to add a new store." };
  }

  const { data: location, error: locationError } = await supabase
    .from("locations")
    .insert({ name, address, city, city_slug: citySlug, country, lat, lng, store_type: storeType })
    .select()
    .single();

  if (locationError) return { ok: false, error: locationError.message };

  const { error: sightingError } = await supabase.from("sightings").insert({
    product_id: productId,
    location_id: location.id,
    reported_by: user.id,
    reported_at: new Date().toISOString(),
    status: "confirmed",
    note,
  });

  if (sightingError) return { ok: false, error: sightingError.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/** Re-confirms an existing sighting is still accurate today (resets its freshness clock). */
export async function confirmSighting(sightingId: string): Promise<ActionResult> {
  if (!hasSupabaseConfig) {
    return { ok: false, error: "Connect Supabase first — see the README — before confirmations can be saved." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to confirm a sighting." };
  }

  const { error } = await supabase
    .from("sightings")
    .update({ reported_at: new Date().toISOString(), status: "confirmed" })
    .eq("id", sightingId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}

/**
 * Saves a piece of free-form site feedback (the floating "Feedback" tab).
 * Unlike the sighting actions above, this deliberately works whether or not
 * you're signed in — a feedback widget that gatekeeps on login defeats the
 * point of one-click feedback. If signed in, we attach the user id so you
 * can see who said what in the Supabase Table Editor.
 */
export async function submitFeedback(input: {
  message: string;
  rating?: number | null;
  pagePath?: string | null;
  contactEmail?: string | null;
}): Promise<ActionResult> {
  if (!hasSupabaseConfig) {
    return { ok: false, error: "Connect Supabase first — see the README — before feedback can be saved." };
  }

  const message = input.message.trim();
  if (!message) {
    return { ok: false, error: "Say a little about what's on your mind first." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("feedback").insert({
    message,
    rating: input.rating ?? null,
    page_path: input.pagePath ?? null,
    contact_email: input.contactEmail?.trim() || null,
    user_id: user?.id ?? null,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Flags a sighting as no longer accurate — the product wasn't found there. */
export async function reportNotFound(sightingId: string): Promise<ActionResult> {
  if (!hasSupabaseConfig) {
    return { ok: false, error: "Connect Supabase first — see the README — before reports can be saved." };
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "Sign in to flag a sighting." };
  }

  const { error } = await supabase.from("sightings").update({ status: "not_found" }).eq("id", sightingId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/", "layout");
  return { ok: true };
}
