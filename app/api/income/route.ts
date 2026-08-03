import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getIncome, createIncome } from '@/lib/services/income-service';
import { z } from 'zod';

const createIncomeSchema = z.object({
  source: z.string().min(1, "Source is required"),
  amount: z.number().positive(),
  dateAcquired: z.string().min(1, "Date acquired is required"),
});

export async function GET() {
  return withAuth(async () => {
    const income = await getIncome();
    return NextResponse.json(income);
  });
}

export async function POST(req: Request) {
  return withAuth(async () => {
    const body = await req.json();
    const parsed = createIncomeSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const income = await createIncome(parsed.data);
    return NextResponse.json(income, { status: 201 });
  });
}
