"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { reportSighting, addLocationAndSighting } from "@/lib/actions";
import type { Location } from "@/lib/types";

export function ReportSightingForm({
  productId,
  citySlug,
  city,
  country,
  existingLocations,
  isSignedIn,
}: {
  productId: string;
  citySlug: string;
  city: string;
  country: string;
  existingLocations: Location[];
  isSignedIn: boolean;
}) {
  const [mode, setMode] = useState<"existing" | "new">(existingLocations.length > 0 ? "existing" : "new");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);

  if (!isSignedIn) {
    return (
      <p className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-4 text-sm text-neutral-600">
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Sign in
        </Link>{" "}
        to report a sighting of this product.
      </p>
    );
  }

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const res =
        mode === "existing"
          ? await reportSighting(formData)
          : await addLocationAndSighting(formData);
      setResult(res.ok ? { ok: true } : { ok: false, error: res.error });
    });
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4">
      <input type="hidden" name="productId" value={productId} />
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input type="radio" checked={mode === "existing"} onChange={() => setMode("existing")} disabled={existingLocations.length === 0} />
          Existing store
        </label>
        <label className="flex items-center gap-1">
          <input type="radio" checked={mode === "new"} onChange={() => setMode("new")} />
          New store
        </label>
      </div>

      {mode === "existing" ? (
        <select name="locationId" required className="rounded-md border border-neutral-300 px-3 py-2">
          {existingLocations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name} — {l.address}
            </option>
          ))}
        </select>
      ) : (
        <>
          <input type="hidden" name="citySlug" value={citySlug} />
          <input type="hidden" name="city" value={city} />
          <input type="hidden" name="country" value={country} />
          <input name="name" required placeholder="Store name" className="rounded-md border border-neutral-300 px-3 py-2" />
          <input name="address" required placeholder="Address" className="rounded-md border border-neutral-300 px-3 py-2" />
          <div className="grid grid-cols-2 gap-3">
            <input
              name="lat"
              required
              type="number"
              step="any"
              placeholder="Latitude"
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
            <input
              name="lng"
              required
              type="number"
              step="any"
              placeholder="Longitude"
              className="rounded-md border border-neutral-300 px-3 py-2"
            />
          </div>
          <p className="text-xs text-neutral-500">
            Tip: paste the address into Google Maps, right-click the pin, and copy the coordinates
            shown at the top of the menu.
          </p>
          <select name="storeType" className="rounded-md border border-neutral-300 px-3 py-2">
            <option value="supermarket">Supermarket</option>
            <option value="specialty">Specialty / import shop</option>
            <option value="independent">Independent store</option>
            <option value="other">Other</option>
          </select>
        </>
      )}

      <textarea
        name="note"
        placeholder="Anything worth noting? (optional)"
        className="rounded-md border border-neutral-300 px-3 py-2"
        rows={2}
      />

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-md bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
      >
        {isPending ? "Saving…" : "Report sighting"}
      </button>

      {result?.ok && <p className="text-sm text-emerald-700">Thanks — saved.</p>}
      {result && !result.ok && <p className="text-sm text-red-600">{result.error}</p>}
    </form>
  );
}
