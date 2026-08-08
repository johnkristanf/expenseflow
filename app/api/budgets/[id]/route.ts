import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { updateBudget } from '@/lib/services/budgets-service';
import { z } from 'zod';

const updateBudgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  totalAmount: z.number().positive(),
  budgetPeriod: z.string().min(1, "Budget period is required"),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const budgetId = parseInt(id, 10);
    
    if (isNaN(budgetId)) {
      return NextResponse.json({ error: 'Invalid budget ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateBudgetSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const budget = await updateBudget(budgetId, parsed.data);
      return NextResponse.json(budget);
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
