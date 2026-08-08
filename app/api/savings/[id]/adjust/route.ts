import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { adjustSaving } from '@/lib/services/savings-service';
import { z } from 'zod';

const adjustSavingSchema = z.object({
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
    const savingId = parseInt(id, 10);
    
    if (isNaN(savingId)) {
      return NextResponse.json({ error: 'Invalid saving ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = adjustSavingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const saving = await adjustSaving(savingId, parsed.data, user.id);
      return NextResponse.json(saving);
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
