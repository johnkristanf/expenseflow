import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { updateAccount, deleteAccount } from '@/lib/services/accounts-service';
import { z } from 'zod';

const updateAccountSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  balance: z.number().min(0),
});

export async function PUT(
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
    const parsed = updateAccountSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const account = await updateAccount(accountId, user.id, parsed.data);
      return NextResponse.json(account);
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const { id } = await params;
    const accountId = parseInt(id, 10);
    
    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Invalid account ID' }, { status: 400 });
    }

    try {
      await deleteAccount(accountId, user.id);
      return NextResponse.json({ message: 'Account deleted successfully' });
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
  });
}
