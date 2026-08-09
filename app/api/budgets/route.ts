import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getBudgets, createBudget } from '@/lib/services/budgets-service';
import { z } from 'zod';

const createBudgetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  totalAmount: z.number().positive(),
});

export async function GET(req: Request) {
  return withAuth(async () => {
    const { searchParams } = new URL(req.url);
    const component = searchParams.get('component') ?? undefined;
    
    const budgets = await getBudgets(component);
    return NextResponse.json(budgets);
  });
}

export async function POST(req: Request) {
  return withAuth(async () => {
    const body = await req.json();
    const parsed = createBudgetSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const budget = await createBudget(parsed.data);
    return NextResponse.json(budget, { status: 201 });
  });
}
