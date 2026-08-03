import { db } from '@/lib/db';
import { accounts } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

/**
 * Fetches all accounts for a given user, ordered by creation date descending.
 */
export async function getAccounts(userId: string) {
  return db
    .select({ id: accounts.id, name: accounts.name, type: accounts.type, balance: accounts.balance })
    .from(accounts)
    .where(eq(accounts.userId, userId as unknown as number))
    .orderBy(desc(accounts.createdAt));
}

/**
 * Creates a new account for a user.
 */
export async function createAccount(userId: string, data: { name: string; type: string; balance: number }) {
  const [account] = await db
    .insert(accounts)
    .values({ userId: userId as unknown as number, name: data.name, type: data.type, balance: String(data.balance) })
    .returning();
  return account;
}

/**
 * Updates an account. Enforces ownership via userId.
 * @throws If account is not found
 */
export async function updateAccount(id: number, userId: string, data: { name: string; type: string; balance: number }) {
  const [updated] = await db
    .update(accounts)
    .set({ name: data.name, type: data.type, balance: String(data.balance) })
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId as unknown as number)))
    .returning();
  if (!updated) throw new Error('Account not found.');
  return updated;
}

/**
 * Deletes an account. Enforces ownership via userId.
 * @throws If account is not found
 */
export async function deleteAccount(id: number, userId: string) {
  const [deleted] = await db
    .delete(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId as unknown as number)))
    .returning();
  if (!deleted) throw new Error('Account not found.');
}

/**
 * Adjusts an account balance (increment/decrement).
 * @throws On insufficient balance or account not found
 */
export async function adjustAccountBalance(id: number, userId: string, data: { amount: number; type: 'increment' | 'decrement' }) {
  const [account] = await db
    .select()
    .from(accounts)
    .where(and(eq(accounts.id, id), eq(accounts.userId, userId as unknown as number)));

  if (!account) throw new Error('Account not found.');

  const newBalance =
    data.type === 'decrement'
      ? Number(account.balance) - data.amount
      : Number(account.balance) + data.amount;

  if (newBalance < 0) throw new Error('Insufficient account balance for this deduction.');

  const [updated] = await db
    .update(accounts)
    .set({ balance: String(newBalance) })
    .where(eq(accounts.id, id))
    .returning();

  return updated;
}
