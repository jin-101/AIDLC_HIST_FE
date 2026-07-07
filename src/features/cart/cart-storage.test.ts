import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { CartState, TableContext } from "@/features/customer/types";
import { createEmptyCart } from "./cart-service";
import { parseCart, readCart, serializeCart, writeCart, type StorageLike } from "./cart-storage";

function memoryStorage(initial: Record<string, string> = {}): StorageLike {
  const store = new Map(Object.entries(initial));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key)
  };
}

const context: TableContext = {
  storeId: "store-1",
  storeCode: "demo-store",
  tableId: "table-1",
  tableNumber: "1",
  sessionId: "session-1",
  savedAt: "2026-01-01T00:00:00.000Z"
};

describe("cart-storage", () => {
  it("손상된 JSON은 empty cart로 fallback한다", () => {
    expect(parseCart("{", context)).toMatchObject({ items: [], totalAmount: 0, sessionId: context.sessionId });
  });

  it("session scope가 다르면 empty cart로 fallback한다", () => {
    const cart: CartState = { ...createEmptyCart(context), sessionId: "other-session" };

    expect(parseCart(JSON.stringify(cart), context)).toMatchObject({ items: [], totalAmount: 0, sessionId: context.sessionId });
  });

  it("storage에 cart를 저장하고 다시 읽을 수 있다", () => {
    const storage = memoryStorage();
    const cart: CartState = {
      ...createEmptyCart(context),
      items: [{ menuItemId: "menu-1", menuName: "메뉴", categoryId: "category-1", quantity: 2, unitPrice: 3000, lineTotal: 0 }]
    };

    writeCart(cart, storage);

    expect(readCart(context, storage)).toMatchObject({
      items: [{ menuItemId: "menu-1", quantity: 2, lineTotal: 6000 }],
      totalAmount: 6000
    });
  });

  it("PBT: serialization round-trip은 cart 의미를 보존한다", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            menuItemId: fc.uuid(),
            menuName: fc.string({ minLength: 1, maxLength: 20 }),
            categoryId: fc.uuid(),
            quantity: fc.integer({ min: 1, max: 20 }),
            unitPrice: fc.integer({ min: 1, max: 100_000 })
          }),
          { maxLength: 30 }
        ),
        (items) => {
          const cart: CartState = {
            ...createEmptyCart(context),
            items: items.map((item) => ({ ...item, lineTotal: 0 }))
          };
          const parsed = parseCart(serializeCart(cart), context);
          expect(parsed.items.map((item) => [item.menuItemId, item.quantity, item.unitPrice, item.lineTotal])).toEqual(
            items.map((item) => [item.menuItemId, item.quantity, item.unitPrice, item.quantity * item.unitPrice])
          );
          expect(parsed.totalAmount).toBe(items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));
        }
      )
    );
  });
});
