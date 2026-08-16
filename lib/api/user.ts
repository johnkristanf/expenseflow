import { apiFetch } from './api-client';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
}

/**
 * Fetches the current authenticated user's profile from the API.
 */
export async function getUser(): Promise<User> {
  return apiFetch<User>('/user');
}
