"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/types";

export function SearchForm({
  products,
  cities,
}: {
  products: Product[];
  cities: { name: string; slug: string; country: string }[];
}) {
  const router = useRouter();
  const [productSlug, setProductSlug] = useState(products[0]?.slug ?? "");
  const [citySlug, setCitySlug] = useState(cities[0]?.slug ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productSlug || !citySlug) return;
    router.push(`/${citySlug}/${productSlug}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <select
        value={productSlug}
        onChange={(e) => setProductSlug(e.target.value)}
        className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2"
      >
        {products.map((p) => (
          <option key={p.slug} value={p.slug}>
            {p.brand} — {p.name}
          </option>
        ))}
      </select>
      <select
        value={citySlug}
        onChange={(e) => setCitySlug(e.target.value)}
        className="flex-1 rounded-md border border-neutral-300 bg-white px-3 py-2"
      >
        {cities.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}, {c.country}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800"
      >
        Find it
      </button>
    </form>
  );
}
