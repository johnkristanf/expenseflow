import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { updateIncome, deleteIncome } from '@/lib/services/income-service';
import { z } from 'zod';

const updateIncomeSchema = z.object({
  source: z.string().min(1, 'Source is required'),
  amount: z.number().positive(),
  dateAcquired: z.string().min(1, 'Date acquired is required'),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const incomeId = parseInt(id, 10);

    if (isNaN(incomeId)) {
      return NextResponse.json({ error: 'Invalid income ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateIncomeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const record = await updateIncome(incomeId, parsed.data);
      return NextResponse.json(record);
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Unknown error' },
        { status: 400 }
      );
    }
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const incomeId = parseInt(id, 10);

    if (isNaN(incomeId)) {
      return NextResponse.json({ error: 'Invalid income ID' }, { status: 400 });
    }

    try {
      await deleteIncome(incomeId);
      return NextResponse.json({ message: 'Income record deleted successfully' });
    } catch (e: unknown) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Unknown error' },
        { status: 400 }
      );
    }
  });
}
