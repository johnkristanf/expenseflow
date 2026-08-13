import { apiFetch } from './api-client';

export type Saving = {
  id: number;
  goalName: string;
  targetAmount: string;
  currentAmount: string;
  startDate: string;
  targetDate: string;
  createdAt?: string;
  updatedAt?: string;
};

export const savingsApi = {
  getAll: () => apiFetch<Saving[]>('/savings'),

  create: (data: { goalName: string; targetAmount: number; currentAmount?: number; startDate: string; targetDate: string }) => 
    apiFetch<Saving>('/savings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { goalName: string; targetAmount: number; startDate: string; targetDate: string }) => 
    apiFetch<Saving>(`/savings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<{ message: string }>(`/savings/${id}`, { method: 'DELETE' }),

  adjust: (id: number, data: { amount: number; type: 'increment' | 'decrement'; accountId?: number; reason?: string }) => 
    apiFetch<Saving>(`/savings/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
