import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllProductCityPairs, getAllProducts, getCities } from "@/lib/data";

export async function generateStaticParams() {
  const cities = await getCities();
  return cities.map((c) => ({ citySlug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params;
  const cities = await getCities();
  const city = cities.find((c) => c.slug === citySlug);
  if (!city) return {};
  return {
    title: `Irish products in ${city.name} | HomeFoodAway`,
    description: `Where to find Ireland-origin food and products in ${city.name}, crowdsourced from real sightings.`,
  };
}

export default async function CityPage({ params }: { params: Promise<{ citySlug: string }> }) {
  const { citySlug } = await params;
  const [cities, products, pairs] = await Promise.all([
    getCities(),
    getAllProducts(),
    getAllProductCityPairs(),
  ]);

  const city = cities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const trackedSlugs = new Set(pairs.filter((p) => p.citySlug === citySlug).map((p) => p.productSlug));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm text-neutral-500">
        <Link href="/" className="hover:underline">
          ← All cities
        </Link>
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Irish products in {city.name}
      </h1>
      <p className="mt-2 text-neutral-600">
        {trackedSlugs.size} product{trackedSlugs.size === 1 ? "" : "s"} with reported sightings so far.
      </p>

      <ul className="mt-8 divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
        {products.map((p) => {
          const tracked = trackedSlugs.has(p.slug);
          return (
            <li key={p.slug}>
              <Link
                href={`/${citySlug}/${p.slug}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50"
              >
                <span>
                  <span className="font-medium">{p.brand}</span>{" "}
                  <span className="text-neutral-600">{p.name}</span>
                </span>
                {tracked ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
                    Sightings reported
                  </span>
                ) : (
                  <span className="text-xs text-neutral-400">Be the first to report</span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
