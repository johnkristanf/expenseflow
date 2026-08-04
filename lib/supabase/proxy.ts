import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Refreshes the Supabase Auth session on every request and writes the
 * updated tokens back to cookies so both Server Components and the browser
 * see a fresh session.
 *
 * Per the Supabase SSR guide, always use getClaims() — never getSession() —
 * inside middleware/proxy code, because getSession() is not re-validated.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Write cookies onto the outgoing request so Server Components pick them up.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          // Also write cookies onto the response so the browser stores them.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current user securely. This automatically refreshes the session
  // if the access token has expired.
  const { data: { user } } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
