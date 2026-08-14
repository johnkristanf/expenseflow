import { db } from "@/lib/db";
import { expenses, budgets, categories } from "@/lib/db/schema";
import { eq, sum, and, sql, desc } from "drizzle-orm";
import { getMonthNumber, isValidMonth } from "@/lib/utils/month-utils";

/**
 * Fetches all expenses with their related budget (id, name) and category (id, name),
 * ordered by date_spent descending.
 */
export async function getExpenses() {
  return db
    .select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      spendingType: expenses.spendingType,
      dateSpent: expenses.dateSpent,
      categoryId: expenses.categoryId,
      budgetId: expenses.budgetId,
      createdAt: expenses.createdAt,
      budget: {
        id: budgets.id,
        name: budgets.name,
      },
      category: {
        id: categories.id,
        name: categories.name,
      },
    })
    .from(expenses)
    .leftJoin(budgets, eq(expenses.budgetId, budgets.id))
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .orderBy(desc(expenses.dateSpent));
}

/**
 * Creates a new expense and atomically deducts the amount from the linked budget.
 * Throws if the budget does not exist or has insufficient funds.
 *
 * @param data - Validated expense fields
 */
export async function createExpense(data: {
  categoryId: number;
  budgetId: number;
  description: string;
  amount: number;
  spendingType: string;
  dateSpent: string;
}) {
  return db.transaction(async (tx) => {
    // 1. Fetch the budget and check balance
    const [budget] = await tx
      .select()
      .from(budgets)
      .where(eq(budgets.id, data.budgetId));

    if (!budget) throw new Error("Budget not found.");

    const newAmount = Number(budget.currentAmount) - data.amount;
    if (newAmount < 0) {
      throw new Error(
        `Insufficient budget. Available: ${Math.floor(Number(budget.currentAmount))}`,
      );
    }

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    // 2. Deduct from budget
    await tx
      .update(budgets)
      .set({ currentAmount: String(newAmount), updatedAt: now })
      .where(eq(budgets.id, data.budgetId));

    // 3. Create the expense
    const [expense] = await tx
      .insert(expenses)
      .values({
        categoryId: data.categoryId,
        budgetId: data.budgetId,
        description: data.description,
        amount: String(data.amount),
        spendingType: data.spendingType,
        dateSpent: data.dateSpent,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return expense;
  });
}

/**
 * Deletes an expense and atomically restores the amount back to its linked budget.
 *
 * @param id - Expense ID to delete
 * @throws If the expense is not found
 */
export async function deleteExpense(id: number) {
  return db.transaction(async (tx) => {
    const [expense] = await tx
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));

    if (!expense) throw new Error("Expense not found.");

    // Restore budget balance
    if (expense.budgetId) {
      const [budget] = await tx
        .select()
        .from(budgets)
        .where(eq(budgets.id, expense.budgetId));

      if (budget) {
        const now = new Date().toISOString().replace("T", " ").substring(0, 19);
        await tx
          .update(budgets)
          .set({
            currentAmount: String(
              Number(budget.currentAmount) + Number(expense.amount),
            ),
            updatedAt: now,
          })
          .where(eq(budgets.id, expense.budgetId));
      }
    }

    await tx.delete(expenses).where(eq(expenses.id, id));
  });
}

/**
 * Updates an expense and atomically adjusts the linked budget(s).
 *
 * @param id - Expense ID to update
 * @param data - Updated expense fields
 */
