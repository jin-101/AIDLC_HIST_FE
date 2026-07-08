import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { CartState, TableContext } from "@/features/customer/types";
import { addItem, createEmptyCart, toOrderDraft } from "@/features/cart/cart-service";
import type { MenuItem } from "@/lib/types/domain";
import { orderItemsInputArb } from "@/test/generators/domain-generators";

const context: TableContext = {
  storeId: "store-1",
  storeCode: "demo-store",
  tableId: "table-1",
  tableNumber: "1",
  sessionId: "session-1",
  savedAt: "2026-01-01T00:00:00.000Z"
};

const menuItem: MenuItem = {
  id: "menu-1",
  storeId: "store-1",
  categoryId: "category-1",
  name: "김치볶음밥",
  description: "매콤한 김치볶음밥",
  price: 9000,
  displayOrder: 1,
  isAvailable: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
};

function cloneCart(cart: CartState): CartState {
  return JSON.parse(JSON.stringify(cart)) as CartState;
}

describe("order submit behavior", () => {
  it("주문 draft 생성은 cart를 변경하지 않아 실패 후 cart 보존이 가능하다", () => {
    const cart = addItem(createEmptyCart(context), menuItem);
    const before = cloneCart(cart);

    const draft = toOrderDraft(context, cart);

    expect(draft.totalAmount).toBe(9000);
    expect(cart).toEqual(before);
  });

  it("PBT: 주문 draft payload 총액은 item line total 합과 일치한다", () => {
    fc.assert(
      fc.property(orderItemsInputArb, (items) => {
        const cart = items.reduce(
          (current, item) =>
            addItem(current, {
              ...menuItem,
              id: item.menuItemId,
              name: item.menuName,
              price: item.unitPrice
            }),
          createEmptyCart(context)
        );

        const draft = toOrderDraft(context, cart);

        expect(draft.items.every((item) => item.quantity > 0)).toBe(true);
        expect(draft.items.every((item) => item.unitPrice > 0)).toBe(true);
        expect(draft.totalAmount).toBe(draft.items.reduce((sum, item) => sum + item.lineTotal, 0));
      })
    );
  });
});
