import type { StorageLike } from "@/features/cart/cart-storage";
import type { AdminSession } from "./types";

export const ADMIN_SESSION_STORAGE_KEY = "table-order:admin:session";

function browserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function isAdminSession(value: unknown): value is AdminSession {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AdminSession>;
  return (
    typeof candidate.storeId === "string" &&
    typeof candidate.storeCode === "string" &&
    typeof candidate.storeName === "string" &&
    candidate.loggedIn === true &&
    typeof candidate.savedAt === "string"
  );
}

export function parseAdminSession(raw: string | null): AdminSession | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    return isAdminSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readAdminSession(storage: StorageLike | null = browserStorage()): AdminSession | null {
  if (!storage) return null;
  return parseAdminSession(storage.getItem(ADMIN_SESSION_STORAGE_KEY));
}

export function writeAdminSession(session: AdminSession, storage: StorageLike | null = browserStorage()): void {
  storage?.setItem(ADMIN_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession(storage: StorageLike | null = browserStorage()): void {
  storage?.removeItem(ADMIN_SESSION_STORAGE_KEY);
}
