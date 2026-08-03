import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getAccounts, createAccount } from '@/lib/services/accounts-service';
import { z } from 'zod';

const createAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  balance: z.number().min(0),
});

export async function GET() {
  return withAuth(async (user) => {
    const accounts = await getAccounts(user.id);
    return NextResponse.json(accounts);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    const body = await req.json();
    const parsed = createAccountSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const account = await createAccount(user.id, parsed.data);
    return NextResponse.json(account, { status: 201 });
  });
}
