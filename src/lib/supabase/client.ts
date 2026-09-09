import { createBrowserClient } from "@supabase/ssr";

/**
 * Whether real Supabase credentials are configured. When they aren't (e.g.
 * running the scaffold locally before you've created a Supabase project),
 * the app falls back to the read-only seed data in `src/lib/mockData.ts` so
 * `npm run dev` / `npm run build` work out of the box.
 */
export const hasSupabaseConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export function createClient() {
  if (!hasSupabaseConfig) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see README)."
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
