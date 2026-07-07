import type { CartState, TableContext } from "@/features/customer/types";
import { createEmptyCart, isSameScope, recalculateCart } from "./cart-service";

export const CART_STORAGE_KEY = "table-order:customer:cart";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function browserStorage(): StorageLike | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function isCartState(value: unknown): value is CartState {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<CartState>;
  return (
    typeof candidate.storeId === "string" &&
    typeof candidate.tableId === "string" &&
    typeof candidate.sessionId === "string" &&
    Array.isArray(candidate.items) &&
    typeof candidate.totalAmount === "number" &&
    typeof candidate.updatedAt === "string"
  );
}

export function serializeCart(cart: CartState): string {
  return JSON.stringify(recalculateCart(cart));
}

export function parseCart(raw: string | null, context: TableContext): CartState {
  if (!raw) return createEmptyCart(context);

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isCartState(parsed)) return createEmptyCart(context);
    const normalized = recalculateCart(parsed);
    return isSameScope(context, normalized) ? normalized : createEmptyCart(context);
  } catch {
    return createEmptyCart(context);
  }
}

export function readCart(context: TableContext, storage: StorageLike | null = browserStorage()): CartState {
  if (!storage) return createEmptyCart(context);
  return parseCart(storage.getItem(CART_STORAGE_KEY), context);
}

export function writeCart(cart: CartState, storage: StorageLike | null = browserStorage()): void {
  if (!storage) return;
  storage.setItem(CART_STORAGE_KEY, serializeCart(cart));
}

export function clearCart(storage: StorageLike | null = browserStorage()): void {
  storage?.removeItem(CART_STORAGE_KEY);
}
