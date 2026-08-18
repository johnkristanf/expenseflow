import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { moveBudgetFunds } from '@/lib/services/budgets-service';
import type { User } from '@supabase/supabase-js';
import { z } from 'zod';

const moveSchema = z.object({
  targetBudgetId: z.number().int().positive(),
  amount: z.number().positive(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user: User) => {
    const { id } = await params;
    const fromId = parseInt(id, 10);

    if (isNaN(fromId)) {
      return NextResponse.json({ error: 'Invalid budget ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = moveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const budget = await moveBudgetFunds(
        fromId,
        parsed.data.targetBudgetId,
        parsed.data.amount,
        user.id
      );
      return NextResponse.json(budget);
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Unknown error' },
        { status: 400 }
      );
    }
  });
}
