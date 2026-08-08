-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "users" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified_at" timestamp(0),
	"password" varchar(255) NOT NULL,
	"remember_token" varchar(100),
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "expense_prompts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"prompt_text" text NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"balance" numeric(15, 2) DEFAULT '0' NOT NULL,
	"user_id" bigint NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "migrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"migration" varchar(255) NOT NULL,
	"batch" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"token" varchar(255) NOT NULL,
	"created_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"ip_address" varchar(45),
	"user_agent" text,
	"payload" text NOT NULL,
	"last_activity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cache" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"expiration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cache_locks" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"owner" varchar(255) NOT NULL,
	"expiration" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"queue" varchar(255) NOT NULL,
	"payload" text NOT NULL,
	"attempts" smallint NOT NULL,
	"reserved_at" integer,
	"available_at" integer NOT NULL,
	"created_at" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_batches" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"total_jobs" integer NOT NULL,
	"pending_jobs" integer NOT NULL,
	"failed_jobs" integer NOT NULL,
	"failed_job_ids" text NOT NULL,
	"options" text,
	"cancelled_at" integer,
	"created_at" integer NOT NULL,
	"finished_at" integer
);
--> statement-breakpoint
CREATE TABLE "failed_jobs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"uuid" varchar(255) NOT NULL,
	"connection" text NOT NULL,
	"queue" text NOT NULL,
	"payload" text NOT NULL,
	"exception" text NOT NULL,
	"failed_at" timestamp(0) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "failed_jobs_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "personal_access_tokens" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"tokenable_type" varchar(255) NOT NULL,
	"tokenable_id" bigint NOT NULL,
	"name" text NOT NULL,
	"token" varchar(64) NOT NULL,
	"abilities" text,
	"last_used_at" timestamp(0),
	"expires_at" timestamp(0),
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "personal_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"notes" text,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "savings" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"goal_name" varchar(255) NOT NULL,
	"target_amount" numeric(15, 2) NOT NULL,
	"current_amount" numeric(15, 2) NOT NULL,
	"start_date" date NOT NULL,
	"target_date" date NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "income" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"source" varchar(255) NOT NULL,
	"amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"date_acquired" date NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"description" text,
	"amount" numeric(10, 2) NOT NULL,
	"spending_type" varchar(255) NOT NULL,
	"date_spent" date NOT NULL,
	"category_id" bigint,
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	"budget_id" bigint
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"current_amount" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_amount" numeric(15, 2) NOT NULL,
	"budget_period" date NOT NULL,
	"created_at" timestamp(0),
	"updated_at" timestamp(0)
);
--> statement-breakpoint
CREATE TABLE "adjustment_logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint NOT NULL,
	"loggable_type" varchar(255) NOT NULL,
	"loggable_id" bigint NOT NULL,
	"type" varchar(255) NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"account_id" bigint,
	"reason" varchar(255),
	"created_at" timestamp(0),
	"updated_at" timestamp(0),
	CONSTRAINT "adjustment_logs_type_check" CHECK ((type)::text = ANY ((ARRAY['increment'::character varying, 'decrement'::character varying])::text[]))
);
--> statement-breakpoint
ALTER TABLE "expense_prompts" ADD CONSTRAINT "expense_prompts_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_budget_id_foreign" FOREIGN KEY ("budget_id") REFERENCES "public"."budgets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_category_id_foreign" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_logs" ADD CONSTRAINT "adjustment_logs_account_id_foreign" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "adjustment_logs" ADD CONSTRAINT "adjustment_logs_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sessions_last_activity_index" ON "sessions" USING btree ("last_activity" int4_ops);--> statement-breakpoint
CREATE INDEX "sessions_user_id_index" ON "sessions" USING btree ("user_id" int8_ops);--> statement-breakpoint
CREATE INDEX "jobs_queue_index" ON "jobs" USING btree ("queue" text_ops);--> statement-breakpoint
CREATE INDEX "personal_access_tokens_tokenable_type_tokenable_id_index" ON "personal_access_tokens" USING btree ("tokenable_type" int8_ops,"tokenable_id" int8_ops);--> statement-breakpoint
CREATE INDEX "adjustment_logs_loggable_type_loggable_id_index" ON "adjustment_logs" USING btree ("loggable_type" int8_ops,"loggable_id" int8_ops);
*/