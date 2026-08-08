import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { updatePrompt, deletePrompt } from '@/lib/services/expense-prompts-service';
import { z } from 'zod';

const updatePromptSchema = z.object({
  promptText: z.string().min(1, "Prompt text is required"),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const { id } = await params;
    const promptId = parseInt(id, 10);
    
    if (isNaN(promptId)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updatePromptSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    try {
      const prompt = await updatePrompt(promptId, user.id, parsed.data.promptText);
      return NextResponse.json(prompt);
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (user) => {
    const { id } = await params;
    const promptId = parseInt(id, 10);
    
    if (isNaN(promptId)) {
      return NextResponse.json({ error: 'Invalid prompt ID' }, { status: 400 });
    }

    try {
      await deletePrompt(promptId, user.id);
      return NextResponse.json({ message: 'Prompt deleted successfully' });
    } catch (e: unknown) {
      return NextResponse.json({ error: (e instanceof Error ? e.message : "Unknown error") }, { status: 400 });
    }
  });
}
