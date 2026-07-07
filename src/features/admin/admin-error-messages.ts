import { AdminApiError } from "./admin-api";

export function adminErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AdminApiError) return error.message;
  return fallback;
}
