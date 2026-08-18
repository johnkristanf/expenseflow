import { relations } from "drizzle-orm/relations";
import { users, expensePrompts, accounts, budgets, expenses, categories, adjustmentLogs, savings, income } from "./schema";

export const expensePromptsRelations = relations(expensePrompts, ({one}) => ({
	user: one(users, {
		fields: [expensePrompts.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	expensePrompts: many(expensePrompts),
	accounts: many(accounts),
	adjustmentLogs: many(adjustmentLogs),
	budgets: many(budgets),
	expenses: many(expenses),
	categories: many(categories),
	savings: many(savings),
	income: many(income),
}));

export const accountsRelations = relations(accounts, ({one, many}) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	}),
	adjustmentLogs: many(adjustmentLogs),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	budget: one(budgets, {
		fields: [expenses.budgetId],
		references: [budgets.id]
	}),
	category: one(categories, {
		fields: [expenses.categoryId],
		references: [categories.id]
	}),
	user: one(users, {
		fields: [expenses.userId],
		references: [users.id]
	}),
}));

export const budgetsRelations = relations(budgets, ({one, many}) => ({
	expenses: many(expenses),
	user: one(users, {
		fields: [budgets.userId],
		references: [users.id]
	}),
}));

export const categoriesRelations = relations(categories, ({one, many}) => ({
	expenses: many(expenses),
	user: one(users, {
		fields: [categories.userId],
		references: [users.id]
	}),
}));

export const adjustmentLogsRelations = relations(adjustmentLogs, ({one}) => ({
	account: one(accounts, {
		fields: [adjustmentLogs.accountId],
		references: [accounts.id]
	}),
	user: one(users, {
		fields: [adjustmentLogs.userId],
		references: [users.id]
	}),
}));

export const savingsRelations = relations(savings, ({one}) => ({
	user: one(users, {
		fields: [savings.userId],
		references: [users.id]
	}),
}));

export const incomeRelations = relations(income, ({one}) => ({
	user: one(users, {
		fields: [income.userId],
		references: [users.id]
	}),
}));