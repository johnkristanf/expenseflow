import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getLogs } from '@/lib/services/adjustment-logs-service';

export async function GET(req: Request) {
  return withAuth(async (user) => {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain'); // 'budgets' | 'savings'
    const id = searchParams.get('id');

    if (!domain || !id) {
      return NextResponse.json({ error: 'Missing domain or id parameters' }, { status: 400 });
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
    }

    try {
      const logs = await getLogs(domain, numericId, user.id);
      return NextResponse.json(logs);
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
