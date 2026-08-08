import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { adjustBudget } from '@/lib/services/budgets-service';
import { z } from 'zod';

const adjustBudgetSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['increment', 'decrement']),
  accountId: z.number().int().positive().optional(),
  reason: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const { id } = await params;
    const budgetId = parseInt(id, 10);
    
    if (isNaN(budgetId)) {
      return NextResponse.json({ error: 'Invalid budget ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = adjustBudgetSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const budget = await adjustBudget(budgetId, parsed.data, user.id);
      return NextResponse.json(budget);
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
