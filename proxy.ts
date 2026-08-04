import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import { validateRoute } from "@/lib/auth/validate-route";

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  return validateRoute(request, user, supabaseResponse);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - any image/font extensions
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
