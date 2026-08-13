import { apiFetch } from './api-client';

export type Category = {
  id: number;
  name: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export const categoriesApi = {
  getAll: () => apiFetch<Category[]>('/categories'),

  create: (data: { name: string; notes?: string | null }) =>
    apiFetch<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { name: string; notes?: string | null }) =>
    apiFetch<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    apiFetch<{ message: string }>(`/categories/${id}`, { method: 'DELETE' }),
};
