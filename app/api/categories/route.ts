import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/utils/auth-helpers';
import { getCategories, createCategory } from '@/lib/services/categories-service';
import { z } from 'zod';

const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  notes: z.string().nullable().optional(),
});

export async function GET() {
  return withAuth(async () => {
    const categories = await getCategories();
    return NextResponse.json(categories);
  });
}

export async function POST(req: Request) {
  return withAuth(async () => {
    const body = await req.json();
    const parsed = createCategorySchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const category = await createCategory(parsed.data);
    return NextResponse.json(category, { status: 201 });
  });
}
