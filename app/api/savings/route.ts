import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getSavings, createSaving } from '@/lib/services/savings-service';
import { z } from 'zod';

const createSavingSchema = z.object({
  goalName: z.string().min(1, "Goal name is required"),
  targetAmount: z.number().positive(),
  currentAmount: z.number().min(0).optional(),
  startDate: z.string().min(1, "Start date is required"),
  targetDate: z.string().min(1, "Target date is required"),
});

export async function GET() {
  return withAuth(async () => {
    const savings = await getSavings();
    return NextResponse.json(savings);
  });
}

export async function POST(req: Request) {
  return withAuth(async () => {
    const body = await req.json();
    const parsed = createSavingSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const saving = await createSaving(parsed.data);
    return NextResponse.json(saving, { status: 201 });
  });
}
