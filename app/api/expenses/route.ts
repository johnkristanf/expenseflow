import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getExpenses, createExpense } from '@/lib/services/expenses-service';
import { z } from 'zod';

const createExpenseSchema = z.object({
  categoryId: z.number().int().positive(),
  budgetId: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive(),
  spendingType: z.string().min(1, "Spending type is required"),
  dateSpent: z.string().min(1, "Date spent is required"), // YYYY-MM-DD
});

export async function GET() {
  return withAuth(async () => {
    const expenses = await getExpenses();
    return NextResponse.json(expenses);
  });
}

export async function POST(req: Request) {
  return withAuth(async () => {
    const body = await req.json();
    const parsed = createExpenseSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const expense = await createExpense(parsed.data);
      return NextResponse.json(expense, { status: 201 });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  });
}
