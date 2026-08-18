import { apiFetch } from './api-client';

export type Budget = {
  id: number;
  name: string;
  currentAmount: string;
  totalAmount: string;
  createdAt: string;
  updatedAt: string;
};

export interface BudgetCardView {
  id: number;
  name: string;
  currentAmount: string;
  totalAmount: string;
}

export const budgetsApi = {
  getAll: (component?: 'card' | 'dropdown' | 'lookup') => {
    const query = component ? `?component=${component}` : '';
    return apiFetch<Budget[]>(`/budgets${query}`);
  },

  create: (data: { name: string; totalAmount: number }) => 
    apiFetch<Budget>('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { name: string; totalAmount: number }) => 
    apiFetch<Budget>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adjust: (id: number, data: { amount: number; type: 'increment' | 'decrement' | 'move'; accountId?: number; reason?: string }) => 
    apiFetch<Budget>(`/budgets/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  move: (id: number, data: { targetBudgetId: number; amount: number }) =>
    apiFetch<Budget>(`/budgets/${id}/move`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<Budget>(`/budgets/${id}`, { method: 'DELETE' }),
};
