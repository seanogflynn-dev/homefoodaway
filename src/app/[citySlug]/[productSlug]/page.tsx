import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllProductCityPairs,
  getCities,
  getLocationsForCity,
  getProductBySlug,
  getSightingsForProductInCity,
} from "@/lib/data";
import { hasSupabaseConfig, createClient as createServerSupabase } from "@/lib/supabase/server";
import { sightingFreshness } from "@/lib/types";
import { MapView } from "@/components/MapView";
import { SightingActions } from "@/components/SightingActions";
import { ReportSightingForm } from "@/components/ReportSightingForm";

export async function generateStaticParams() {
  const pairs = await getAllProductCityPairs();
  return pairs.map((p) => ({ citySlug: p.citySlug, productSlug: p.productSlug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ citySlug: string; productSlug: string }>;
}) {
  const { citySlug, productSlug } = await params;
  const [product, cities] = await Promise.all([getProductBySlug(productSlug), getCities()]);
  const city = cities.find((c) => c.slug === citySlug);
  if (!product || !city) return {};
  return {
    title: `${product.brand} ${product.name} in ${city.name} | HomeFoodAway`,
    description: `Where to find ${product.brand} ${product.name} in ${city.name} — real, crowdsourced sightings.`,
  };
}

export default async function ProductCityPage({
  params,
}: {
  params: Promise<{ citySlug: string; productSlug: string }>;
}) {
  const { citySlug, productSlug } = await params;
  const [product, cities] = await Promise.all([getProductBySlug(productSlug), getCities()]);
  const city = cities.find((c) => c.slug === citySlug);
  if (!product || !city) notFound();

  const [sightings, locations] = await Promise.all([
    getSightingsForProductInCity(productSlug, citySlug),
    getLocationsForCity(citySlug),
  ]);

  let isSignedIn = false;
  if (hasSupabaseConfig) {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = Boolean(user);
  }

  const visibleSightings = sightings.filter((s) => s.status !== "not_found");

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm text-neutral-500">
        <Link href={`/${citySlug}`} className="hover:underline">
          ← {city.name}
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {product.brand} {product.name}
      </h1>
      <p className="mt-1 text-neutral-600">in {city.name}</p>

      <div className="mt-6">
        <MapView locations={visibleSightings.map((s) => s.location)} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          {visibleSightings.length} sighting{visibleSightings.length === 1 ? "" : "s"}
        </h2>

        {visibleSightings.length === 0 ? (
          <p className="mt-3 text-neutral-600">
            No one has reported this yet — be the first to spot it.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
            {visibleSightings.map((s) => {
              const freshness = sightingFreshness(s.reported_at);
              return (
                <li key={s.id} className="flex items-start justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-medium">{s.location.name}</p>
                    <p className="text-sm text-neutral-600">{s.location.address}</p>
                    {s.note && <p className="mt-1 text-sm text-neutral-500 italic">&ldquo;{s.note}&rdquo;</p>}
                    <p className="mt-1 text-xs">
                      <span
                        className={
                          freshness === "fresh"
                            ? "font-medium text-emerald-700"
                            : "font-medium text-amber-600"
                        }
                      >
                        {freshness === "fresh" ? "Confirmed" : "Unconfirmed"}
                      </span>{" "}
                      <span className="text-neutral-500">
                        {new Date(s.reported_at).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                  <SightingActions sightingId={s.id} isSignedIn={isSignedIn} />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Report a sighting
        </h2>
        <div className="mt-3">
          <ReportSightingForm
            productId={product.id}
            citySlug={citySlug}
            city={city.name}
            country={city.country}
            existingLocations={locations}
            isSignedIn={isSignedIn}
          />
        </div>
      </div>
    </div>
  );
}
