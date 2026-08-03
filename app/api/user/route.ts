import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';

export async function GET() {
  return withAuth(async (user) => {
    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
    });
  });
}
