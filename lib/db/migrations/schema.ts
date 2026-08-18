import {
  pgTable,
  unique,
  bigserial,
  varchar,
  timestamp,
  foreignKey,
  bigint,
  text,
  numeric,
  serial,
  integer,
  index,
  smallint,
  date,
  check,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const users = pgTable(
  "users",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { mode: "string" }),
    password: varchar({ length: 255 }).notNull(),
    rememberToken: varchar("remember_token", { length: 100 }),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [unique("users_email_unique").on(table.email)],
);

export const expensePrompts = pgTable(
  "expense_prompts",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    promptText: text("prompt_text").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  }
);

export const accounts = pgTable(
  "accounts",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    type: varchar({ length: 255 }).notNull(),
    balance: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  }
);

export const migrations = pgTable("migrations", {
  id: serial().primaryKey().notNull(),
  migration: varchar({ length: 255 }).notNull(),
  batch: integer().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  email: varchar({ length: 255 }).primaryKey().notNull(),
  token: varchar({ length: 255 }).notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
});

export const sessions = pgTable(
  "sessions",
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    // You can use { mode: "number" } if numbers are exceeding js number limitations
    userId: bigint("user_id", { mode: "number" }),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    payload: text().notNull(),
    lastActivity: integer("last_activity").notNull(),
  },
  (table) => [
    index().using("btree", table.lastActivity.asc().nullsLast().op("int4_ops")),
    index().using("btree", table.userId.asc().nullsLast().op("int8_ops")),
  ],
);

export const cache = pgTable("cache", {
  key: varchar({ length: 255 }).primaryKey().notNull(),
  value: text().notNull(),
  expiration: integer().notNull(),
});

export const cacheLocks = pgTable("cache_locks", {
  key: varchar({ length: 255 }).primaryKey().notNull(),
  owner: varchar({ length: 255 }).notNull(),
  expiration: integer().notNull(),
});

export const jobs = pgTable(
  "jobs",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    queue: varchar({ length: 255 }).notNull(),
    payload: text().notNull(),
    attempts: smallint().notNull(),
    reservedAt: integer("reserved_at"),
    availableAt: integer("available_at").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [
    index().using("btree", table.queue.asc().nullsLast().op("text_ops")),
  ],
);

export const jobBatches = pgTable("job_batches", {
  id: varchar({ length: 255 }).primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  totalJobs: integer("total_jobs").notNull(),
  pendingJobs: integer("pending_jobs").notNull(),
  failedJobs: integer("failed_jobs").notNull(),
  failedJobIds: text("failed_job_ids").notNull(),
  options: text(),
  cancelledAt: integer("cancelled_at"),
  createdAt: integer("created_at").notNull(),
  finishedAt: integer("finished_at"),
});

export const failedJobs = pgTable(
  "failed_jobs",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    uuid: varchar({ length: 255 }).notNull(),
    connection: text().notNull(),
    queue: text().notNull(),
    payload: text().notNull(),
    exception: text().notNull(),
    failedAt: timestamp("failed_at", { mode: "string" })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [unique("failed_jobs_uuid_unique").on(table.uuid)],
);

export const personalAccessTokens = pgTable(
  "personal_access_tokens",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    tokenableType: varchar("tokenable_type", { length: 255 }).notNull(),
    // You can use { mode: "number" } if numbers are exceeding js number limitations
    tokenableId: bigint("tokenable_id", { mode: "number" }).notNull(),
    name: text().notNull(),
    token: varchar({ length: 64 }).notNull(),
    abilities: text(),
    lastUsedAt: timestamp("last_used_at", { mode: "string" }),
    expiresAt: timestamp("expires_at", { mode: "string" }),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    index().using(
      "btree",
      table.tokenableType.asc().nullsLast().op("int8_ops"),
      table.tokenableId.asc().nullsLast().op("int8_ops"),
    ),
    unique("personal_access_tokens_token_unique").on(table.token),
  ],
);

export const categories = pgTable("categories", {
  id: bigserial({ mode: "number" }).primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  notes: text(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const savings = pgTable("savings", {
  id: bigserial({ mode: "number" }).primaryKey().notNull(),
  goalName: varchar("goal_name", { length: 255 }).notNull(),
  targetAmount: numeric("target_amount", { precision: 15, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", {
    precision: 15,
    scale: 2,
  }).notNull(),
  startDate: date("start_date").notNull(),
  targetDate: date("target_date").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const income = pgTable("income", {
  id: bigserial({ mode: "number" }).primaryKey().notNull(),
  source: varchar({ length: 255 }).notNull(),
  amount: numeric({ precision: 15, scale: 2 }).default("0").notNull(),
  dateAcquired: date("date_acquired").notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const expenses = pgTable(
  "expenses",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    description: text(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    spendingType: varchar("spending_type", { length: 255 }).notNull(),
    dateSpent: date("date_spent").notNull(),
    // You can use { mode: "number" } if numbers are exceeding js number limitations
    categoryId: bigint("category_id", { mode: "number" }),
    userId: uuid("user_id").notNull(),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
    // You can use { mode: "number" } if numbers are exceeding js number limitations
    budgetId: bigint("budget_id", { mode: "number" }),
  },
  (table) => [
    foreignKey({
      columns: [table.budgetId],
      foreignColumns: [budgets.id],
      name: "expenses_budget_id_foreign",
    }).onDelete("set null"),
    foreignKey({
      columns: [table.categoryId],
      foreignColumns: [categories.id],
      name: "expenses_category_id_foreign",
    }).onDelete("set null"),
  ],
);

export const budgets = pgTable("budgets", {
  id: bigserial({ mode: "number" }).primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 15, scale: 2 })
    .default("0")
    .notNull(),
  totalAmount: numeric("total_amount", { precision: 15, scale: 2 }).notNull(),
  userId: uuid("user_id").notNull(),
  createdAt: timestamp("created_at", { mode: "string" }),
  updatedAt: timestamp("updated_at", { mode: "string" }),
});

export const adjustmentLogs = pgTable(
  "adjustment_logs",
  {
    id: bigserial({ mode: "number" }).primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    loggableType: varchar("loggable_type", { length: 255 }).notNull(),
    // You can use { mode: "number" } if numbers are exceeding js number limitations
    loggableId: bigint("loggable_id", { mode: "number" }).notNull(),
    type: varchar({ length: 255 }).notNull(),
    amount: numeric({ precision: 15, scale: 2 }).notNull(),
    // You can use { mode: "number" } if numbers are exceeding js number limitations
    accountId: bigint("account_id", { mode: "number" }),
    reason: varchar({ length: 255 }),
    createdAt: timestamp("created_at", { mode: "string" }),
    updatedAt: timestamp("updated_at", { mode: "string" }),
  },
  (table) => [
    index().using(
      "btree",
      table.loggableType.asc().nullsLast().op("int8_ops"),
      table.loggableId.asc().nullsLast().op("int8_ops"),
    ),
    foreignKey({
      columns: [table.accountId],
      foreignColumns: [accounts.id],
      name: "adjustment_logs_account_id_foreign",
    }).onDelete("set null"),
    check(
      "adjustment_logs_type_check",
      sql`(type)::text = ANY ((ARRAY['increment'::character varying, 'decrement'::character varying])::text[])`,
    ),
  ],
);
