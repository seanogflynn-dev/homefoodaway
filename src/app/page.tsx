import Link from "next/link";
import { getAllProducts, getCities } from "@/lib/data";
import { SearchForm } from "@/components/SearchForm";

export default async function HomePage() {
  const [products, cities] = await Promise.all([getAllProducts(), getCities()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        Find your home-country food, wherever you are.
      </h1>
      <p className="mt-3 max-w-xl text-neutral-600">
        Search for an Ireland-origin product and a city to see where other people have actually
        spotted it on shelves — not another mail-order shop, a live, crowdsourced locator.
      </p>

      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <SearchForm products={products} cities={cities} />
      </div>

      <div className="mt-10">
        <h2 className="text-sm font-medium uppercase tracking-wide text-neutral-500">
          Currently tracked
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          {cities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/${c.slug}`}
                className="rounded-full border border-neutral-300 bg-white px-3 py-1 text-sm hover:border-emerald-600 hover:text-emerald-700"
              >
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
