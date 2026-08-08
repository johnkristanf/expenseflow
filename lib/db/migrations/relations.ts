import { relations } from "drizzle-orm/relations";
import { users, expensePrompts, accounts, budgets, expenses, categories, adjustmentLogs } from "./schema";

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
}));

export const budgetsRelations = relations(budgets, ({many}) => ({
	expenses: many(expenses),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	expenses: many(expenses),
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