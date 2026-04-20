import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export interface ApiErrorPayload {
  error?: { message?: string; details?: unknown };
}

export const extractErrorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (err instanceof AxiosError) {
    const data = err.response?.data as ApiErrorPayload | undefined;
    return data?.error?.message ?? err.message ?? fallback;
  }
  if (err instanceof Error) return err.message;
  return fallback;
};
