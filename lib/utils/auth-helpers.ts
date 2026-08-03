import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

/**
 * Verifies the Supabase session from cookies inside a Route Handler.
 *
 * @returns The authenticated Supabase `User` object.
 * @throws A 401 `NextResponse` JSON if the user is not authenticated.
 *
 * @example
 * export async function GET() {
 *   const user = await requireAuth();
 *   // ... use user.id
 * }
 */
export async function requireAuth(): Promise<User> {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return user;
}

/**
 * Wraps a route handler so that any thrown NextResponse (e.g. from requireAuth)
 * is returned directly, and any other error returns a 500.
 */
export async function withAuth<T>(
  handler: (user: User) => Promise<NextResponse<T>>
): Promise<NextResponse> {
  try {
    const user = await requireAuth();
    return await handler(user);
  } catch (e) {
    if (e instanceof NextResponse) return e;
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
