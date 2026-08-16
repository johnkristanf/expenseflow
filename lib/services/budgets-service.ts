import { db } from '@/lib/db';
import { budgets, accounts, adjustmentLogs } from '@/lib/db/schema';
import { eq, desc, sql } from 'drizzle-orm';

/** Shape returned for the 'card' component view */
type BudgetCardView = {
  id: number;
  name: string;
  currentAmount: string;
  totalAmount: string;
};

/** Shape returned for the 'dropdown' component view */
type BudgetDropdownView = { id: number; name: string };

/**
 * Fetches budgets. Optionally filters selected columns based on UI component.
 *
 * @param component - `'card'` | `'dropdown'` | `'lookup'` | undefined (returns all columns)
 */
export async function getBudgets(component?: string) {
  if (component === 'lookup') {
    return db
      .select()
      .from(budgets)
      .where(sql`${budgets.currentAmount}::numeric > 0`)
      .orderBy(desc(budgets.createdAt))
      .limit(5);
  }
  if (component === 'card') {
    return db
      .select({
        id: budgets.id,
        name: budgets.name,
        currentAmount: budgets.currentAmount,
        totalAmount: budgets.totalAmount,
      })
      .from(budgets)
      .orderBy(desc(budgets.createdAt)) as Promise<BudgetCardView[]>;
  }

  if (component === 'dropdown') {
    return db
      .select({ id: budgets.id, name: budgets.name })
      .from(budgets)
      .orderBy(desc(budgets.createdAt)) as Promise<BudgetDropdownView[]>;
  }

  return db.select().from(budgets).orderBy(desc(budgets.createdAt));
}

/**
 * Creates a new budget. `current_amount` always starts at 0.
 */
export async function createBudget(data: {
  name: string;
  totalAmount: number;
}) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const [budget] = await db
    .insert(budgets)
    .values({
      name: data.name,
      currentAmount: '0',
      totalAmount: String(data.totalAmount),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return budget;
}

/**
 * Updates a budget's name, total amount, and period.
 * Also resets `current_amount` to equal `total_amount` (matching Laravel behaviour).
 *
 * @param id   - Budget ID
 * @param data - Updated fields
 * @throws If the budget is not found
 */
export async function updateBudget(
  id: number,
  data: { name: string; totalAmount: number }
) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

  const [updated] = await db
    .update(budgets)
    .set({
      name: data.name,
      currentAmount: String(data.totalAmount),
      totalAmount: String(data.totalAmount),
      updatedAt: now,
    })
    .where(eq(budgets.id, id))
    .returning();

  if (!updated) throw new Error('Budget not found or not updated.');
  return updated;
}

/**
 * Adjusts a budget's balance (increment or decrement) in a transaction.
 *
 * - **increment**: deducts `amount` from the linked account, adds it to the budget.
 *   Creates an adjustment log with `type = 'increment'` and the account id.
 * - **decrement**: deducts `amount` from the budget.
 *   Creates an adjustment log with `type = 'decrement'` and a reason.
 *
 * @throws On insufficient balance or if budget/account is not found
 */
export async function adjustBudget(
  id: number,
  data: {
    amount: number;
    type: 'increment' | 'decrement';
    accountId?: number;
    reason?: string;
  },
  userId: string
) {
  return db.transaction(async (tx) => {
    const [budget] = await tx.select().from(budgets).where(eq(budgets.id, id));
    if (!budget) throw new Error('Budget not found.');

    const amount = data.amount;

    if (data.type === 'decrement') {
      const newBalance = Number(budget.currentAmount) - amount;
      if (newBalance < 0) {
        throw new Error('Insufficient budget balance for this deduction.');
      }

      await tx
        .update(budgets)
        .set({ currentAmount: String(newBalance) })
        .where(eq(budgets.id, id));

      await tx.insert(adjustmentLogs).values({
        userId,
        loggableType: 'App\\Models\\Budgets',
        loggableId: id,
        type: 'decrement',
        amount: String(amount),
        reason: data.reason ?? null,
      });
    } else {
      // increment — pull from account
      if (!data.accountId) throw new Error('account_id is required for increment.');

      const [account] = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, data.accountId));

      if (!account || account.userId !== userId) {
        throw new Error('Account not found.');
      }

      const newAccountBalance = Number(account.balance) - amount;
      if (newAccountBalance < 0) {
        throw new Error('Insufficient account balance for this addition.');
      }

      await tx
        .update(accounts)
        .set({ balance: String(newAccountBalance) })
        .where(eq(accounts.id, data.accountId));

      await tx
        .update(budgets)
        .set({ currentAmount: String(Number(budget.currentAmount) + amount) })
        .where(eq(budgets.id, id));

      await tx.insert(adjustmentLogs).values({
        userId,
        loggableType: 'App\\Models\\Budgets',
        loggableId: id,
        type: 'increment',
        amount: String(amount),
        accountId: data.accountId,
      });
    }

    const [fresh] = await tx.select().from(budgets).where(eq(budgets.id, id));
    return fresh;
  });
}

/**
 * Deletes a budget by ID.
 *
 * @param id - Budget ID
 * @throws If the budget is not found
 */
export async function deleteBudget(id: number) {
  const [deleted] = await db
    .delete(budgets)
    .where(eq(budgets.id, id))
    .returning();

  if (!deleted) throw new Error('Budget not found or already deleted.');
  return deleted;
}
