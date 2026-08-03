import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { adjustAccountBalance } from '@/lib/services/accounts-service';
import { z } from 'zod';

const adjustAccountSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['increment', 'decrement']),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const { id } = await params;
    const accountId = parseInt(id, 10);
    
    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = adjustAccountSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const account = await adjustAccountBalance(accountId, user.id, parsed.data);
      return NextResponse.json(account);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  });
}
