'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase browser client.
 * Use this inside Client Components for auth flows and realtime.
 */
export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
