import { createClient } from "@supabase/supabase-js";
import { hasSupabaseConfig } from "./client";

export { hasSupabaseConfig };

/**
 * A stateless Supabase client for public, unauthenticated reads (everything
 * covered by the "publicly readable" RLS policies in 0001_init.sql).
 *
 * Unlike the cookie-based client in server.ts, this one has no dependency
 * on the incoming request — so it's safe to call from generateStaticParams,
 * which runs at build time with no request/cookies available at all. Use
 * server.ts only where you actually need the signed-in user (auth checks,
 * writes in actions.ts).
 */
export function createAnonClient() {
  if (!hasSupabaseConfig) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local (see README)."
    );
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}