import { apiFetch } from './api-client';

export type Expense = {
  id: number;
  description: string;
  amount: string;
  spendingType: string;
  dateSpent: string;
  categoryId: number | null;
  budgetId: number | null;
  createdAt: string;
  budget: { id: number; name: string } | null;
  category: { id: number; name: string } | null;
};

export const expensesApi = {
  getAll: () => apiFetch<Expense[]>('/expenses'),
  
  create: (data: {
    categoryId: number;
    budgetId: number;
    description: string;
    amount: number;
    spendingType: string;
    dateSpent: string;
  }) => apiFetch<Expense>('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  update: (id: number, data: {
    categoryId: number;
    budgetId: number;
    description: string;
    amount: number;
    spendingType: string;
    dateSpent: string;
  }) => apiFetch<Expense>(`/expenses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (id: number) => 
    apiFetch<{ message: string }>(`/expenses/${id}`, { method: 'DELETE' }),


  getMonthly: (month: string, year: string) => 
    apiFetch<{ total: string }>(`/expenses/monthly?month=${month}&year=${year}`),

  getPerCategory: (month: string, year: string) => 
    apiFetch<Array<{ category: string; amount: string }>>(`/expenses/category?month=${month}&year=${year}`),
};
