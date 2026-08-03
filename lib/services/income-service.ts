import { db } from '@/lib/db';
import { income } from '@/lib/db/schema';
import { sum, desc, sql, and } from 'drizzle-orm';
import { getMonthNumber, isValidMonth } from '@/lib/utils/month-utils';

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
  const [record] = await db
    .insert(income)
    .values({
      source: data.source,
      amount: String(data.amount),
      dateAcquired: data.dateAcquired,
    })
    .returning();

  return record;
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
    throw new Error('Invalid month name provided.');
  }

  let query = db
    .select({ total: sum(income.amount) })
    .from(income)
    .$dynamic();

  if (lower === 'all') {
    query = query.where(sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`);
  } else {
    const monthNum = getMonthNumber(lower)!;
    query = query.where(
      and(
        sql`EXTRACT(MONTH FROM ${income.dateAcquired}) = ${monthNum}`,
        sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`
      )
    );
  }

  const [result] = await query;
  return { total: result?.total ?? '0' };
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
    throw new Error('Invalid month name provided.');
  }

  let whereClause;
  if (lower === 'all') {
    whereClause = sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`;
  } else {
    const monthNum = getMonthNumber(lower)!;
    whereClause = and(
      sql`EXTRACT(MONTH FROM ${income.dateAcquired}) = ${monthNum}`,
      sql`EXTRACT(YEAR FROM ${income.dateAcquired}) = ${Number(year)}`
    );
  }

  return db
    .select({ source: income.source, amount: sum(income.amount) })
    .from(income)
    .where(whereClause)
    .groupBy(income.source)
    .orderBy(income.source);
}
