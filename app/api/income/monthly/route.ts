import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getMonthlyIncome } from '@/lib/services/income-service';

export async function GET(req: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year') || new Date().getFullYear().toString();

    if (!month) {
      return NextResponse.json({ error: 'Missing month parameter' }, { status: 400 });
    }

    try {
      const data = await getMonthlyIncome(month, year);
      return NextResponse.json(data);
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
