import { db } from '@/lib/db';
import { savings, accounts, adjustmentLogs } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Fetches all savings goals, ordered by creation date descending.
 * Returns only the columns needed by the UI.
 */
export async function getSavings() {
  return db
    .select({
      id: savings.id,
      goalName: savings.goalName,
      targetAmount: savings.targetAmount,
      currentAmount: savings.currentAmount,
      startDate: savings.startDate,
      targetDate: savings.targetDate,
    })
    .from(savings)
    .orderBy(desc(savings.createdAt));
}

/**
 * Creates a new savings goal.
 * `current_amount` defaults to 0 if not provided.
 */
export async function createSaving(data: {
  goalName: string;
  targetAmount: number;
  currentAmount?: number;
  startDate: string;
  targetDate: string;
}) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const [saving] = await db
    .insert(savings)
    .values({
      goalName: data.goalName,
      targetAmount: String(data.targetAmount),
      currentAmount: String(data.currentAmount ?? 0),
      startDate: data.startDate,
      targetDate: data.targetDate,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return saving;
}

/**
 * Updates a savings goal's metadata (does not touch currentAmount).
 *
 * @throws If the record is not found
 */
export async function updateSaving(
  id: number,
  data: {
    goalName: string;
    targetAmount: number;
    startDate: string;
    targetDate: string;
  }
) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const [updated] = await db
    .update(savings)
    .set({
      goalName: data.goalName,
      targetAmount: String(data.targetAmount),
      startDate: data.startDate,
      targetDate: data.targetDate,
      updatedAt: now,
    })
    .where(eq(savings.id, id))
    .returning();

  if (!updated) throw new Error('Savings record not found or update failed.');
  return updated;
}

/**
 * Adjusts a saving's balance (increment or decrement) in a transaction.
 *
 * - **increment**: deducts `amount` from the linked account, adds it to the saving.
 *   Creates an adjustment log with `type = 'increment'` and the account id.
 * - **decrement**: deducts `amount` from the saving's current balance.
 *   Creates an adjustment log with `type = 'decrement'` and a reason.
 *
 * @throws On insufficient balance or if saving/account is not found
 */
export async function adjustSaving(
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
    const [saving] = await tx.select().from(savings).where(eq(savings.id, id));
    if (!saving) throw new Error('Saving not found.');

    const amount = data.amount;

    if (data.type === 'decrement') {
      const newBalance = Number(saving.currentAmount) - amount;
      if (newBalance < 0) {
        throw new Error('Insufficient savings balance for this deduction.');
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await tx
        .update(savings)
        .set({ currentAmount: String(newBalance), updatedAt: now })
        .where(eq(savings.id, id));

      await tx.insert(adjustmentLogs).values({
        userId: userId as unknown as number,
        loggableType: 'App\\Models\\Savings',
        loggableId: id,
        type: 'decrement',
        amount: String(amount),
        reason: data.reason ?? null,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      if (!data.accountId) throw new Error('account_id is required for increment.');

      const [account] = await tx
        .select()
        .from(accounts)
        .where(eq(accounts.id, data.accountId));

      if (!account || account.userId !== (userId as unknown as number)) {
        throw new Error('Account not found.');
      }

      const newAccountBalance = Number(account.balance) - amount;
      if (newAccountBalance < 0) {
        throw new Error('Insufficient account balance for this addition.');
      }

      const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await tx
        .update(accounts)
        .set({ balance: String(newAccountBalance), updatedAt: now })
        .where(eq(accounts.id, data.accountId));

      await tx
        .update(savings)
        .set({ currentAmount: String(Number(saving.currentAmount) + amount), updatedAt: now })
        .where(eq(savings.id, id));

      await tx.insert(adjustmentLogs).values({
        userId: userId as unknown as number,
        loggableType: 'App\\Models\\Savings',
        loggableId: id,
        type: 'increment',
        amount: String(amount),
        accountId: data.accountId,
        createdAt: now,
        updatedAt: now,
      });
    }

    const [fresh] = await tx.select().from(savings).where(eq(savings.id, id));
    return fresh;
  });
}
