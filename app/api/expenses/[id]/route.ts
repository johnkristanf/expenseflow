import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { deleteExpense } from '@/lib/services/expenses-service';

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
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  });
}
