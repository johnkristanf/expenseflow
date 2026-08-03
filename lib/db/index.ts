import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Singleton Drizzle client connected to Supabase via the direct Postgres URL.
 * Uses `postgres` (pg driver) under the hood.
 * Re-uses a single connection pool across the Next.js server lifetime.
 */
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
