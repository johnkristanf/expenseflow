import { db } from "@/lib/db";
import { adjustmentLogs, accounts } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

/** Maps URL domain param to the PHP class name stored in loggable_type */
const DOMAIN_TYPE_MAP: Record<string, string> = {
  budgets: "App\\Models\\Budgets",
  savings: "App\\Models\\Savings",
};

/**
 * Fetches adjustment logs for a given budget or saving, scoped to the user.
 * Joins the linked account (id, name) when present.
 *
 * @param domain  - `'budgets'` or `'savings'`
 * @param id      - The budget or saving ID
 * @param userId  - Authenticated user's ID
 * @throws If domain is invalid
 */
export async function getLogs(domain: string, id: number, userId: string) {
  const loggableType = DOMAIN_TYPE_MAP[domain];
  if (!loggableType) throw new Error("Invalid domain.");

  return db
    .select({
      id: adjustmentLogs.id,
      type: adjustmentLogs.type,
      amount: adjustmentLogs.amount,
      reason: adjustmentLogs.reason,
      createdAt: adjustmentLogs.createdAt,
      account: {
        id: accounts.id,
        name: accounts.name,
      },
    })
    .from(adjustmentLogs)
    .leftJoin(accounts, eq(adjustmentLogs.accountId, accounts.id))
    .where(
      and(
        eq(adjustmentLogs.loggableType, loggableType),
        eq(adjustmentLogs.loggableId, id),
        eq(adjustmentLogs.userId, userId),
      ),
    )
    .orderBy(desc(adjustmentLogs.createdAt));
}
