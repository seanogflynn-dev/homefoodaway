"use client";

import { useTransition } from "react";
import Link from "next/link";
import { confirmSighting, reportNotFound } from "@/lib/actions";

export function SightingActions({
  sightingId,
  isSignedIn,
}: {
  sightingId: string;
  isSignedIn: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  if (!isSignedIn) {
    return (
      <Link href="/login" className="text-xs text-emerald-700 hover:underline">
        Sign in to confirm
      </Link>
    );
  }

  return (
    <div className="flex gap-3 text-xs">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await confirmSighting(sightingId);
          })
        }
        className="text-emerald-700 hover:underline disabled:opacity-50"
      >
        Still here
      </button>
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await reportNotFound(sightingId);
          })
        }
        className="text-neutral-500 hover:underline disabled:opacity-50"
      >
        Not found
      </button>
    </div>
  );
}
