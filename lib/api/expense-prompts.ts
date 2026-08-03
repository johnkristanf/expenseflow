import { apiFetch } from './api-client';

export type ExpensePrompt = {
  id: number;
  promptText: string;
  createdAt: string;
};

export const expensePromptsApi = {
  getAll: () => apiFetch<ExpensePrompt[]>('/expense-prompts'),

  create: (data: { promptText: string }) => 
    apiFetch<ExpensePrompt>('/expense-prompts', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: { promptText: string }) => 
    apiFetch<ExpensePrompt>(`/expense-prompts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) => 
    apiFetch<{ message: string }>(`/expense-prompts/${id}`, { method: 'DELETE' }),
};
