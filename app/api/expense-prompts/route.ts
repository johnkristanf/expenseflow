import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getPrompts, createPrompt } from '@/lib/services/expense-prompts-service';
import { z } from 'zod';

const createPromptSchema = z.object({
  promptText: z.string().min(1, "Prompt text is required"),
});

export async function GET() {
  return withAuth(async (user) => {
    const prompts = await getPrompts(user.id);
    return NextResponse.json(prompts);
  });
}

export async function POST(req: Request) {
  return withAuth(async (user) => {
    const body = await req.json();
    const parsed = createPromptSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const prompt = await createPrompt(user.id, parsed.data.promptText);
    return NextResponse.json(prompt, { status: 201 });
  });
}
