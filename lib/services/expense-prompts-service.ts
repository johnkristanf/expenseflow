import { db } from "@/lib/db";
import { expensePrompts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/** Fetches all prompts for a user ordered by creation date descending. */
export async function getPrompts(userId: string) {
  return db
    .select()
    .from(expensePrompts)
    .where(eq(expensePrompts.userId, userId))
    .orderBy(desc(expensePrompts.createdAt));
}

/** Creates a new expense prompt for a user. */
export async function createPrompt(userId: string, promptText: string) {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const [prompt] = await db
    .insert(expensePrompts)
    .values({
      userId: userId,
      promptText,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return prompt;
}

/**
 * Updates an existing prompt.
 * @throws If not found or does not belong to user
 */
export async function updatePrompt(
  id: number,
  userId: string,
  promptText: string,
) {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const [updated] = await db
    .update(expensePrompts)
    .set({ promptText, updatedAt: now })
    .where(
      and(
        eq(expensePrompts.id, id),
        eq(expensePrompts.userId, userId),
      ),
    )
    .returning();
  if (!updated) throw new Error("Prompt not found.");
  return updated;
}

/**
 * Deletes a prompt.
 * @throws If not found or does not belong to user
 */
export async function deletePrompt(id: number, userId: string) {
  const [deleted] = await db
    .delete(expensePrompts)
    .where(
      and(
        eq(expensePrompts.id, id),
        eq(expensePrompts.userId, userId),
      ),
    )
    .returning();
  if (!deleted) throw new Error("Prompt not found.");
}
