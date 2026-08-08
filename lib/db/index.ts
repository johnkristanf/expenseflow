import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Teach JSON.stringify how to handle BigInt values returned by Drizzle/postgres.js.
 * This is the single-point fix — no individual route needs to be changed.
 */
// @ts-expect-error — BigInt has no toJSON in the TS lib, but this is valid at runtime
BigInt.prototype.toJSON = function () {
  return Number(this);
};

/**
 * Singleton Drizzle client connected to Supabase via the direct Postgres URL.
 * Uses `postgres` (pg driver) under the hood.
 * Re-uses a single connection pool across the Next.js server lifetime.
 */
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });

