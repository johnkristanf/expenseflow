import { apiFetch } from './api-client';

export type Income = {
  id: number;
  source: string;
  amount: string;
  dateAcquired: string;
  createdAt: string;
};

export const incomeApi = {
  getAll: () => apiFetch<Income[]>('/income'),

  create: (data: { source: string; amount: number; dateAcquired: string }) =>
    apiFetch<Income>('/income', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { source: string; amount: number; dateAcquired: string }) =>
    apiFetch<Income>(`/income/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<{ message: string }>(`/income/${id}`, { method: 'DELETE' }),

  getMonthly: (month: string, year: string) =>
    apiFetch<{ total: string }>(`/income/monthly?month=${month}&year=${year}`),

  getPerSource: (month: string, year: string) =>
    apiFetch<Array<{ source: string; amount: string }>>(`/income/source?month=${month}&year=${year}`),
};
