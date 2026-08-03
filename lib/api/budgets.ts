import { apiFetch } from './api-client';

export type Budget = {
  id: number;
  name: string;
  currentAmount: string;
  totalAmount: string;
  budgetPeriod: string;
  createdAt: string;
  updatedAt: string;
};

export const budgetsApi = {
  getAll: (component?: 'card' | 'dropdown') => {
    const query = component ? `?component=${component}` : '';
    return apiFetch<any[]>(`/budgets${query}`);
  },

  create: (data: { name: string; totalAmount: number; budgetPeriod: string }) => 
    apiFetch<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { name: string; totalAmount: number; budgetPeriod: string }) => 
    apiFetch<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adjust: (id: number, data: { amount: number; type: 'increment' | 'decrement'; accountId?: number; reason?: string }) => 
    apiFetch<Budget>(`/budgets/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
