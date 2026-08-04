import { NextResponse, type NextRequest } from "next/server";
import { type User } from "@supabase/supabase-js";

/**
 * Validates the current route against the user's authentication state.
 * Returns a redirect response if the user is not allowed to view the route,
 * or returns the original response if they are.
 * 
 * Safely copies any cookies from the incoming Supabase response to the redirect
 * response so that session refreshes aren't lost during the redirect.
 */
export function validateRoute(
  request: NextRequest,
  user: User | null,
  response: NextResponse
) {
  const isAuthRoute =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/auth");

  // Bouncer logic 1: Unauthenticated user trying to access a protected route
  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResponse = NextResponse.redirect(url);
    
    // Crucial: Copy refreshed session cookies over to the redirect response!
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // Bouncer logic 2: Authenticated user trying to access the login page
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    const redirectResponse = NextResponse.redirect(url);
    
    // Crucial: Copy refreshed session cookies over to the redirect response!
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  return response;
}
