"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { MenuItem } from "@/lib/types/domain";
import type { CartState, TableContext } from "@/features/customer/types";
import { addItem, cartItemCount, clearCartItems, createEmptyCart, decreaseQuantity, increaseQuantity, removeItem } from "./cart-service";
import { readCart, writeCart } from "./cart-storage";

export function useCart(context: TableContext | null) {
  const [cart, setCart] = useState<CartState | null>(null);

  useEffect(() => {
    setCart(context ? readCart(context) : null);
  }, [context]);

  const persist = useCallback((next: CartState) => {
    setCart(next);
    writeCart(next);
  }, []);

  const add = useCallback((item: MenuItem) => {
    if (!context) return;
    persist(addItem(cart ?? createEmptyCart(context), item));
  }, [cart, context, persist]);

  const increase = useCallback((menuItemId: string) => {
    if (cart) persist(increaseQuantity(cart, menuItemId));
  }, [cart, persist]);

  const decrease = useCallback((menuItemId: string) => {
    if (cart) persist(decreaseQuantity(cart, menuItemId));
  }, [cart, persist]);

  const remove = useCallback((menuItemId: string) => {
    if (cart) persist(removeItem(cart, menuItemId));
  }, [cart, persist]);

  const clear = useCallback(() => {
    if (cart) persist(clearCartItems(cart));
  }, [cart, persist]);

  const itemCount = useMemo(() => (cart ? cartItemCount(cart) : 0), [cart]);

  return { cart, itemCount, add, increase, decrease, remove, clear, setCart: persist };
}
