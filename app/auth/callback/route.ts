import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * OAuth callback route — Supabase redirects here after Google sign-in.
 * Exchanges the one-time authorization code for a persistent session
 * and stores it in cookies (PKCE flow).
 *
 * Add this URL to your Supabase project's redirect allow-list:
 *   http://localhost:3000/auth/callback   (development)
 *   https://yourdomain.com/auth/callback  (production)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Allow deep-linking: e.g. ?next=/dashboard
  let next = searchParams.get("next") ?? "/dashboard";
  if (!next.startsWith("/")) {
    next = "/dashboard";
  }

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Something went wrong — redirect to a safe error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
