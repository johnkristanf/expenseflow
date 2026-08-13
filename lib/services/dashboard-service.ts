import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
import { expenses, income } from '@/lib/db/schema';

/**
 * Fetches distinct years from both expenses and income tables.
 * Returns an array of years sorted in descending order.
 */
export async function getAvailableYears(): Promise<string[]> {
  const expenseYears = await db
    .selectDistinct({ year: sql<number>`EXTRACT(YEAR FROM ${expenses.dateSpent})` })
    .from(expenses);

  const incomeYears = await db
    .selectDistinct({ year: sql<number>`EXTRACT(YEAR FROM ${income.dateAcquired})` })
    .from(income);

  const yearsSet = new Set<string>();
  expenseYears.forEach((r) => {
    if (r.year) yearsSet.add(r.year.toString());
  });
  incomeYears.forEach((r) => {
    if (r.year) yearsSet.add(r.year.toString());
  });

  const years = Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));

  // If there's no data yet, fallback to the current year
  if (years.length === 0) {
    years.push(new Date().getFullYear().toString());
  }

  return years;
}
