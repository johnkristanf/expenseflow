import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { deleteExpense, updateExpense } from '@/lib/services/expenses-service';
import { z } from 'zod';

const updateExpenseSchema = z.object({
  categoryId: z.number().int().positive(),
  budgetId: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  amount: z.number().positive(),
  spendingType: z.string().min(1, "Spending type is required"),
  dateSpent: z.string().min(1, "Date spent is required"), // YYYY-MM-DD
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const expenseId = parseInt(id, 10);
    
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateExpenseSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const expense = await updateExpense(expenseId, parsed.data);
      return NextResponse.json(expense, { status: 200 });
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const expenseId = parseInt(id, 10);
    
    if (isNaN(expenseId)) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 });
    }

    try {
      await deleteExpense(expenseId);
      return NextResponse.json({ message: 'Expense deleted successfully' });
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
