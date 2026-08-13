import { db } from "@/lib/db";
import { income } from "@/lib/db/schema";
import { sum, desc, sql, and, eq } from "drizzle-orm";
import { getMonthNumber, isValidMonth } from "@/lib/utils/month-utils";

/**
 * Fetches all income records ordered by creation date descending.
 */
export async function getIncome() {
  return db
    .select({
      id: income.id,
      source: income.source,
      amount: income.amount,
      dateAcquired: income.dateAcquired,
      createdAt: income.createdAt,
    })
    .from(income)
    .orderBy(desc(income.createdAt));
}

/**
 * Creates a new income record.
 */
export async function createIncome(data: {
  source: string;
  amount: number;
  dateAcquired: string;
}) {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const [record] = await db
    .insert(income)
    .values({
      source: data.source,
      amount: String(data.amount),
      dateAcquired: data.dateAcquired,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return record;
}

/**
 * Updates an existing income record.
 *
 * @param id   - Income ID to update
 * @param data - Updated fields
 * @throws If the record is not found
 */
export async function updateIncome(
  id: number,
  data: {
    source: string;
    amount: number;
    dateAcquired: string;
  },
) {
  const now = new Date().toISOString().replace("T", " ").substring(0, 19);
  const [record] = await db
    .update(income)
    .set({
      source: data.source,
      amount: String(data.amount),
      dateAcquired: data.dateAcquired,
      updatedAt: now,
    })
    .where(eq(income.id, BigInt(id)))
    .returning();

  if (!record) throw new Error("Income record not found.");
  return record;
}

/**
 * Deletes an income record by ID.
 *
 * @param id - Income ID to delete
 * @throws If the record is not found
 */
export async function deleteIncome(id: number) {
  const [deleted] = await db
    .delete(income)
    .where(eq(income.id, BigInt(id)))
    .returning();

  if (!deleted) throw new Error("Income record not found.");
  return deleted;
}

/**
 * Returns the total income amount for a given month/year.
 * Pass `month = 'all'` to sum the entire year.
 *
 * @throws If month name is invalid
 */
export async function getMonthlyIncome(month: string, year: string) {
  const lower = month.toLowerCase();

  if (!isValidMonth(lower)) {
    throw new Error("Invalid month name provided.");
  }

  const yearAll = year === "all";

  let query = db
    .select({ total: sum(income.amount) })
    .from(income)
    .$dynamic();

  if (lower === "all" && yearAll) {
    // No filter — sum everything
  } else if (lower === "all") {
    query = query.where(
      sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`,
    );
  } else if (yearAll) {
    const monthNum = getMonthNumber(lower)!;
    query = query.where(
      sql`EXTRACT(MONTH FROM ${income.dateAcquired}) = ${monthNum}`,
    );
  } else {
    const monthNum = getMonthNumber(lower)!;
    query = query.where(
      and(
        sql`EXTRACT(MONTH FROM ${income.dateAcquired}) = ${monthNum}`,
        sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`,
      ),
    );
  }

  const [result] = await query;
  return { total: result?.total ?? "0" };
}

/**
 * Returns total income grouped by source for a given month/year.
 * Pass `month = 'all'` to cover the entire year.
 *
 * @throws If month name is invalid
 */
export async function getIncomePerSource(month: string, year: string) {
  const lower = month.toLowerCase();

  if (!isValidMonth(lower)) {
    throw new Error("Invalid month name provided.");
  }

  const yearAll = year === "all";

  let whereClause;
  if (lower === "all" && yearAll) {
    whereClause = undefined;
  } else if (lower === "all") {
    whereClause = sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`;
  } else if (yearAll) {
    const monthNum = getMonthNumber(lower)!;
    whereClause = sql`EXTRACT(MONTH FROM ${income.dateAcquired}) = ${monthNum}`;
  } else {
    const monthNum = getMonthNumber(lower)!;
    whereClause = and(
      sql`EXTRACT(MONTH FROM ${income.dateAcquired}) = ${monthNum}`,
      sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`,
    );
  }

  const query = db
    .select({ source: income.source, amount: sum(income.amount) })
    .from(income)
    .groupBy(income.source)
    .orderBy(income.source);

  return whereClause ? query.where(whereClause) : query;
}
