/**
 * Re-export barrel so that `@/lib/db/schema` resolves correctly.
 * The actual schema lives in lib/db/migrations/schema.ts (Drizzle output).
 */
export * from './migrations/schema';