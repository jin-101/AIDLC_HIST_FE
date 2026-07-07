export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "PERSISTENCE_ERROR"
  | "UNKNOWN_ERROR";

export type ApiSuccess<T> = { ok: true; data: T };
export type ApiFailure = {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
};
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function ok<T>(data: T): ApiSuccess<T> {
  return { ok: true, data };
}

export function fail(code: ApiErrorCode, message: string): ApiFailure {
  return { ok: false, error: { code, message } };
}
