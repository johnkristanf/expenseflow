import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

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
export async function createCategory(data: {
  name: string;
  notes?: string | null;
}) {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const [category] = await db
    .insert(categories)
    .values({
      name: data.name,
      notes: data.notes ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return category;
}

/**
 * Updates an existing category's name and/or notes.
 *
 * @param id   - Category ID to update
 * @param data - Fields to update (`name` required, `notes` optional)
 * @throws If the category is not found
 */
export async function updateCategory(
  id: number,
  data: { name: string; notes?: string | null },
) {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const [category] = await db
    .update(categories)
    .set({ name: data.name, notes: data.notes ?? null, updatedAt: now })
    .where(eq(categories.id, id))
    .returning();

  if (!category) throw new Error("Category not found.");
  return category;
}

/**
 * Deletes a category by ID.
 * Expenses linked to this category will have their categoryId set to null (ON DELETE SET NULL).
 *
 * @param id - Category ID to delete
 * @throws If the category is not found
 */
export async function deleteCategory(id: number) {
  const [deleted] = await db
    .delete(categories)
    .where(eq(categories.id, id))
    .returning();

  if (!deleted) throw new Error("Category not found.");
  return deleted;
}
