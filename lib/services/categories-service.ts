import { db } from '@/lib/db';
import { categories } from '@/lib/db/schema';
import { desc } from 'drizzle-orm';

/**
 * Fetches all expense categories ordered by creation date descending.
 */
export async function getCategories() {
  return db.select().from(categories).orderBy(desc(categories.createdAt));
}

/**
 * Creates a new expense category.
 *
 * @param data - `name` (required) and optional `notes`
 */
export async function createCategory(data: { name: string; notes?: string | null }) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const [category] = await db
    .insert(categories)
    .values({ name: data.name, notes: data.notes ?? null, createdAt: now, updatedAt: now })
    .returning();

  return category;
}
