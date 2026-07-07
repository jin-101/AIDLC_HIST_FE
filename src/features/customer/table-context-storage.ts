import type { TableContext } from "./types";
import type { StorageLike } from "@/features/cart/cart-storage";

export const TABLE_CONTEXT_STORAGE_KEY = "table-order:customer:table-context";

function browserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function isTableContext(value: unknown): value is TableContext {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TableContext>;
  return (
    typeof candidate.storeId === "string" &&
    typeof candidate.storeCode === "string" &&
    typeof candidate.tableId === "string" &&
    typeof candidate.tableNumber === "string" &&
    typeof candidate.sessionId === "string" &&
    typeof candidate.savedAt === "string"
  );
}

export function parseTableContext(raw: string | null): TableContext | null {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isTableContext(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readTableContext(storage: StorageLike | null = browserStorage()): TableContext | null {
  if (!storage) return null;
  return parseTableContext(storage.getItem(TABLE_CONTEXT_STORAGE_KEY));
}

export function writeTableContext(context: TableContext, storage: StorageLike | null = browserStorage()): void {
  if (!storage) return;
  storage.setItem(TABLE_CONTEXT_STORAGE_KEY, JSON.stringify(context));
}

export function clearTableContext(storage: StorageLike | null = browserStorage()): void {
  storage?.removeItem(TABLE_CONTEXT_STORAGE_KEY);
}
