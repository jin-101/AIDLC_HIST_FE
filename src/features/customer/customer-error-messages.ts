import { CustomerApiError } from "./customer-api";

export function customerErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof CustomerApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
