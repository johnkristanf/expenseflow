import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { updateSaving } from '@/lib/services/savings-service';
import { z } from 'zod';

const updateSavingSchema = z.object({
  goalName: z.string().min(1, "Goal name is required"),
  targetAmount: z.number().positive(),
  startDate: z.string().min(1, "Start date is required"),
  targetDate: z.string().min(1, "Target date is required"),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async () => {
    const { id } = await params;
    const savingId = parseInt(id, 10);
    
    if (isNaN(savingId)) {
      return NextResponse.json({ error: 'Invalid saving ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateSavingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const saving = await updateSaving(savingId, parsed.data);
      return NextResponse.json(saving);
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
