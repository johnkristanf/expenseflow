import { apiFetch } from './api-client';

export type Account = {
  id: number;
  name: string;
  type: string;
  balance: string;
};

export const accountsApi = {
  getAll: () => apiFetch<Account[]>('/accounts'),

  create: (data: { name: string; type: string; balance: number }) => 
    apiFetch<Account>('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { name: string; type: string; balance: number }) => 
    apiFetch<Account>(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) => 
    apiFetch<{ message: string }>(`/accounts/${id}`, { method: 'DELETE' }),

  adjust: (id: number, data: { amount: number; type: 'increment' | 'decrement' }) => 
    apiFetch<Account>(`/accounts/${id}/adjust`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
