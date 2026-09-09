"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasSupabaseConfig, createClient } from "@/lib/supabase/client";

export function HeaderAuth() {
  const [email, setEmail] = useState<string | null | undefined>(hasSupabaseConfig ? undefined : null);

  useEffect(() => {
    if (!hasSupabaseConfig) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!hasSupabaseConfig) {
    return <span className="text-xs text-amber-600">Supabase not connected</span>;
  }

  if (email === undefined) return null;

  if (email) {
    return (
      <button
        className="text-sm text-neutral-600 hover:text-neutral-900"
        onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
        }}
      >
        {email} · Sign out
      </button>
    );
  }

  return (
    <Link href="/login" className="text-sm font-medium text-emerald-700 hover:text-emerald-800">
      Sign in
    </Link>
  );
}
