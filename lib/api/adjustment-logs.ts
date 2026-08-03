import { apiFetch } from './api-client';

export type AdjustmentLog = {
  id: number;
  type: string;
  amount: string;
  reason: string | null;
  createdAt: string;
  account: { id: number; name: string } | null;
};

export const adjustmentLogsApi = {
  getLogs: (domain: 'budgets' | 'savings', id: number) => 
    apiFetch<AdjustmentLog[]>(`/adjustment-logs?domain=${domain}&id=${id}`),
};
