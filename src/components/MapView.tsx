"use client";

import { useEffect, useRef } from "react";
import type { Location } from "@/lib/types";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export function MapView({ locations }: { locations: Location[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);

  useEffect(() => {
    if (!MAPBOX_TOKEN || !containerRef.current || locations.length === 0) return;

    let cancelled = false;

    import("mapbox-gl").then((mapboxgl) => {
      if (cancelled || !containerRef.current) return;
      mapboxgl.default.accessToken = MAPBOX_TOKEN;

      const map = new mapboxgl.default.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [locations[0].lng, locations[0].lat],
        zoom: 11,
      });
      mapRef.current = map;

      const bounds = new mapboxgl.default.LngLatBounds();
      for (const loc of locations) {
        new mapboxgl.default.Marker({ color: "#047857" })
          .setLngLat([loc.lng, loc.lat])
          .setPopup(new mapboxgl.default.Popup({ offset: 12 }).setText(`${loc.name} — ${loc.address}`))
          .addTo(map);
        bounds.extend([loc.lng, loc.lat]);
      }
      if (locations.length > 1) {
        map.fitBounds(bounds, { padding: 40, maxZoom: 14 });
      }
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locations]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
        Set NEXT_PUBLIC_MAPBOX_TOKEN in .env.local to show the map (see README).
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 text-sm text-neutral-500">
        No locations to show yet.
      </div>
    );
  }

  return <div ref={containerRef} className="h-64 w-full rounded-lg border border-neutral-200" />;
}
