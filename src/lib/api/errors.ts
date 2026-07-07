import type { ApiErrorCode, ApiFailure } from "./response";
import { fail } from "./response";

export class AppError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function toApiFailure(error: unknown): ApiFailure {
  if (error instanceof AppError) {
    return fail(error.code, error.message);
  }

  return fail("UNKNOWN_ERROR", "예상하지 못한 오류가 발생했습니다.");
}

export function validationError(message: string): AppError {
  return new AppError("VALIDATION_ERROR", message);
}

export function notFoundError(message: string): AppError {
  return new AppError("NOT_FOUND", message);
}

export function conflictError(message: string): AppError {
  return new AppError("CONFLICT", message);
}

export function persistenceError(message: string, cause?: unknown): AppError {
  return new AppError("PERSISTENCE_ERROR", message, cause);
}