export async function updateExpense(
  id: number,
  data: {
    categoryId: number;
    budgetId: number;
    description: string;
    amount: number;
    spendingType: string;
    dateSpent: string;
  },
) {
  return db.transaction(async (tx) => {
    const [oldExpense] = await tx
      .select()
      .from(expenses)
      .where(eq(expenses.id, id));

    if (!oldExpense) throw new Error("Expense not found.");

    const oldAmount = Number(oldExpense.amount);
    const newAmount = data.amount;

    const now = new Date().toISOString().replace("T", " ").substring(0, 19);

    if (oldExpense.budgetId !== data.budgetId) {
      // 1. Restore old budget
      if (oldExpense.budgetId) {
        const [oldBudget] = await tx
          .select()
          .from(budgets)
          .where(eq(budgets.id, oldExpense.budgetId));

        if (oldBudget) {
          await tx
            .update(budgets)
            .set({
              currentAmount: String(
                Number(oldBudget.currentAmount) + oldAmount,
              ),
              updatedAt: now,
            })
            .where(eq(budgets.id, oldExpense.budgetId));
        }
      }

      // 2. Deduct from new budget
      const [newBudget] = await tx
        .select()
        .from(budgets)
        .where(eq(budgets.id, data.budgetId));

      if (!newBudget) throw new Error("New budget not found.");

      const newBudgetAmount = Number(newBudget.currentAmount) - newAmount;
      if (newBudgetAmount < 0) {
        throw new Error(
          `Insufficient budget. Available: ${Math.floor(Number(newBudget.currentAmount))}`,
        );
      }

      await tx
        .update(budgets)
        .set({ currentAmount: String(newBudgetAmount), updatedAt: now })
        .where(eq(budgets.id, data.budgetId));
    } else {
      // Budget is the same, just adjust the difference
      const [budget] = await tx
        .select()
        .from(budgets)
        .where(eq(budgets.id, data.budgetId));

      if (!budget) throw new Error("Budget not found.");

      // Restore old amount, deduct new amount
      const currentBalance = Number(budget.currentAmount);
      const updatedBalance = currentBalance + oldAmount - newAmount;

      if (updatedBalance < 0) {
        throw new Error(
          `Insufficient budget. You can only increase this expense by ${Math.floor(currentBalance)}`,
        );
      }

      await tx
        .update(budgets)
        .set({ currentAmount: String(updatedBalance), updatedAt: now })
        .where(eq(budgets.id, data.budgetId));
    }

    // 3. Update the expense record
    const [updatedExpense] = await tx
      .update(expenses)
      .set({
        categoryId: data.categoryId,
        budgetId: data.budgetId,
        description: data.description,
        amount: String(data.amount),
        spendingType: data.spendingType,
        dateSpent: data.dateSpent,
        updatedAt: now,
      })
      .where(eq(expenses.id, id))
      .returning();

    return updatedExpense;
  });
}

/**
 * Returns the total expense amount for a given month/year combination.
 * Pass `month = 'all'` to sum the entire year.
 *
 * @param month - Month name (e.g. 'january') or 'all'
 * @param year  - 4-digit year string (defaults to current year)
 */
export async function getMonthlyExpenses(month: string, year: string) {
  const lower = month.toLowerCase();

  if (!isValidMonth(lower)) {
    throw new Error("Invalid month name provided.");
  }

  const yearAll = year === "all";

  let query = db
    .select({ total: sum(expenses.amount) })
    .from(expenses)
    .$dynamic();

  if (lower === "all" && yearAll) {
    // No filter — sum everything
  } else if (lower === "all") {
    query = query.where(
      sql`EXTRACT(YEAR FROM ${expenses.dateSpent}) = ${Number(year)}`,
    );
  } else if (yearAll) {
    const monthNum = getMonthNumber(lower)!;
    query = query.where(
      sql`EXTRACT(MONTH FROM ${expenses.dateSpent}) = ${monthNum}`,
    );
  } else {
    const monthNum = getMonthNumber(lower)!;
    query = query.where(
      and(
        sql`EXTRACT(MONTH FROM ${expenses.dateSpent}) = ${monthNum}`,
        sql`EXTRACT(YEAR FROM ${expenses.dateSpent}) = ${Number(year)}`,
      ),
    );
  }

  const [result] = await query;
  return { total: result?.total ?? "0" };
}

/**
 * Returns total expense amounts grouped by category for a given month/year.
 * Pass `month = 'all'` to cover the entire year.
 *
 * @param month - Month name or 'all'
 * @param year  - 4-digit year string
 */
export async function getExpensesPerCategory(month: string, year: string) {
  const lower = month.toLowerCase();

  if (!isValidMonth(lower)) {
    throw new Error("Invalid month name provided.");
  }

  const yearAll = year === "all";

  let whereClause;

  if (lower === "all" && yearAll) {
    whereClause = undefined;
  } else if (lower === "all") {
    whereClause = sql`EXTRACT(YEAR FROM ${expenses.dateSpent}) = ${Number(year)}`;
  } else if (yearAll) {
    const monthNum = getMonthNumber(lower)!;
    whereClause = sql`EXTRACT(MONTH FROM ${expenses.dateSpent}) = ${monthNum}`;
  } else {
    const monthNum = getMonthNumber(lower)!;
    whereClause = and(
      sql`EXTRACT(MONTH FROM ${expenses.dateSpent}) = ${monthNum}`,
      sql`EXTRACT(YEAR FROM ${expenses.dateSpent}) = ${Number(year)}`,
    );
  }

  const query = db
    .select({
      category: categories.name,
      amount: sum(expenses.amount),
    })
    .from(expenses)
    .leftJoin(categories, eq(expenses.categoryId, categories.id))
    .groupBy(categories.name);

  const results = whereClause ? await query.where(whereClause) : await query;

  return results.map((r) => ({
    category: r.category ?? "Unknown",
    amount: r.amount ?? "0",
  }));
}
