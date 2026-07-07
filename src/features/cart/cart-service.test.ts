import { describe, expect, it } from "vitest";
import fc from "fast-check";
import type { MenuItem } from "@/lib/types/domain";
import type { CartState, TableContext } from "@/features/customer/types";
import {
  addItem,
  createEmptyCart,
  decreaseQuantity,
  increaseQuantity,
  removeItem,
  toOrderDraft
} from "./cart-service";

const context: TableContext = {
  storeId: "store-1",
  storeCode: "demo-store",
  tableId: "table-1",
  tableNumber: "1",
  sessionId: "session-1",
  savedAt: "2026-01-01T00:00:00.000Z"
};

function menuItem(id: string, price: number): MenuItem {
  return {
    id,
    storeId: context.storeId,
    categoryId: "category-1",
    name: `메뉴 ${id}`,
    description: "테스트 메뉴",
    price,
    displayOrder: 1,
    isAvailable: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
}

function expectedTotal(cart: CartState): number {
  return cart.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

describe("cart-service", () => {
  it("같은 메뉴를 다시 담으면 항목을 중복하지 않고 수량을 증가시킨다", () => {
    const cart = addItem(addItem(createEmptyCart(context), menuItem("menu-1", 9000)), menuItem("menu-1", 9000));

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]?.quantity).toBe(2);
    expect(cart.totalAmount).toBe(18000);
  });

  it("수량 감소 결과가 0이면 항목을 제거한다", () => {
    const cart = decreaseQuantity(addItem(createEmptyCart(context), menuItem("menu-1", 9000)), "menu-1");

    expect(cart.items).toHaveLength(0);
    expect(cart.totalAmount).toBe(0);
  });

  it("빈 장바구니는 주문 초안을 만들 수 없다", () => {
    expect(() => toOrderDraft(context, createEmptyCart(context))).toThrow("주문할 수 있는 장바구니가 없습니다.");
  });

  it("PBT: cart total은 항상 line total 합과 같다", () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ id: fc.uuid(), price: fc.integer({ min: 1, max: 100_000 }) }), { maxLength: 30 }),
        (items) => {
          const cart = items.reduce((current, item) => addItem(current, menuItem(item.id, item.price)), createEmptyCart(context));
          expect(cart.totalAmount).toBe(expectedTotal(cart));
        }
      )
    );
  });

  it("PBT: 수량 조작은 음수 수량을 만들지 않는다", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), fc.integer({ min: 1, max: 80 }), (increaseCount, decreaseCount) => {
        let cart = addItem(createEmptyCart(context), menuItem("menu-1", 1000));
        for (let index = 0; index < increaseCount; index += 1) cart = increaseQuantity(cart, "menu-1");
        for (let index = 0; index < decreaseCount; index += 1) cart = decreaseQuantity(cart, "menu-1");

        expect(cart.items.every((item) => item.quantity > 0)).toBe(true);
        expect(cart.totalAmount).toBe(expectedTotal(cart));
      })
    );
  });

  it("PBT: 주문 초안 총액은 cart total과 일치한다", () => {
    fc.assert(
      fc.property(fc.array(fc.integer({ min: 1, max: 10_000 }), { minLength: 1, maxLength: 20 }), (prices) => {
        const cart = prices.reduce((current, price, index) => addItem(current, menuItem(`menu-${index}`, price)), createEmptyCart(context));
        const draft = toOrderDraft(context, cart);
        expect(draft.totalAmount).toBe(cart.totalAmount);
        expect(draft.items.reduce((sum, item) => sum + item.lineTotal, 0)).toBe(cart.totalAmount);
      })
    );
  });

  it("removeItem은 대상 항목만 제거한다", () => {
    const cart = addItem(addItem(createEmptyCart(context), menuItem("menu-1", 1000)), menuItem("menu-2", 2000));

    const next = removeItem(cart, "menu-1");

    expect(next.items.map((item) => item.menuItemId)).toEqual(["menu-2"]);
    expect(next.totalAmount).toBe(2000);
  });
});
