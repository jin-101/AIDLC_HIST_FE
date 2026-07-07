import type { MenuItem } from "@/lib/types/domain";
import type { CartItem, CartState, OrderDraft, TableContext } from "@/features/customer/types";

function now(): string {
  return new Date().toISOString();
}

export function createEmptyCart(context: TableContext): CartState {
  return {
    storeId: context.storeId,
    tableId: context.tableId,
    sessionId: context.sessionId,
    items: [],
    totalAmount: 0,
    updatedAt: now()
  };
}

export function recalculateCart(cart: CartState): CartState {
  const items = cart.items
    .filter((item) => Number.isInteger(item.quantity) && item.quantity > 0 && Number.isInteger(item.unitPrice) && item.unitPrice > 0)
    .map((item) => ({ ...item, lineTotal: item.quantity * item.unitPrice }));

  return {
    ...cart,
    items,
    totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
    updatedAt: now()
  };
}

export function addItem(cart: CartState, item: MenuItem): CartState {
  const existing = cart.items.find((cartItem) => cartItem.menuItemId === item.id);
  const items = existing
    ? cart.items.map((cartItem) =>
        cartItem.menuItemId === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
      )
    : [
        ...cart.items,
        {
          menuItemId: item.id,
          menuName: item.name,
          categoryId: item.categoryId,
          quantity: 1,
          unitPrice: item.price,
          lineTotal: item.price
        }
      ];

  return recalculateCart({ ...cart, items });
}

export function increaseQuantity(cart: CartState, menuItemId: string): CartState {
  return recalculateCart({
    ...cart,
    items: cart.items.map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: item.quantity + 1 } : item))
  });
}

export function decreaseQuantity(cart: CartState, menuItemId: string): CartState {
  return recalculateCart({
    ...cart,
    items: cart.items
      .map((item) => (item.menuItemId === menuItemId ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0)
  });
}

export function removeItem(cart: CartState, menuItemId: string): CartState {
  return recalculateCart({ ...cart, items: cart.items.filter((item) => item.menuItemId !== menuItemId) });
}

export function clearCartItems(cart: CartState): CartState {
  return recalculateCart({ ...cart, items: [] });
}

export function cartItemCount(cart: CartState): number {
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function isSameScope(context: TableContext, cart: CartState): boolean {
  return context.storeId === cart.storeId && context.tableId === cart.tableId && context.sessionId === cart.sessionId;
}

export function toOrderDraft(context: TableContext, cart: CartState): OrderDraft {
  const normalized = recalculateCart(cart);
  if (!isSameScope(context, normalized) || normalized.items.length === 0) {
    throw new Error("주문할 수 있는 장바구니가 없습니다.");
  }

  return {
    storeId: context.storeId,
    tableId: context.tableId,
    sessionId: context.sessionId,
    totalAmount: normalized.totalAmount,
    items: normalized.items.map((item: CartItem) => ({
      menuItemId: item.menuItemId,
      menuName: item.menuName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal
    }))
  };
}
